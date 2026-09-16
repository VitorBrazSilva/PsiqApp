package com.psiqapp.dominio.modelo;

import java.time.Instant;
import java.util.UUID;

public record TentativaGeracao(
        UUID id,
        UUID geracaoId,
        int numero,
        Instant iniciadaEm,
        Instant finalizadaEm,
        String resultado,
        String codigoErro,
        Long duracaoMs,
        String providerRequestId,
        Integer inputTokens,
        Integer outputTokens) {}
