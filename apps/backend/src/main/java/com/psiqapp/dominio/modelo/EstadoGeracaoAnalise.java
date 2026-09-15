package com.psiqapp.dominio.modelo;

public enum EstadoGeracaoAnalise {
    QUEUED,
    RUNNING,
    RETRY_WAIT,
    COMPLETED,
    FAILED
}
