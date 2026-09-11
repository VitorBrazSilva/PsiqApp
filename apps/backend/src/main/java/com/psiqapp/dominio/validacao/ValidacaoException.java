package com.psiqapp.dominio.validacao;

import java.util.List;

public class ValidacaoException extends RuntimeException {
    private final List<ErroDeValidacao> erros;

    public ValidacaoException(List<ErroDeValidacao> erros) {
        super("Entrada invalida.");
        this.erros = List.copyOf(erros);
    }

    public List<ErroDeValidacao> erros() {
        return erros;
    }
}
