package com.psiqapp.domain.exception;

import java.util.List;
import com.psiqapp.domain.validation.ErroDeValidacao;

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
