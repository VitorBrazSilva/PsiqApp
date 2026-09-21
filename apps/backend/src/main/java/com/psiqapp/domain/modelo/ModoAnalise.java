package com.psiqapp.domain.modelo;

public enum ModoAnalise {
    RESUMO,
    LONGITUDINAL;

    @Deprecated public static final ModoAnalise SUMMARY_ONLY = RESUMO;
}
