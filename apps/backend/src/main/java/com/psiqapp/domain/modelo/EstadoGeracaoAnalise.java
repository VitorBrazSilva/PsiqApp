package com.psiqapp.domain.modelo;

public enum EstadoGeracaoAnalise {
    QUEUED,
    RUNNING,
    RETRY_WAIT,
    COMPLETED,
    FAILED
}
