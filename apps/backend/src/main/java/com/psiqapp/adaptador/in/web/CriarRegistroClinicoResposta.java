package com.psiqapp.adaptador.in.web;

import com.psiqapp.aplicacao.usecase.CriarComplementoCasoDeUso;
import com.psiqapp.aplicacao.usecase.CriarParecerCasoDeUso;

public record CriarRegistroClinicoResposta(
        RegistroClinicoResposta registro,
        String generationId,
        GeracaoAnaliseResposta geracao) {
    static CriarRegistroClinicoResposta de(CriarParecerCasoDeUso.Resultado resultado) {
        return new CriarRegistroClinicoResposta(RegistroClinicoResposta.de(resultado.registro()),
                resultado.geracao().id().toString(),
                GeracaoAnaliseResposta.de(resultado.geracao()));
    }

    static CriarRegistroClinicoResposta de(CriarComplementoCasoDeUso.Resultado resultado) {
        return new CriarRegistroClinicoResposta(RegistroClinicoResposta.de(resultado.registro()),
                resultado.geracao().id().toString(),
                GeracaoAnaliseResposta.de(resultado.geracao()));
    }
}
