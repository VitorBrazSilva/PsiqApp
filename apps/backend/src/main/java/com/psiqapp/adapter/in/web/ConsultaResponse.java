package com.psiqapp.adapter.in.web;

import com.psiqapp.domain.modelo.Consulta;
import com.psiqapp.domain.modelo.StatusConsulta;
import java.time.Instant;
import java.util.UUID;

public record ConsultaResponse(
        UUID id,
        UUID pacienteId,
        Instant agendadaPara,
        StatusConsulta status,
        String observacoes,
        Instant criadaEm,
        Instant statusAlteradoEm,
        SincronizacaoGoogleAgendaResponse sincronizacaoGoogleAgenda) {
    static ConsultaResponse de(Consulta consulta,
            com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort.Situacao sincronizacao) {
        return new ConsultaResponse(consulta.id(), consulta.pacienteId(), consulta.agendadaPara(),
                consulta.status(), consulta.observacoes(), consulta.criadaEm(), consulta.statusAlteradoEm(),
                SincronizacaoGoogleAgendaResponse.de(sincronizacao));
    }
}
