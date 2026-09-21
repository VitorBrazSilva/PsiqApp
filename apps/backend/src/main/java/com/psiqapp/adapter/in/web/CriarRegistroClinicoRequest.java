package com.psiqapp.adapter.in.web;

import java.time.Instant;
import java.util.UUID;

public record CriarRegistroClinicoRequest(
        String texto,
        String humor,
        String medicamentos,
        Instant dataHoraClinica,
        UUID consultaId) {}
