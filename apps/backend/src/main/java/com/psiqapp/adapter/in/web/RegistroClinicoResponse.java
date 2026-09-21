package com.psiqapp.adapter.in.web;

import com.psiqapp.domain.modelo.RegistroClinico;
import java.time.Instant;
import java.util.UUID;

public record RegistroClinicoResponse(
        UUID id,
        UUID pacienteId,
        String tipo,
        UUID parecerOriginalId,
        UUID consultaId,
        Instant dataHoraClinica,
        Instant criadoEm,
        String texto,
        String humor,
        String medicamentos,
        long revisao) {
    static RegistroClinicoResponse de(RegistroClinico registro) {
        return new RegistroClinicoResponse(registro.id(), registro.pacienteId(), registro.tipo().name(),
                registro.parecerOriginalId(), registro.consultaId(), registro.dataHoraClinica(),
                registro.criadoEm(), registro.texto(), registro.humor(), registro.medicamentos(),
                registro.revisao());
    }
}
