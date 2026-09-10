package com.psiqapp.adaptador.in.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.net.URI;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record RespostaProblema(
        URI type,
        String title,
        int status,
        String detail,
        URI instance,
        @JsonProperty("code") String codigo,
        @JsonProperty("fieldErrors") List<ErroDeCampo> errosDeCampo,
        String requestId) {

    public record ErroDeCampo(
            @JsonProperty("field") String campo,
            @JsonProperty("message") String mensagem) {}
}
