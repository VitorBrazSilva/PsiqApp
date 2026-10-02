package com.psiqapp.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import com.psiqapp.application.port.out.GrupoAgendaConsulta;
import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.PaginaAgendaConsultas;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.domain.exception.ValidacaoException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ListarAgendaConsultasUseCaseTest {
    private final RepositoryConsultaPort consultas = mock(RepositoryConsultaPort.class);
    private final Clock relogio = Clock.fixed(Instant.parse("2026-10-02T15:30:00Z"), ZoneOffset.UTC);
    private final ListarAgendaConsultasUseCase caso = new ListarAgendaConsultasUseCase(consultas, relogio);

    @Test
    void resolvePeriodoCivilEmSaoPauloEAplicaGrupoPadrao() {
        var resposta = new PaginaAgendaConsultas(new Pagina<>(java.util.List.of(), 0, 25, 0),
                Map.of(GrupoAgendaConsulta.PROXIMAS, 0L));
        when(consultas.listarAgenda(any(), any(), any(), any(), any(), anyInt(), anyInt())).thenReturn(resposta);

        caso.executar(null, null, LocalDate.parse("2026-10-01"), LocalDate.parse("2026-10-31"), null, null);

        verify(consultas).listarAgenda(GrupoAgendaConsulta.PROXIMAS, null,
                Instant.parse("2026-10-01T03:00:00Z"), Instant.parse("2026-11-01T03:00:00Z"),
                Instant.parse("2026-10-02T15:30:00Z"), 0, 25);
    }

    @Test
    void rejeitaPeriodoParcialInvertidoOuSemDiaSeguinteRepresentavel() {
        assertThatThrownBy(() -> caso.executar(null, null, LocalDate.parse("2026-10-01"), null, 0, 25))
                .isInstanceOf(ValidacaoException.class);
        assertThatThrownBy(() -> caso.executar(null, null, LocalDate.parse("2026-10-02"), LocalDate.parse("2026-10-01"), 0, 25))
                .isInstanceOf(ValidacaoException.class);
        assertThatThrownBy(() -> caso.executar(null, null, LocalDate.MAX, LocalDate.MAX, 0, 25))
                .isInstanceOf(ValidacaoException.class);
    }
}
