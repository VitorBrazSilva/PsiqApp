package com.psiqapp.application.port.out;

import com.psiqapp.domain.modelo.GeracaoAnalise;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryGeracaoAnalisePort {
    record GeracaoReservada(GeracaoAnalise geracao, UUID leaseToken, Instant leaseExpiraEm, int numeroTentativa) {}
    record ResultadoFalha(boolean terminal, String codigoFalha, Instant proximaTentativaEm) {}

    GeracaoAnalise salvar(GeracaoAnalise geracao);
    Optional<GeracaoAnalise> buscarPorRegistroDisparador(UUID registroId);
    Optional<GeracaoAnalise> buscarPorIdNoPaciente(UUID pacienteId, UUID geracaoId);
    Optional<GeracaoAnalise> buscarAtiva(UUID pacienteId);
    Optional<GeracaoAnalise> buscarMaisRecente(UUID pacienteId);
    Optional<GeracaoReservada> reivindicarProxima(Instant agora, Instant leaseExpiraEm, UUID leaseToken,
            int maxTentativas);
    boolean concluirComSucesso(UUID geracaoId, UUID leaseToken, Instant agora);
    boolean concluirComFalha(UUID geracaoId, UUID leaseToken, ResultadoFalha falha, Instant agora);
}
