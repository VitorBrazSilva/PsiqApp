package com.psiqapp.adaptador.in.web;

import com.psiqapp.dominio.modelo.Consulta;
import com.psiqapp.dominio.modelo.StatusConsulta;
import java.time.Instant;
import java.util.UUID;

public record ConsultaResposta(
        UUID id,
        UUID pacienteId,
        Instant agendadaPara,
        StatusConsulta status,
        String observacoes,
        Instant criadaEm,
        Instant statusAlteradoEm) {
    static ConsultaResposta de(Consulta consulta) {
        return new ConsultaResposta(consulta.id(), consulta.pacienteId(), consulta.agendadaPara(),
                consulta.status(), consulta.observacoes(), consulta.criadaEm(), consulta.statusAlteradoEm());
    }
}
