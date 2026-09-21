package com.psiqapp.domain.modelo;

public enum SecaoAnalise {
    LINHA_DO_TEMPO,
    PADROES,
    PONTOS_DE_ATENCAO;

    @Deprecated public static final SecaoAnalise TIMELINE = LINHA_DO_TEMPO;
    @Deprecated public static final SecaoAnalise PATTERNS = PADROES;
    @Deprecated public static final SecaoAnalise ATTENTION_POINTS = PONTOS_DE_ATENCAO;
}
