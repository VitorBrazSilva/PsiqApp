package com.psiqapp.adaptador.in.web;

import java.time.Instant;
import java.util.UUID;

public record CriarRegistroClinicoRequisicao(
        String texto,
        String humor,
        String medicamentos,
        Instant dataHoraClinica,
        UUID consultaId) {}
