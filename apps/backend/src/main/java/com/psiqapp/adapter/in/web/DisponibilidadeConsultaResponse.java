package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.VerificarDisponibilidadeConsultaUseCase;
import java.time.Instant;

public record DisponibilidadeConsultaResponse(
        VerificarDisponibilidadeConsultaUseCase.Estado estado,
        String fusoHorario,
        Instant verificadoEm) {
    static DisponibilidadeConsultaResponse de(VerificarDisponibilidadeConsultaUseCase.Resultado resultado) {
        return new DisponibilidadeConsultaResponse(resultado.estado(), "America/Sao_Paulo", resultado.verificadoEm());
    }
}
