package com.psiqapp.application.usecase;

import com.psiqapp.domain.validation.ErroDeValidacao;
import com.psiqapp.domain.validation.Normalizadores;
import java.util.ArrayList;

final class Paginacao {
    private Paginacao() {}

    static int pagina(Integer valor) {
        return valor == null ? 0 : valor;
    }

    static int tamanho(Integer valor) {
        return valor == null ? 25 : valor;
    }

    static void validar(int pagina, int tamanho) {
        var erros = new ArrayList<ErroDeValidacao>();
        if (pagina < 0) erros.add(new ErroDeValidacao("page", "Pagina invalida."));
        if (tamanho < 1 || tamanho > 100) erros.add(new ErroDeValidacao("size", "Tamanho invalido."));
        Normalizadores.validarSemErros(erros);
    }
}
