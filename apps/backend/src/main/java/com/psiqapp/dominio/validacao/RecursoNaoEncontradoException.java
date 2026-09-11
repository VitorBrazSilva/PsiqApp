package com.psiqapp.dominio.validacao;

public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException() {
        super("Recurso nao encontrado.");
    }
}
