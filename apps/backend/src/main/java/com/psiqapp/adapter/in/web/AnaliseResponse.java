package com.psiqapp.adapter.in.web;

import com.psiqapp.domain.modelo.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AnaliseResponse(UUID id, UUID geracaoId, UUID pacienteId, Instant geradaEm, String modo,
        List<ItemAnaliseResponse> timeline, List<ItemAnaliseResponse> patterns,
        List<ItemAnaliseResponse> attentionPoints, List<String> limitations) {
    static AnaliseResponse de(AnaliseClinica analise) {
        if (analise == null) return null;
        return new AnaliseResponse(analise.id(), analise.geracaoId(), analise.pacienteId(), analise.geradaEm(),
                analise.modo().name(), itens(analise.timeline()), itens(analise.patterns()),
                itens(analise.attentionPoints()), analise.limitations());
    }

    private static List<ItemAnaliseResponse> itens(List<ItemAnaliseClinica> itens) {
        return itens.stream().map(item -> new ItemAnaliseResponse(item.text(), item.nature().name(),
                item.evidence().stream().map(e -> new EvidenciaResponse(e.recordAlias(), e.registroId(),
                        campo(e.field()), e.quote())).toList())).toList();
    }

    private static String campo(CampoEvidencia campo) {
        return switch (campo) {
            case TEXT -> "text";
            case MOOD -> "mood";
            case MEDICATIONS -> "medications";
        };
    }

    public record ItemAnaliseResponse(String text, String nature, List<EvidenciaResponse> evidence) {}
    public record EvidenciaResponse(String recordAlias, UUID registroId, String field, String quote) {}
}
