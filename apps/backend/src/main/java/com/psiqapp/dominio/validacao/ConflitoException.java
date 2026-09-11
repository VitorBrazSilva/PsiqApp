package com.psiqapp.dominio.validacao;

public class ConflitoException extends RuntimeException {
    public ConflitoException() {
        super("Conflito de negocio.");
    }
}
