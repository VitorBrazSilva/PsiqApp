package com.psiqapp.adapter.in.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.net.URI;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ResponseProblema(
        URI type,
        String title,
        int status,
        String detail,
        URI instance,
        String codigo,
        List<ErroDeCampo> errosDeCampo,
        String idRequisicao) {

    public record ErroDeCampo(
            String campo,
            String mensagem) {}
}
