package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.RepositorioConsultaPort;
import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.aplicacao.port.TransactionRunnerPort;
import com.psiqapp.dominio.modelo.Consulta;
import com.psiqapp.dominio.modelo.StatusConsulta;
import com.psiqapp.dominio.validacao.ConflitoException;
import com.psiqapp.dominio.validacao.ErroDeValidacao;
import com.psiqapp.dominio.validacao.Normalizadores;
import com.psiqapp.dominio.validacao.RecursoNaoEncontradoException;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

public class CriarConsultaCasoDeUso {
    public record Comando(UUID pacienteId, Instant agendadaPara, String observacoes, UUID chaveIdempotencia) {}

    private static final String OPERACAO = "CRIAR_CONSULTA";
    private final RepositorioPacientePort pacientes;
    private final RepositorioConsultaPort consultas;
    private final IdempotenciaServico idempotencia;
    private final TransactionRunnerPort transacao;
    private final Clock relogio;

    public CriarConsultaCasoDeUso(RepositorioPacientePort pacientes, RepositorioConsultaPort consultas,
            IdempotenciaServico idempotencia, TransactionRunnerPort transacao, Clock relogio) {
        this.pacientes = pacientes;
        this.consultas = consultas;
        this.idempotencia = idempotencia;
        this.transacao = transacao;
        this.relogio = relogio;
    }

    public Consulta executar(Comando comando) {
        return idempotencia.serializar(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(), () -> transacao.executar(() -> {
            var existente = idempotencia.existente(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(), comando);
            if (existente.isPresent()) {
                return consultas.buscarPorId(existente.get().recursoId()).orElseThrow(ConflitoException::new);
            }
            if (pacientes.buscarPorId(comando.pacienteId()).isEmpty()) throw new RecursoNaoEncontradoException();
            var erros = new ArrayList<ErroDeValidacao>();
            if (comando.agendadaPara() == null) erros.add(new ErroDeValidacao("agendadaPara", "Campo obrigatorio."));
            Normalizadores.validarSemErros(erros);
            var consulta = new Consulta(UUID.randomUUID(), comando.pacienteId(), comando.agendadaPara(),
                    StatusConsulta.AGENDADA, Normalizadores.opcional(comando.observacoes()), relogio.instant(), null);
            Consulta salva = consultas.salvar(consulta);
            idempotencia.registrar(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(), comando,
                    "CONSULTA", salva.id(), 201);
            return salva;
        }));
    }
}
