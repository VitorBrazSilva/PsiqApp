package com.psiqapp.adaptador.in.web;

import com.psiqapp.dominio.modelo.RegistroClinico;
import java.time.Instant;
import java.util.UUID;

public record RegistroClinicoResposta(
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
    static RegistroClinicoResposta de(RegistroClinico registro) {
        return new RegistroClinicoResposta(registro.id(), registro.pacienteId(), registro.tipo().name(),
                registro.parecerOriginalId(), registro.consultaId(), registro.dataHoraClinica(),
                registro.criadoEm(), registro.texto(), registro.humor(), registro.medicamentos(),
                registro.revisao());
    }
}
