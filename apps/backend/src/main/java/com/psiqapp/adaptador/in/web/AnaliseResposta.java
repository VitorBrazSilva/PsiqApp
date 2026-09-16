package com.psiqapp.adaptador.in.web;

import com.psiqapp.dominio.modelo.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AnaliseResposta(UUID id, UUID geracaoId, UUID pacienteId, Instant geradaEm, String modo,
        List<ItemAnaliseResposta> timeline, List<ItemAnaliseResposta> patterns,
        List<ItemAnaliseResposta> attentionPoints, List<String> limitations) {
    static AnaliseResposta de(AnaliseClinica analise) {
        if (analise == null) return null;
        return new AnaliseResposta(analise.id(), analise.geracaoId(), analise.pacienteId(), analise.geradaEm(),
                analise.modo().name(), itens(analise.timeline()), itens(analise.patterns()),
                itens(analise.attentionPoints()), analise.limitations());
    }

    private static List<ItemAnaliseResposta> itens(List<ItemAnaliseClinica> itens) {
        return itens.stream().map(item -> new ItemAnaliseResposta(item.text(), item.nature().name(),
                item.evidence().stream().map(e -> new EvidenciaResposta(e.recordAlias(), e.registroId(),
                        campo(e.field()), e.quote())).toList())).toList();
    }

    private static String campo(CampoEvidencia campo) {
        return switch (campo) {
            case TEXT -> "text";
            case MOOD -> "mood";
            case MEDICATIONS -> "medications";
        };
    }

    public record ItemAnaliseResposta(String text, String nature, List<EvidenciaResposta> evidence) {}
    public record EvidenciaResposta(String recordAlias, UUID registroId, String field, String quote) {}
}
