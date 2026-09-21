package com.psiqapp.domain.modelo;

public enum EstadoGeracaoAnalise {
    ENFILEIRADA,
    EM_EXECUCAO,
    AGUARDANDO_RETENTATIVA,
    CONCLUIDA,
    FALHA;

    @Deprecated public static final EstadoGeracaoAnalise QUEUED = ENFILEIRADA;
    @Deprecated public static final EstadoGeracaoAnalise RUNNING = EM_EXECUCAO;
    @Deprecated public static final EstadoGeracaoAnalise RETRY_WAIT = AGUARDANDO_RETENTATIVA;
    @Deprecated public static final EstadoGeracaoAnalise COMPLETED = CONCLUIDA;
    @Deprecated public static final EstadoGeracaoAnalise FAILED = FALHA;
}
