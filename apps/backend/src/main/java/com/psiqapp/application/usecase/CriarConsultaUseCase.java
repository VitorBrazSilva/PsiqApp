package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import com.psiqapp.application.port.out.RepositoryPacientePort;
import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.TransactionRunnerPort;
import com.psiqapp.domain.modelo.Consulta;
import com.psiqapp.domain.modelo.StatusConsulta;
import com.psiqapp.domain.validation.ConflitoException;
import com.psiqapp.domain.validation.ErroDeValidacao;
import com.psiqapp.domain.validation.Normalizadores;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

public class CriarConsultaUseCase {
    public record Comando(UUID pacienteId, Instant agendadaPara, String observacoes, UUID chaveIdempotencia) {}

    private static final String OPERACAO = "CRIAR_CONSULTA";
    private final RepositoryPacientePort pacientes;
    private final RepositoryConsultaPort consultas;
    private final IdempotenciaServico idempotencia;
    private final TransactionRunnerPort transacao;
    private final Clock relogio;
    private final VerificarDisponibilidadeConsultaUseCase disponibilidade;
    private final RepositorySincronizacaoConsultaPort sincronizacoes;
    private final ConexaoGoogleAgendaPort conexao;

    public CriarConsultaUseCase(RepositoryPacientePort pacientes, RepositoryConsultaPort consultas,
            IdempotenciaServico idempotencia, TransactionRunnerPort transacao, Clock relogio,
            VerificarDisponibilidadeConsultaUseCase disponibilidade,
            RepositorySincronizacaoConsultaPort sincronizacoes, ConexaoGoogleAgendaPort conexao) {
        this.pacientes = pacientes;
        this.consultas = consultas;
        this.idempotencia = idempotencia;
        this.transacao = transacao;
        this.relogio = relogio;
        this.disponibilidade = disponibilidade;
        this.sincronizacoes = sincronizacoes;
        this.conexao = conexao;
    }

    public Consulta executar(Comando comando) {
        return idempotencia.serializar(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(), () -> {
            var repeticao = transacao.executar(() -> {
                var existente = idempotencia.existente(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(), comando);
                if (existente.isPresent()) {
                    return consultas.buscarPorId(existente.get().recursoId()).orElseThrow(ConflitoException::new);
                }
                validar(comando);
                if (pacientes.buscarPorId(comando.pacienteId()).isEmpty()) throw new RecursoNaoEncontradoException();
                return null;
            });
            if (repeticao != null) return repeticao;

            var verificacao = disponibilidade.executar(comando.agendadaPara());
            if (verificacao.estado() == VerificarDisponibilidadeConsultaUseCase.Estado.OCUPADO) {
                throw new ConflitoException();
            }
            if (verificacao.estado() == VerificarDisponibilidadeConsultaUseCase.Estado.INDISPONIVEL) {
                throw new GoogleAgendaIndisponivelException();
            }

            return transacao.executar(() -> {
                consultas.bloquearAgendaParaCriacao();
                var existente = idempotencia.existente(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(), comando);
                if (existente.isPresent()) {
                    return consultas.buscarPorId(existente.get().recursoId()).orElseThrow(ConflitoException::new);
                }
                if (pacientes.buscarPorId(comando.pacienteId()).isEmpty()) throw new RecursoNaoEncontradoException();
                Instant fim = comando.agendadaPara().plusSeconds(
                        com.psiqapp.domain.modelo.DisponibilidadeAgenda.DURACAO_SEGUNDOS);
                if (consultas.existeAgendadaSobreposta(comando.agendadaPara(), fim)) throw new ConflitoException();
                String estadoConexao = conexao.estado();
                if ("INDISPONIVEL".equals(estadoConexao)
                        || ("CONECTADA".equals(estadoConexao) && !verificacao.conexaoAtiva())) {
                    throw new GoogleAgendaIndisponivelException();
                }
                var consulta = new Consulta(UUID.randomUUID(), comando.pacienteId(), comando.agendadaPara(),
                        StatusConsulta.AGENDADA, Normalizadores.opcional(comando.observacoes()), relogio.instant(), null);
                Consulta salva = consultas.salvar(consulta);
                var estadoSincronizacao = "CONECTADA".equals(estadoConexao)
                        ? RepositorySincronizacaoConsultaPort.Estado.PENDENTE
                        : RepositorySincronizacaoConsultaPort.Estado.AGUARDANDO_CONEXAO;
                sincronizacoes.criar(salva.id(), salva.id().toString().replace("-", ""),
                        estadoSincronizacao, relogio.instant());
                idempotencia.registrar(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(), comando,
                        "CONSULTA", salva.id(), 201);
                return salva;
            });
        });
    }

    private void validar(Comando comando) {
        var erros = new ArrayList<ErroDeValidacao>();
        if (comando.agendadaPara() == null) erros.add(new ErroDeValidacao("agendadaPara", "Campo obrigatorio."));
        Normalizadores.validarSemErros(erros);
    }
}
