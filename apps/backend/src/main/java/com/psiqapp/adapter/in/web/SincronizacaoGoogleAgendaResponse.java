package com.psiqapp.adapter.in.web;

import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import java.time.Instant;

public record SincronizacaoGoogleAgendaResponse(String estado, Instant ultimaTentativa) {
    static SincronizacaoGoogleAgendaResponse de(RepositorySincronizacaoConsultaPort.Situacao situacao) {
        return situacao == null
                ? new SincronizacaoGoogleAgendaResponse("NAO_APLICAVEL", null)
                : new SincronizacaoGoogleAgendaResponse(situacao.estado().name(), situacao.ultimaTentativa());
    }
}
