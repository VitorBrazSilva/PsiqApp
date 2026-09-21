package com.psiqapp.adapter.in.web;

import com.psiqapp.domain.validation.ErroDeValidacao;
import com.psiqapp.domain.exception.ValidacaoException;
import java.util.List;
import java.util.UUID;

final class ChaveIdempotencia {
    private ChaveIdempotencia() {}

    static UUID obrigatoria(String valor) {
        try {
            if (valor == null || valor.isBlank()) throw new IllegalArgumentException();
            return UUID.fromString(valor);
        } catch (IllegalArgumentException e) {
            throw new ValidacaoException(List.of(new ErroDeValidacao("Idempotency-Key", "Chave obrigatoria.")));
        }
    }
}
