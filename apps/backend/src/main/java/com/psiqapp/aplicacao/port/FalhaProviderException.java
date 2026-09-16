package com.psiqapp.aplicacao.port;

public class FalhaProviderException extends RuntimeException {
    private final String codigo;
    private final boolean transitoria;
    private final Long retryAfterMs;

    public FalhaProviderException(String codigo, boolean transitoria, Long retryAfterMs) {
        super(codigo);
        this.codigo = codigo;
        this.transitoria = transitoria;
        this.retryAfterMs = retryAfterMs;
    }

    public String codigo() {
        return codigo;
    }

    public boolean transitoria() {
        return transitoria;
    }

    public Long retryAfterMs() {
        return retryAfterMs;
    }
}
