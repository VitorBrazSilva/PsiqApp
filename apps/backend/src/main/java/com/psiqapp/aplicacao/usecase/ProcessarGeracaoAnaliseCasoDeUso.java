package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.*;
import com.psiqapp.aplicacao.servico.MontadorSnapshotAnalise;
import com.psiqapp.aplicacao.servico.ValidadorRespostaAnalise;
import com.psiqapp.dominio.modelo.AnaliseClinica;
import com.psiqapp.dominio.modelo.TentativaGeracao;
import com.psiqapp.dominio.validacao.ValidacaoException;
import java.time.*;
import java.util.Objects;
import java.util.UUID;

public class ProcessarGeracaoAnaliseCasoDeUso {
    private final RepositorioGeracaoAnalisePort geracoes;
    private final RepositorioAnaliseClinicaPort analises;
    private final RepositorioTentativaGeracaoPort tentativas;
    private final MontadorSnapshotAnalise snapshots;
    private final ValidadorRespostaAnalise validador;
    private final ProvedorAnaliseClinicaPort provedor;
    private final TransactionRunnerPort transacao;
    private final Clock relogio;
    private final Config config;

    public ProcessarGeracaoAnaliseCasoDeUso(RepositorioGeracaoAnalisePort geracoes,
            RepositorioAnaliseClinicaPort analises, RepositorioTentativaGeracaoPort tentativas,
            MontadorSnapshotAnalise snapshots, ValidadorRespostaAnalise validador,
            ProvedorAnaliseClinicaPort provedor, TransactionRunnerPort transacao, Clock relogio, Config config) {
        this.geracoes = geracoes;
        this.analises = analises;
        this.tentativas = tentativas;
        this.snapshots = snapshots;
        this.validador = validador;
        this.provedor = provedor;
        this.transacao = transacao;
        this.relogio = relogio;
        this.config = config;
    }

    public Resultado executarUma() {
        Instant agora = relogio.instant();
        UUID token = UUID.randomUUID();
        var reserva = transacao.executar(() -> geracoes.reivindicarProxima(agora,
                agora.plus(config.leaseTtl()), token, config.maxTentativas()));
        if (reserva.isEmpty()) {
            return Resultado.NENHUMA_GERACAO;
        }

        var reservada = reserva.get();
        var inicio = relogio.instant();
        var geracao = reservada.geracao();
        var snapshot = snapshots.montar(geracao.pacienteId(), geracao.revisaoSnapshot());

        try {
            var respostaProvider = provedor.gerar(new ProvedorAnaliseClinicaPort.Solicitacao(
                    snapshot, geracao.modo(), config.timeoutChamada(), config.orcamentoTentativa()));
            var analise = validador.validar(UUID.randomUUID(), geracao.id(), geracao.pacienteId(), geracao.modo(),
                    relogio.instant(), respostaProvider.resposta(), snapshot);
            boolean publicada = transacao.executar(() -> {
                analises.salvar(analise);
                var ok = geracoes.concluirComSucesso(geracao.id(), reservada.leaseToken(), relogio.instant());
                if (!ok) {
                    throw new ResultadoTardioException();
                }
                tentativas.salvar(finalizarTentativa(reservada, inicio, "SUCCESS", null,
                        respostaProvider.providerRequestId(), respostaProvider.inputTokens(), respostaProvider.outputTokens()));
                return true;
            });
            return publicada ? Resultado.PROCESSADA : Resultado.RESULTADO_TARDIO;
        } catch (ResultadoTardioException e) {
            return Resultado.RESULTADO_TARDIO;
        } catch (FalhaProviderException e) {
            return registrarFalha(reservada, inicio, e.codigo(), e.transitoria(), e.retryAfterMs());
        } catch (ValidacaoException e) {
            String codigo = codigoFalhaValidacao(e);
            // A resposta estruturada do provedor pode falhar apenas por uma citação
            // não literal. Nesse caso, uma nova chamada pode produzir uma resposta válida.
            boolean transitoria = "INVALID_RESPONSE_QUOTE".equals(codigo);
            return registrarFalha(reservada, inicio, codigo, transitoria, null);
        } catch (IllegalArgumentException e) {
            return registrarFalha(reservada, inicio, "INVALID_RESPONSE_ILLEGAL_ARGUMENT", false, null);
        }
    }

    /**
     * Persiste somente a categoria técnica da validação. Nunca inclui a mensagem,
     * o prompt, a resposta do provedor ou qualquer conteúdo clínico.
     */
    private String codigoFalhaValidacao(ValidacaoException e) {
        var campo = e.erros().stream()
                .map(erro -> erro.campo())
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("unknown")
                .toUpperCase()
                .replaceAll("[^A-Z0-9]+", "_");
        return "INVALID_RESPONSE_" + campo;
    }

    private Resultado registrarFalha(RepositorioGeracaoAnalisePort.GeracaoReservada reservada, Instant inicio,
            String codigo, boolean transitoria, Long retryAfterMs) {
        Instant agora = relogio.instant();
        boolean permiteRetry = transitoria && reservada.numeroTentativa() < config.maxTentativas();
        Instant proxima = permiteRetry ? proximaTentativa(agora, reservada.numeroTentativa(), retryAfterMs) : null;
        var falha = new RepositorioGeracaoAnalisePort.ResultadoFalha(!permiteRetry, codigo, proxima);
        boolean atualizada = transacao.executar(() -> {
            var ok = geracoes.concluirComFalha(reservada.geracao().id(), reservada.leaseToken(), falha, relogio.instant());
            if (ok) {
                tentativas.salvar(finalizarTentativa(reservada, inicio, permiteRetry ? "RETRY_WAIT" : "FAILED",
                        codigo, null, null, null));
            }
            return ok;
        });
        if (!atualizada) {
            return Resultado.RESULTADO_TARDIO;
        }
        return permiteRetry ? Resultado.RETRY_AGENDADO : Resultado.FALHA_TERMINAL;
    }

    private TentativaGeracao finalizarTentativa(RepositorioGeracaoAnalisePort.GeracaoReservada reservada,
            Instant inicio, String resultado, String codigoErro, String requestId, Integer inputTokens,
            Integer outputTokens) {
        Instant fim = relogio.instant();
        return new TentativaGeracao(UUID.randomUUID(), reservada.geracao().id(), reservada.numeroTentativa(),
                inicio, fim, resultado, codigoErro, Duration.between(inicio, fim).toMillis(), requestId,
                inputTokens, outputTokens);
    }

    private Instant proximaTentativa(Instant agora, int tentativaAtual, Long retryAfterMs) {
        if (retryAfterMs != null && retryAfterMs > 0) {
            return agora.plusMillis(retryAfterMs);
        }
        long segundos = tentativaAtual <= 1 ? config.backoffInicial().toSeconds() : config.backoffFinal().toSeconds();
        long jitter = Math.floorMod(Objects.hash(agora, tentativaAtual), 1000);
        return agora.plusSeconds(segundos).plusMillis(jitter);
    }

    public record Config(Duration timeoutChamada, Duration orcamentoTentativa, Duration leaseTtl,
            Duration backoffInicial, Duration backoffFinal, int maxTentativas) {}

    public enum Resultado {
        NENHUMA_GERACAO,
        PROCESSADA,
        RETRY_AGENDADO,
        FALHA_TERMINAL,
        RESULTADO_TARDIO
    }

    private static class ResultadoTardioException extends RuntimeException {}
}
