package com.psiqapp.adaptador.in.web;

import com.psiqapp.aplicacao.usecase.ObterEstadoAnaliseCasoDeUso;

public record EstadoAnaliseResposta(AnaliseResposta currentAnalysis, GeracaoAnaliseResposta latestGeneration,
        GeracaoAnaliseResposta activeGeneration, boolean canRegenerate, String reason) {
    static EstadoAnaliseResposta de(ObterEstadoAnaliseCasoDeUso.Resultado resultado) {
        return new EstadoAnaliseResposta(AnaliseResposta.de(resultado.analiseAtual()),
                GeracaoAnaliseResposta.de(resultado.ultimaGeracao()),
                GeracaoAnaliseResposta.de(resultado.geracaoAtiva()), resultado.podeRegenerar(), resultado.motivo());
    }
}
