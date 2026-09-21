package com.psiqapp.domain.modelo;

public enum TipoRegistroClinico {
    PARECER,
    COMPLEMENTO;

    @Deprecated public static final TipoRegistroClinico ORIGINAL = PARECER;
    @Deprecated public static final TipoRegistroClinico COMPLEMENT = COMPLEMENTO;
}
