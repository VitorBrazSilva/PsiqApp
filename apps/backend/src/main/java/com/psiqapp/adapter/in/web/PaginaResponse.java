package com.psiqapp.adapter.in.web;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.psiqapp.application.port.out.Pagina;
import java.util.List;
import java.util.function.Function;

record PaginaResponse<T>(
        @JsonProperty("items") List<T> itens,
        @JsonProperty("page") int pagina,
        @JsonProperty("size") int tamanho,
        long total) {
    static <D, R> PaginaResponse<R> de(Pagina<D> pagina, Function<D, R> mapper) {
        return new PaginaResponse<>(pagina.itens().stream().map(mapper).toList(),
                pagina.pagina(), pagina.tamanho(), pagina.total());
    }
}
