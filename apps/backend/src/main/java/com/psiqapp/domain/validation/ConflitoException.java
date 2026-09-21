package com.psiqapp.domain.validation;

public class ConflitoException extends RuntimeException {
    public ConflitoException() {
        super("Conflito de negocio.");
    }
}
