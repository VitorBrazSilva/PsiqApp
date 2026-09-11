package com.psiqapp.dominio.modelo;

import java.time.Instant;
import java.util.UUID;

public record Consulta(
        UUID id,
        UUID pacienteId,
        Instant agendadaPara,
        StatusConsulta status,
        String observacoes,
        Instant criadaEm,
        Instant statusAlteradoEm) {}
