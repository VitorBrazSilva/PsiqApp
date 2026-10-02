package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.application.servico.ConsultarOcupacaoGoogleAgendaServico;
import com.psiqapp.domain.modelo.DisponibilidadeAgenda;
import java.time.Clock;
import java.time.DateTimeException;
import java.time.Instant;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import com.psiqapp.domain.exception.ValidacaoException;
import com.psiqapp.domain.validation.ErroDeValidacao;

public class ConsultarDisponibilidadeMensalUseCase {
    public record Dia(java.time.LocalDate data, List<Instant> horarios) {}
    public record Resultado(YearMonth mes, List<Dia> dias) {}

    private final RepositoryConsultaPort consultas;
    private final ConsultarOcupacaoGoogleAgendaServico google;
    private final Clock relogio;

    public ConsultarDisponibilidadeMensalUseCase(RepositoryConsultaPort consultas,
            ConsultarOcupacaoGoogleAgendaServico google, Clock relogio) {
        this.consultas = consultas;
        this.google = google;
        this.relogio = relogio;
    }

    public Resultado executar(YearMonth informado) {
        Instant agoraInicial = relogio.instant();
        YearMonth atual = YearMonth.from(agoraInicial.atZone(DisponibilidadeAgenda.FUSO));
        YearMonth mes = informado == null ? atual : informado;
        if (mes.isBefore(atual)) throw new ValidacaoException(List.of(
                new ErroDeValidacao("mes", "O mês solicitado já passou.")));
        final Instant inicio;
        final Instant fim;
        try {
            inicio = mes.atDay(1).atStartOfDay(DisponibilidadeAgenda.FUSO).toInstant();
            fim = mes.plusMonths(1).atDay(1).atStartOfDay(DisponibilidadeAgenda.FUSO).toInstant()
                    .plusSeconds(DisponibilidadeAgenda.DURACAO_SEGUNDOS);
        } catch (DateTimeException | ArithmeticException limiteTemporal) {
            throw new ValidacaoException(List.of(new ErroDeValidacao("mes", "O mês está fora do limite aceito.")));
        }
        var iniciosLocais = consultas.listarIniciosAgendadosSobrepostos(inicio, fim);
        var googleResult = google.consultar(inicio, fim);
        var ocupados = new ArrayList<DisponibilidadeAgenda.Intervalo>();
        iniciosLocais.forEach(ocupado -> ocupados.add(new DisponibilidadeAgenda.Intervalo(
                ocupado, ocupado.plusSeconds(DisponibilidadeAgenda.DURACAO_SEGUNDOS))));
        googleResult.intervalos().forEach(intervalo -> ocupados.add(
                new DisponibilidadeAgenda.Intervalo(intervalo.inicio(), intervalo.fim())));
        Instant referencia = relogio.instant();
        List<Instant> livres = DisponibilidadeAgenda.horariosLivres(mes, referencia, ocupados);
        Map<java.time.LocalDate, List<Instant>> porDia = new TreeMap<>();
        livres.forEach(horario -> porDia.computeIfAbsent(horario.atZone(DisponibilidadeAgenda.FUSO).toLocalDate(),
                chave -> new ArrayList<>()).add(horario));
        var dias = porDia.entrySet().stream().map(item -> new Dia(item.getKey(), List.copyOf(item.getValue()))).toList();
        return new Resultado(mes, dias);
    }
}
