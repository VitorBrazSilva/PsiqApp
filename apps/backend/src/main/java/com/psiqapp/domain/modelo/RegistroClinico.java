package com.psiqapp.domain.modelo;

import java.time.Instant;
import java.util.UUID;

public record RegistroClinico(
        UUID id,
        UUID pacienteId,
        TipoRegistroClinico tipo,
        UUID parecerOriginalId,
        UUID consultaId,
        Instant dataHoraClinica,
        Instant criadoEm,
        String texto,
        String humor,
        String medicamentos,
        long revisao) {}
