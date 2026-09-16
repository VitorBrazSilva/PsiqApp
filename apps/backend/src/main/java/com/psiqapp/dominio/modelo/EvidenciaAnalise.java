package com.psiqapp.dominio.modelo;

import java.util.UUID;

public record EvidenciaAnalise(String recordAlias, UUID registroId, CampoEvidencia field, String quote) {}
