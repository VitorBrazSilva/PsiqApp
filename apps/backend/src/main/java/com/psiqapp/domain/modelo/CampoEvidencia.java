package com.psiqapp.domain.modelo;

public enum CampoEvidencia {
    TEXTO,
    HUMOR,
    MEDICAMENTOS;

    @Deprecated public static final CampoEvidencia TEXT = TEXTO;
    @Deprecated public static final CampoEvidencia MOOD = HUMOR;
    @Deprecated public static final CampoEvidencia MEDICATIONS = MEDICAMENTOS;
}
