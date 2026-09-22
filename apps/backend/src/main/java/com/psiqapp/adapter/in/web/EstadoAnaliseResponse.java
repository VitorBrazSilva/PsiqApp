package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.ObterEstadoAnaliseUseCase;

public record EstadoAnaliseResponse(AnaliseResponse analiseAtual, GeracaoAnaliseResponse ultimaGeracao,
        GeracaoAnaliseResponse geracaoAtiva, boolean podeRegenerar, String motivo) {
    static EstadoAnaliseResponse de(ObterEstadoAnaliseUseCase.Resultado resultado) {
        return new EstadoAnaliseResponse(AnaliseResponse.de(resultado.analiseAtual()),
                GeracaoAnaliseResponse.de(resultado.ultimaGeracao()),
                GeracaoAnaliseResponse.de(resultado.geracaoAtiva()), resultado.podeRegenerar(), resultado.motivo());
    }
}
