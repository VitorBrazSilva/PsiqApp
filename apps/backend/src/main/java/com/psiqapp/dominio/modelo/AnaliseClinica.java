package com.psiqapp.dominio.modelo;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AnaliseClinica(
        UUID id,
        UUID geracaoId,
        UUID pacienteId,
        Instant geradaEm,
        ModoAnalise modo,
        List<ItemAnaliseClinica> timeline,
        List<ItemAnaliseClinica> patterns,
        List<ItemAnaliseClinica> attentionPoints,
        List<String> limitations,
        String versaoRegrasSeguranca) {}
