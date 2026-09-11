package com.psiqapp.adaptador.in.web;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.psiqapp.aplicacao.port.Pagina;
import java.util.List;
import java.util.function.Function;

record PaginaResposta<T>(
        @JsonProperty("items") List<T> itens,
        @JsonProperty("page") int pagina,
        @JsonProperty("size") int tamanho,
        long total) {
    static <D, R> PaginaResposta<R> de(Pagina<D> pagina, Function<D, R> mapper) {
        return new PaginaResposta<>(pagina.itens().stream().map(mapper).toList(),
                pagina.pagina(), pagina.tamanho(), pagina.total());
    }
}
