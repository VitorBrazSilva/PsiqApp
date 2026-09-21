package com.psiqapp.adapter.in.web;

import com.psiqapp.domain.modelo.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AnaliseResponse(UUID id, UUID geracaoId, UUID pacienteId, Instant geradaEm, String modo,
        List<ItemAnaliseResponse> linhaDoTempo, List<ItemAnaliseResponse> padroes,
        List<ItemAnaliseResponse> pontosDeAtencao, List<String> limitacoes) {
    static AnaliseResponse de(AnaliseClinica analise) {
        if (analise == null) return null;
        return new AnaliseResponse(analise.id(), analise.geracaoId(), analise.pacienteId(), analise.geradaEm(),
                analise.modo().name(), itens(analise.timeline()), itens(analise.patterns()),
                itens(analise.attentionPoints()), analise.limitations());
    }

    private static List<ItemAnaliseResponse> itens(List<ItemAnaliseClinica> itens) {
        return itens.stream().map(item -> new ItemAnaliseResponse(item.text(), item.nature().name(),
                item.evidence().stream().map(e -> new EvidenciaResponse(e.recordAlias(), e.registroId(),
                        e.field().name(), e.quote())).toList())).toList();
    }

    public record ItemAnaliseResponse(String texto, String natureza, List<EvidenciaResponse> evidencias) {}
    public record EvidenciaResponse(String apelidoRegistro, UUID registroId, String campo, String citacao) {}
}
