package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.application.port.out.RepositoryPacientePort;
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

    public CriarConsultaUseCase(RepositoryPacientePort pacientes, RepositoryConsultaPort consultas,
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
