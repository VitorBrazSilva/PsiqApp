package com.psiqapp.adapter.in.web;

import com.psiqapp.domain.modelo.GeracaoAnalise;
import java.time.Instant;
import java.util.UUID;

public record GeracaoAnaliseResponse(
        UUID id,
        UUID pacienteId,
        String estado,
        long revisaoSnapshot,
        long sequenciaRequest,
        Instant solicitadaEm,
        int totalRegistros,
        int totalOriginais,
        int totalComplementos,
        UUID ultimoRegistroClinicoId,
        String modo) {
    static GeracaoAnaliseResponse de(GeracaoAnalise geracao) {
        if (geracao == null) return null;
        return new GeracaoAnaliseResponse(geracao.id(), geracao.pacienteId(), geracao.estado().name(),
                geracao.revisaoSnapshot(), geracao.sequenciaRequest(), geracao.solicitadaEm(),
                geracao.totalRegistros(), geracao.totalOriginais(), geracao.totalComplementos(),
                geracao.ultimoRegistroClinicoId(), geracao.modo().name());
    }
}
