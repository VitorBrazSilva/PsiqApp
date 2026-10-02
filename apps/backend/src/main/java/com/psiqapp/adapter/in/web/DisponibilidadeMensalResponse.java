package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.ConsultarDisponibilidadeMensalUseCase;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

public record DisponibilidadeMensalResponse(YearMonth mes, List<Dia> dias) {
    public record Dia(LocalDate data, List<Instant> horarios) {}

    static DisponibilidadeMensalResponse de(ConsultarDisponibilidadeMensalUseCase.Resultado resultado) {
        return new DisponibilidadeMensalResponse(resultado.mes(), resultado.dias().stream()
                .map(dia -> new Dia(dia.data(), dia.horarios())).toList());
    }
}
