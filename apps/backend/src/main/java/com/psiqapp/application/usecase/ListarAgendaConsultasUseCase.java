package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.GrupoAgendaConsulta;
import com.psiqapp.application.port.out.PaginaAgendaConsultas;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.domain.exception.ValidacaoException;
import com.psiqapp.domain.validation.ErroDeValidacao;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ListarAgendaConsultasUseCase {
    private static final ZoneId SAO_PAULO = ZoneId.of("America/Sao_Paulo");
    private final RepositoryConsultaPort consultas;
    private final Clock relogio;

    public ListarAgendaConsultasUseCase(RepositoryConsultaPort consultas, Clock relogio) {
        this.consultas = consultas;
        this.relogio = relogio;
    }

    public PaginaAgendaConsultas executar(GrupoAgendaConsulta grupo, UUID pacienteId,
            LocalDate dataInicial, LocalDate dataFinal, Integer pagina, Integer tamanho) {
        var erros = new ArrayList<ErroDeValidacao>();
        if ((dataInicial == null) != (dataFinal == null)) {
            erros.add(new ErroDeValidacao(dataInicial == null ? "dataInicial" : "dataFinal",
                    "Informe as duas datas do período."));
        }
        if (dataInicial != null && dataFinal != null && dataInicial.isAfter(dataFinal)) {
            erros.add(new ErroDeValidacao("dataInicial", "A data inicial deve ser anterior ou igual à data final."));
        }
        Instant inicio = null;
        Instant fim = null;
        if (erros.isEmpty() && dataInicial != null) {
            try {
                inicio = dataInicial.atStartOfDay(SAO_PAULO).toInstant();
                fim = dataFinal.plusDays(1).atStartOfDay(SAO_PAULO).toInstant();
            } catch (java.time.DateTimeException | ArithmeticException invalida) {
                erros.add(new ErroDeValidacao("dataFinal", "O período informado não é válido."));
            }
        }
        if (!erros.isEmpty()) throw new ValidacaoException(erros);
        int p = Paginacao.pagina(pagina);
        int t = Paginacao.tamanho(tamanho);
        Paginacao.validar(p, t);
        Instant referenciaEm = relogio.instant();
        return consultas.listarAgenda(grupo == null ? GrupoAgendaConsulta.PROXIMAS : grupo,
                pacienteId, inicio, fim, referenciaEm, p, t);
    }
}
