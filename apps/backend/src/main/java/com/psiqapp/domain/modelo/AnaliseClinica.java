package com.psiqapp.domain.modelo;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AnaliseClinica(
        UUID id,
        UUID geracaoId,
        UUID pacienteId,
        Instant geradaEm,
        ModoAnalise modo,
        List<ItemAnaliseClinica> linhaDoTempo,
        List<ItemAnaliseClinica> padroes,
        List<ItemAnaliseClinica> pontosDeAtencao,
        List<String> limitacoes,
        String versaoRegrasSeguranca) {
    @Deprecated public List<ItemAnaliseClinica> timeline() { return linhaDoTempo; }
    @Deprecated public List<ItemAnaliseClinica> patterns() { return padroes; }
    @Deprecated public List<ItemAnaliseClinica> attentionPoints() { return pontosDeAtencao; }
    @Deprecated public List<String> limitations() { return limitacoes; }
}
