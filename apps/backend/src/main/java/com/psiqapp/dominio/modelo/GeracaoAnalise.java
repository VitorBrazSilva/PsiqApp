package com.psiqapp.dominio.modelo;

import java.time.Instant;
import java.util.UUID;

public record GeracaoAnalise(
        UUID id,
        UUID pacienteId,
        GatilhoGeracaoAnalise gatilho,
        UUID registroDisparadorId,
        long revisaoSnapshot,
        long sequenciaRequisicao,
        Instant solicitadaEm,
        EstadoGeracaoAnalise estado,
        int totalRegistros,
        int totalOriginais,
        int totalComplementos,
        UUID ultimoRegistroClinicoId,
        ModoAnalise modo) {}
