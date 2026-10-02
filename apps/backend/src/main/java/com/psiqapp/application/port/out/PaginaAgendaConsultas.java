package com.psiqapp.application.port.out;

import java.util.Map;

public record PaginaAgendaConsultas(Pagina<com.psiqapp.domain.modelo.Consulta> pagina,
        Map<GrupoAgendaConsulta, Long> contagens) {}
