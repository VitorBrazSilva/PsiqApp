package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.CriarComplementoUseCase;
import com.psiqapp.application.usecase.CriarParecerUseCase;

public record CriarRegistroClinicoResponse(
        RegistroClinicoResponse registro,
        String generationId,
        GeracaoAnaliseResponse geracao) {
    static CriarRegistroClinicoResponse de(CriarParecerUseCase.Resultado resultado) {
        return new CriarRegistroClinicoResponse(RegistroClinicoResponse.de(resultado.registro()),
                resultado.geracao().id().toString(),
                GeracaoAnaliseResponse.de(resultado.geracao()));
    }

    static CriarRegistroClinicoResponse de(CriarComplementoUseCase.Resultado resultado) {
        return new CriarRegistroClinicoResponse(RegistroClinicoResponse.de(resultado.registro()),
                resultado.geracao().id().toString(),
                GeracaoAnaliseResponse.de(resultado.geracao()));
    }
}
