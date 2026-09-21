package com.psiqapp.application.port.out;

import java.util.UUID;

public record RegistroIdempotencia(
        String operacao,
        UUID pacienteId,
        UUID chave,
        byte[] hashPayload,
        String tipoRecurso,
        UUID recursoId,
        int statusOriginal) {}
