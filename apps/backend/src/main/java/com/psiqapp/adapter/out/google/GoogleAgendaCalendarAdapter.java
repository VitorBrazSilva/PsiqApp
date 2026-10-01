package com.psiqapp.adapter.out.google;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.FreeBusyRequest;
import com.google.api.services.calendar.model.FreeBusyRequestItem;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort;
import com.psiqapp.application.usecase.FalhaGoogleAgendaException;
import com.psiqapp.domain.modelo.StatusConsulta;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TimeZone;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class GoogleAgendaCalendarAdapter implements GoogleAgendaCalendarioPort {
    static final String CALENDARIO_PRINCIPAL = "primary";
    static final String FUSO_HORARIO = "America/Sao_Paulo";
    static final String PROPRIEDADE_CONSULTA = "psiqappConsultaId";
    private static final ZoneId ZONA_LOCAL = ZoneId.of(FUSO_HORARIO);

    private final GoogleCalendarServiceFactory servicos;

    GoogleAgendaCalendarAdapter(GoogleCalendarServiceFactory servicos) {
        this.servicos = servicos;
    }

    @Override
    public List<Intervalo> consultarOcupacao(String refreshToken, Instant inicio, Instant fim) {
        try {
            var requisicao = new FreeBusyRequest()
                    .setTimeMin(new DateTime(java.util.Date.from(inicio), TimeZone.getTimeZone(ZONA_LOCAL)))
                    .setTimeMax(new DateTime(java.util.Date.from(fim), TimeZone.getTimeZone(ZONA_LOCAL)))
                    .setTimeZone(FUSO_HORARIO)
                    .setItems(List.of(new FreeBusyRequestItem().setId(CALENDARIO_PRINCIPAL)));
            var resposta = servicos.criar(refreshToken).freebusy().query(requisicao)
                    .setFields("calendars(primary(errors,busy(start,end)))")
                    .execute();
            var calendario = resposta.getCalendars() == null ? null : resposta.getCalendars().get(CALENDARIO_PRINCIPAL);
            if (calendario == null) throw falha(FalhaGoogleAgendaException.Tipo.PERMANENTE);
            if (calendario.getErrors() != null && !calendario.getErrors().isEmpty()) {
                throw falha(tipoErroFreeBusy(calendario.getErrors().getFirst().getReason()));
            }
            if (calendario.getBusy() == null) return List.of();
            return calendario.getBusy().stream()
                    .filter(intervalo -> intervalo.getStart() != null && intervalo.getEnd() != null)
                    .map(intervalo -> new Intervalo(Instant.ofEpochMilli(intervalo.getStart().getValue()),
                            Instant.ofEpochMilli(intervalo.getEnd().getValue())))
                    .toList();
        } catch (FalhaGoogleAgendaException excecao) {
            throw excecao;
        } catch (IOException excecao) {
            throw classificar(excecao);
        } catch (RuntimeException excecao) {
            throw new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.PERMANENTE);
        }
    }

    @Override
    public Optional<String> consultaAssociada(String refreshToken, String idEvento) {
        try {
            Event evento = servicos.criar(refreshToken).events().get(CALENDARIO_PRINCIPAL, idEvento)
                    .setFields("id,extendedProperties/private")
                    .execute();
            if (evento.getExtendedProperties() == null || evento.getExtendedProperties().getPrivate() == null) {
                return Optional.empty();
            }
            return Optional.ofNullable(evento.getExtendedProperties().getPrivate().get(PROPRIEDADE_CONSULTA));
        } catch (GoogleJsonResponseException excecao) {
            if (excecao.getStatusCode() == 404) return Optional.empty();
            throw classificar(excecao);
        } catch (IOException excecao) {
            throw classificar(excecao);
        } catch (RuntimeException excecao) {
            throw new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.PERMANENTE);
        }
    }

    @Override
    public void criarEvento(String refreshToken, String idEvento, EventoConsulta evento) {
        try {
            servicos.criar(refreshToken).events().insert(CALENDARIO_PRINCIPAL, paraGoogle(evento, idEvento))
                    .setFields("id")
                    .execute();
        } catch (IOException excecao) {
            throw classificar(excecao);
        } catch (RuntimeException excecao) {
            if (excecao instanceof FalhaGoogleAgendaException falha) throw falha;
            throw new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.PERMANENTE);
        }
    }

    @Override
    public void atualizarEvento(String refreshToken, String idEvento, EventoConsulta evento) {
        try {
            servicos.criar(refreshToken).events().patch(CALENDARIO_PRINCIPAL, idEvento, paraGoogle(evento, idEvento))
                    .setFields("id")
                    .execute();
        } catch (IOException excecao) {
            throw classificar(excecao);
        } catch (RuntimeException excecao) {
            if (excecao instanceof FalhaGoogleAgendaException falha) throw falha;
            throw new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.PERMANENTE);
        }
    }

    @Override
    public void removerEvento(String refreshToken, String idEvento) {
        try {
            servicos.criar(refreshToken).events().delete(CALENDARIO_PRINCIPAL, idEvento).execute();
        } catch (GoogleJsonResponseException excecao) {
            if (excecao.getStatusCode() != 404) throw classificar(excecao);
        } catch (IOException excecao) {
            throw classificar(excecao);
        } catch (RuntimeException excecao) {
            if (excecao instanceof FalhaGoogleAgendaException falha) throw falha;
            throw new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.PERMANENTE);
        }
    }

    private Event paraGoogle(EventoConsulta consulta, String idEvento) {
        var extensoes = new Event.ExtendedProperties()
                .setPrivate(Map.of(PROPRIEDADE_CONSULTA, consulta.consultaId().toString()));
        var evento = new Event()
                .setId(idEvento)
                .setSummary(titulo(consulta.nomePaciente(), consulta.status()))
                .setDescription("E-mail: " + consulta.emailPaciente())
                .setStart(dataHora(consulta.inicio()))
                .setEnd(dataHora(consulta.fim()))
                .setVisibility("private")
                .setTransparency("opaque")
                .setExtendedProperties(extensoes);
        return evento;
    }

    private EventDateTime dataHora(Instant instante) {
        return new EventDateTime()
                .setDateTime(new DateTime(java.util.Date.from(instante), TimeZone.getTimeZone(ZONA_LOCAL)))
                .setTimeZone(FUSO_HORARIO);
    }

    private String titulo(String nome, StatusConsulta status) {
        return switch (status) {
            case REALIZADA, FALTA -> "Consulta: " + nome + " (" + status.name() + ")";
            default -> "Consulta: " + nome;
        };
    }

    private FalhaGoogleAgendaException.Tipo tipoErroFreeBusy(String motivo) {
        if ("authError".equals(motivo) || "insufficientPermissions".equals(motivo)) {
            return FalhaGoogleAgendaException.Tipo.AUTORIZACAO;
        }
        if ("rateLimitExceeded".equals(motivo) || "backendError".equals(motivo)) {
            return FalhaGoogleAgendaException.Tipo.TRANSITORIA;
        }
        return FalhaGoogleAgendaException.Tipo.PERMANENTE;
    }

    private FalhaGoogleAgendaException classificar(IOException excecao) {
        if (excecao instanceof GoogleJsonResponseException resposta) return classificar(resposta);
        return new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.TRANSITORIA);
    }

    private FalhaGoogleAgendaException classificar(GoogleJsonResponseException excecao) {
        int status = excecao.getStatusCode();
        String motivo = excecao.getDetails() == null || excecao.getDetails().getErrors() == null
                || excecao.getDetails().getErrors().isEmpty()
                        ? ""
                        : excecao.getDetails().getErrors().getFirst().getReason();
        var tipo = motivo != null && (motivo.contains("rateLimit") || motivo.contains("userRateLimit"))
                ? FalhaGoogleAgendaException.Tipo.TRANSITORIA
                : status == 401 || status == 403 || "invalid_grant".equals(motivo) || "authError".equals(motivo)
                        ? FalhaGoogleAgendaException.Tipo.AUTORIZACAO
                        : status == 408 || status == 429 || status >= 500
                                ? FalhaGoogleAgendaException.Tipo.TRANSITORIA
                                : FalhaGoogleAgendaException.Tipo.PERMANENTE;
        return falha(tipo);
    }

    private FalhaGoogleAgendaException falha(FalhaGoogleAgendaException.Tipo tipo) {
        return new FalhaGoogleAgendaException(tipo);
    }
}
