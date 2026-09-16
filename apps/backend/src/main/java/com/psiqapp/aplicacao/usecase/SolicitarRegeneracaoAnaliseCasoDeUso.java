package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.*;
import com.psiqapp.dominio.modelo.*;
import com.psiqapp.dominio.validacao.ConflitoException;
import com.psiqapp.dominio.validacao.RecursoNaoEncontradoException;
import java.time.Clock;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class SolicitarRegeneracaoAnaliseCasoDeUso {
    private static final Map<UUID, Object> LOCKS_REGENERACAO = new ConcurrentHashMap<>();
    private final RepositorioPacientePort pacientes;
    private final RepositorioRegistroClinicoPort registros;
    private final RepositorioGeracaoAnalisePort geracoes;
    private final RepositorioSequenciaPacientePort sequencias;
    private final IdempotenciaServico idempotencia;
    private final TransactionRunnerPort transacao;
    private final Clock relogio;

    public SolicitarRegeneracaoAnaliseCasoDeUso(RepositorioPacientePort pacientes,
            RepositorioRegistroClinicoPort registros, RepositorioGeracaoAnalisePort geracoes,
            RepositorioSequenciaPacientePort sequencias, IdempotenciaServico idempotencia,
            TransactionRunnerPort transacao, Clock relogio) {
        this.pacientes = pacientes;
        this.registros = registros;
        this.geracoes = geracoes;
        this.sequencias = sequencias;
        this.idempotencia = idempotencia;
        this.transacao = transacao;
        this.relogio = relogio;
    }

    public Resultado executar(UUID pacienteId, UUID chave) {
        if (pacientes.buscarPorId(pacienteId).isEmpty()) throw new RecursoNaoEncontradoException();
        Object lock = LOCKS_REGENERACAO.computeIfAbsent(pacienteId, ignorado -> new Object());
        synchronized (lock) {
            return idempotencia.serializar("ANALYSIS_REGENERATION", pacienteId, chave, () -> {
                var payload = new Payload(pacienteId);
                var existente = idempotencia.existente("ANALYSIS_REGENERATION", pacienteId, chave, payload);
                if (existente.isPresent()) {
                    return new Resultado(geracoes.buscarPorIdNoPaciente(pacienteId, existente.get().recursoId())
                            .orElseThrow(RecursoNaoEncontradoException::new));
                }
                return transacao.executar(() -> {
                    if (geracoes.buscarAtiva(pacienteId).isPresent()) throw new ConflitoException();
                    var reserva = sequencias.reservarParaRegeneracao(pacienteId)
                            .orElseThrow(RecursoNaoEncontradoException::new);
                    var estatisticas = registros.estatisticasDoPacienteAteRevisao(pacienteId, reserva.revisaoClinica());
                    if (estatisticas.totalOriginais() == 0) throw new ConflitoException();
                    var geracao = geracoes.salvar(new GeracaoAnalise(UUID.randomUUID(), pacienteId,
                            GatilhoGeracaoAnalise.MANUAL, null, reserva.revisaoClinica(),
                            reserva.sequenciaRequisicao(), relogio.instant(), EstadoGeracaoAnalise.QUEUED,
                            estatisticas.totalRegistros(), estatisticas.totalOriginais(),
                            estatisticas.totalComplementos(), estatisticas.ultimoRegistroId(),
                            estatisticas.totalOriginais() <= 1 ? ModoAnalise.SUMMARY_ONLY : ModoAnalise.LONGITUDINAL));
                    idempotencia.registrar("ANALYSIS_REGENERATION", pacienteId, chave, payload,
                            "ANALYSIS_GENERATION", geracao.id(), 202);
                    return new Resultado(geracao);
                });
            });
        }
    }

    public record Resultado(GeracaoAnalise geracao) {}
    private record Payload(UUID pacienteId) {}
}
