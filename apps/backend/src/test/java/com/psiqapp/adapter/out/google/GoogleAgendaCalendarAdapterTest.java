package com.psiqapp.adapter.out.google;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.FreeBusyCalendar;
import com.google.api.services.calendar.model.FreeBusyRequest;
import com.google.api.services.calendar.model.FreeBusyResponse;
import com.google.api.services.calendar.model.TimePeriod;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort;
import com.psiqapp.domain.modelo.StatusConsulta;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class GoogleAgendaCalendarAdapterTest {
    @Test
    void freeBusySolicitaSomenteIntervalosDoCalendarioPrincipalNoFusoDefinido() throws Exception {
        Calendar cliente = mock(Calendar.class);
        Calendar.Freebusy freebusy = mock(Calendar.Freebusy.class);
        Calendar.Freebusy.Query consulta = mock(Calendar.Freebusy.Query.class);
        when(cliente.freebusy()).thenReturn(freebusy);
        when(freebusy.query(any(FreeBusyRequest.class))).thenReturn(consulta);
        when(consulta.setFields(anyString())).thenReturn(consulta);
        when(consulta.execute()).thenReturn(new FreeBusyResponse().setCalendars(Map.of("primary",
                new FreeBusyCalendar().setBusy(List.of(new TimePeriod()
                        .setStart(new DateTime("2026-10-01T10:00:00-03:00"))
                        .setEnd(new DateTime("2026-10-01T11:00:00-03:00")))))));
        var adapter = new GoogleAgendaCalendarAdapter(token -> cliente);
        Instant inicio = Instant.parse("2026-10-01T13:00:00Z");
        Instant fim = inicio.plusSeconds(3_600);

        var intervalos = adapter.consultarOcupacao("refresh-ficticio", inicio, fim);

        assertThat(intervalos).containsExactly(new GoogleAgendaCalendarioPort.Intervalo(
                Instant.parse("2026-10-01T13:00:00Z"), Instant.parse("2026-10-01T14:00:00Z")));
        var captor = ArgumentCaptor.forClass(FreeBusyRequest.class);
        verify(freebusy).query(captor.capture());
        assertThat(captor.getValue().getItems()).hasSize(1);
        assertThat(captor.getValue().getItems().getFirst().getId()).isEqualTo("primary");
        assertThat(captor.getValue().getTimeZone()).isEqualTo("America/Sao_Paulo");
        assertThat(captor.getValue().getTimeMin().getValue()).isEqualTo(inicio.toEpochMilli());
        assertThat(captor.getValue().getTimeMax().getValue()).isEqualTo(fim.toEpochMilli());
    }

    @Test
    void eventoIncluiSomenteIdentificacaoMinimaEPreservaStatusEInstantes() throws Exception {
        Calendar cliente = mock(Calendar.class);
        Calendar.Events eventos = mock(Calendar.Events.class);
        Calendar.Events.Insert inserir = mock(Calendar.Events.Insert.class);
        when(cliente.events()).thenReturn(eventos);
        when(eventos.insert(anyString(), any(Event.class))).thenReturn(inserir);
        when(inserir.setFields(anyString())).thenReturn(inserir);
        when(inserir.execute()).thenReturn(new Event().setId("evento"));
        UUID consultaId = UUID.fromString("1c6c7f14-0922-4ee0-a92d-fadf23eb0831");
        String idEvento = consultaId.toString().replace("-", "");
        Instant inicio = Instant.parse("2026-10-01T13:00:00Z");
        var evento = new GoogleAgendaCalendarioPort.EventoConsulta(consultaId, "Paciente Fictício",
                "paciente@example.test", inicio, inicio.plusSeconds(3_600), StatusConsulta.REALIZADA);

        new GoogleAgendaCalendarAdapter(token -> cliente).criarEvento("refresh-ficticio", idEvento, evento);

        var captor = ArgumentCaptor.forClass(Event.class);
        verify(eventos).insert(org.mockito.ArgumentMatchers.eq("primary"), captor.capture());
        Event payload = captor.getValue();
        assertThat(payload.getId()).isEqualTo(idEvento);
        assertThat(payload.getSummary()).isEqualTo("Consulta: Paciente Fictício (REALIZADA)");
        assertThat(payload.getDescription()).isEqualTo("E-mail: paciente@example.test");
        assertThat(payload.getStart().getDateTime().getValue()).isEqualTo(inicio.toEpochMilli());
        assertThat(payload.getEnd().getDateTime().getValue()).isEqualTo(inicio.plusSeconds(3_600).toEpochMilli());
        assertThat(payload.getStart().getTimeZone()).isEqualTo("America/Sao_Paulo");
        assertThat(payload.getVisibility()).isEqualTo("private");
        assertThat(payload.getTransparency()).isEqualTo("opaque");
        assertThat(payload.getAttendees()).isNull();
        assertThat(payload.getExtendedProperties().getPrivate())
                .containsEntry(GoogleAgendaCalendarAdapter.PROPRIEDADE_CONSULTA, consultaId.toString());
        assertThat(payload.toString()).doesNotContain("CPF", "observa", "diagnóstico", "refresh-ficticio");
    }
}
