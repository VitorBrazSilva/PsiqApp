package com.psiqapp.adapter.in.web;

import com.psiqapp.application.port.out.GrupoAgendaConsulta;
import com.psiqapp.application.port.out.PaginaAgendaConsultas;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import java.util.Map;

record PaginaAgendaResponse(
        java.util.List<ConsultaResponse> itens,
        int pagina,
        int tamanho,
        long total,
        Map<GrupoAgendaConsulta, Long> contagens) {
    static PaginaAgendaResponse de(PaginaAgendaConsultas resultado,
            Map<java.util.UUID, RepositorySincronizacaoConsultaPort.Situacao> sincronizacoes) {
        var pagina = resultado.pagina();
        return new PaginaAgendaResponse(pagina.itens().stream()
                .map(consulta -> ConsultaResponse.de(consulta, sincronizacoes.get(consulta.id()))).toList(),
                pagina.pagina(), pagina.tamanho(), pagina.total(), resultado.contagens());
    }
}
