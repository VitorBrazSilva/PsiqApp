package com.psiqapp.domain.modelo;

import java.util.UUID;

public record EvidenciaAnalise(String apelidoRegistro, UUID registroId, CampoEvidencia campo, String citacao) {
    @Deprecated public String recordAlias() { return apelidoRegistro; }
    @Deprecated public CampoEvidencia field() { return campo; }
    @Deprecated public String quote() { return citacao; }
}
