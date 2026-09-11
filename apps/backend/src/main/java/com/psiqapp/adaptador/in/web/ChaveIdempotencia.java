package com.psiqapp.adaptador.in.web;

import com.psiqapp.dominio.validacao.ErroDeValidacao;
import com.psiqapp.dominio.validacao.ValidacaoException;
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
