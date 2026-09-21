package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.ObterEstadoAnaliseUseCase;

public record EstadoAnaliseResponse(AnaliseResponse currentAnalysis, GeracaoAnaliseResponse latestGeneration,
        GeracaoAnaliseResponse activeGeneration, boolean canRegenerate, String reason) {
    static EstadoAnaliseResponse de(ObterEstadoAnaliseUseCase.Resultado resultado) {
        return new EstadoAnaliseResponse(AnaliseResponse.de(resultado.analiseAtual()),
                GeracaoAnaliseResponse.de(resultado.ultimaGeracao()),
                GeracaoAnaliseResponse.de(resultado.geracaoAtiva()), resultado.podeRegenerar(), resultado.motivo());
    }
}
