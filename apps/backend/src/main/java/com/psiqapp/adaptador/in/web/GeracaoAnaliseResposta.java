package com.psiqapp.adaptador.in.web;

import com.psiqapp.dominio.modelo.GeracaoAnalise;
import java.time.Instant;
import java.util.UUID;

public record GeracaoAnaliseResposta(
        UUID id,
        UUID pacienteId,
        String estado,
        long revisaoSnapshot,
        long sequenciaRequisicao,
        Instant solicitadaEm,
        int totalRegistros,
        int totalOriginais,
        int totalComplementos,
        UUID ultimoRegistroClinicoId,
        String modo) {
    static GeracaoAnaliseResposta de(GeracaoAnalise geracao) {
        return new GeracaoAnaliseResposta(geracao.id(), geracao.pacienteId(), geracao.estado().name(),
                geracao.revisaoSnapshot(), geracao.sequenciaRequisicao(), geracao.solicitadaEm(),
                geracao.totalRegistros(), geracao.totalOriginais(), geracao.totalComplementos(),
                geracao.ultimoRegistroClinicoId(), geracao.modo().name());
    }
}
