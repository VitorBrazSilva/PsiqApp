package com.psiqapp.domain.modelo;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** Regras civis e de sobreposição da agenda, sem dependências de infraestrutura. */
public final class DisponibilidadeAgenda {
    public static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");
    public static final long DURACAO_SEGUNDOS = 3_600;
    private static final int PASSO_MINUTOS = 30;

    public record Intervalo(Instant inicio, Instant fim) {}

    private DisponibilidadeAgenda() {}

    public static List<Instant> horariosLivres(YearMonth mes, Instant referencia, List<Intervalo> ocupados) {
        var horarios = new ArrayList<Instant>();
        LocalDate hoje = referencia.atZone(FUSO).toLocalDate();
        for (LocalDate data = mes.atDay(1); data.isBefore(mes.atEndOfMonth().plusDays(1)); data = data.plusDays(1)) {
            if (data.isBefore(hoje)) continue;
            for (int minuto = 0; minuto < 24 * 60; minuto += PASSO_MINUTOS) {
                LocalDateTime civil = LocalDateTime.of(data, LocalTime.of(minuto / 60, minuto % 60));
                for (ZoneOffset offset : FUSO.getRules().getValidOffsets(civil)) {
                    Instant inicio = civil.toInstant(offset);
                    if (inicio.isBefore(referencia)) continue;
                    Instant fim = inicio.plusSeconds(DURACAO_SEGUNDOS);
                    boolean ocupado = ocupados.stream().anyMatch(intervalo ->
                            intervalo.inicio().isBefore(fim) && intervalo.fim().isAfter(inicio));
                    if (!ocupado) horarios.add(inicio);
                }
            }
        }
        return horarios.stream().distinct().sorted(Comparator.naturalOrder()).toList();
    }
}
