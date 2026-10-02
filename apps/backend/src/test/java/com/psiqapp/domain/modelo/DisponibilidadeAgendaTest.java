package com.psiqapp.domain.modelo;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import org.junit.jupiter.api.Test;

class DisponibilidadeAgendaTest {
    private static final Instant AGORA = Instant.parse("2026-10-01T12:00:00Z");

    @Test
    void geraPassosDeTrintaMinutosEPermiteAdjacenciaComOcupacao() {
        Instant primeiro = Instant.parse("2026-10-01T12:00:00Z");
        var ocupados = List.of(new DisponibilidadeAgenda.Intervalo(primeiro.plusSeconds(3_600),
                primeiro.plusSeconds(7_200)));

        var livres = DisponibilidadeAgenda.horariosLivres(YearMonth.of(2026, 10), AGORA, ocupados);

        assertThat(livres).contains(primeiro, primeiro.plusSeconds(7_200));
        assertThat(livres).doesNotContain(primeiro.plusSeconds(1_800), primeiro.plusSeconds(3_600));
    }

    @Test
    void consideraConsultaAteDepoisDaViradaDoMesEIgnoraHorasPassadas() {
        Instant fimDoMes = Instant.parse("2026-11-01T02:30:00Z"); // 23:30 em São Paulo
        var conflito = new DisponibilidadeAgenda.Intervalo(fimDoMes.plusSeconds(1_800),
                fimDoMes.plusSeconds(5_400));
        Instant referencia = Instant.parse("2026-11-01T02:15:00Z");

        var livres = DisponibilidadeAgenda.horariosLivres(YearMonth.of(2026, 10), referencia, List.of(conflito));

        assertThat(livres).doesNotContain(fimDoMes);
        assertThat(livres).allMatch(horario -> !horario.isBefore(referencia));
    }

    @Test
    void representaOInicioDeVinteETresETrintaSemTruncarSuaDuracao() {
        Instant referencia = Instant.parse("2026-10-01T03:00:00Z");
        var livres = DisponibilidadeAgenda.horariosLivres(YearMonth.of(2026, 10), referencia, List.of());
        Instant inicio2330 = Instant.parse("2026-10-02T02:30:00Z");
        assertThat(livres).contains(inicio2330);
        assertThat(inicio2330.plusSeconds(DisponibilidadeAgenda.DURACAO_SEGUNDOS))
                .isEqualTo(Instant.parse("2026-10-02T03:30:00Z"));
    }

    @Test
    void segueTransicoesHistoricasDoFusoSemCriarHoraInexistenteEComAmbasHorasRepetidas() {
        Instant referencia = Instant.parse("2018-11-01T00:00:00Z");
        var novembro = DisponibilidadeAgenda.horariosLivres(YearMonth.of(2018, 11), referencia, List.of());
        var meiaNoiteInexistente = LocalDateTime.of(2018, 11, 4, 0, 0);
        assertThat(DisponibilidadeAgenda.FUSO.getRules().getValidOffsets(meiaNoiteInexistente)).isEmpty();
        assertThat(novembro).noneMatch(horario -> horario.atZone(DisponibilidadeAgenda.FUSO)
                .toLocalDateTime().equals(meiaNoiteInexistente));

        Instant referenciaRepetida = Instant.parse("2019-02-01T00:00:00Z");
        var fevereiro = DisponibilidadeAgenda.horariosLivres(YearMonth.of(2019, 2), referenciaRepetida, List.of());
        var horarioRepetido = LocalDateTime.of(2019, 2, 16, 23, 0);
        var instantesValidos = DisponibilidadeAgenda.FUSO.getRules().getValidOffsets(horarioRepetido).stream()
                .map(horarioRepetido::toInstant).toList();
        assertThat(instantesValidos).hasSize(2);
        assertThat(fevereiro).containsAll(instantesValidos);
    }
}
