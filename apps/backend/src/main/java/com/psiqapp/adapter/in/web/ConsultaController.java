package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.AtualizarStatusConsultaUseCase;
import com.psiqapp.application.usecase.CriarConsultaUseCase;
import com.psiqapp.application.usecase.ListarConsultasUseCase;
import com.psiqapp.application.usecase.VerificarDisponibilidadeConsultaUseCase;
import com.psiqapp.application.usecase.ConsultarDisponibilidadeMensalUseCase;
import com.psiqapp.application.usecase.TentarNovamenteSincronizacaoGoogleAgendaUseCase;
import com.psiqapp.application.usecase.ObterEstadosSincronizacaoConsultaUseCase;
import java.net.URI;
import java.time.Instant;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class ConsultaController {
    private final CriarConsultaUseCase criarConsulta;
    private final ListarConsultasUseCase listarConsultas;
    private final AtualizarStatusConsultaUseCase atualizarStatus;
    private final VerificarDisponibilidadeConsultaUseCase verificarDisponibilidade;
    private final ConsultarDisponibilidadeMensalUseCase disponibilidadeMensal;
    private final TentarNovamenteSincronizacaoGoogleAgendaUseCase tentarNovamente;
    private final ObterEstadosSincronizacaoConsultaUseCase estadosSincronizacao;

    public ConsultaController(CriarConsultaUseCase criarConsulta, ListarConsultasUseCase listarConsultas,
            AtualizarStatusConsultaUseCase atualizarStatus,
            VerificarDisponibilidadeConsultaUseCase verificarDisponibilidade,
            ConsultarDisponibilidadeMensalUseCase disponibilidadeMensal,
            TentarNovamenteSincronizacaoGoogleAgendaUseCase tentarNovamente,
            ObterEstadosSincronizacaoConsultaUseCase estadosSincronizacao) {
        this.criarConsulta = criarConsulta;
        this.listarConsultas = listarConsultas;
        this.atualizarStatus = atualizarStatus;
        this.verificarDisponibilidade = verificarDisponibilidade;
        this.disponibilidadeMensal = disponibilidadeMensal;
        this.tentarNovamente = tentarNovamente;
        this.estadosSincronizacao = estadosSincronizacao;
    }

    @PostMapping("/api/v1/pacientes/{pacienteId}/consultas")
    ResponseEntity<ConsultaResponse> criar(@PathVariable UUID pacienteId,
            @RequestHeader(value = "Idempotency-Key", required = false) String chave,
            @RequestBody CriarConsultaRequest requisicao) {
        var consulta = criarConsulta.executar(new CriarConsultaUseCase.Comando(pacienteId,
                requisicao.agendadaPara(), requisicao.observacoes(), ChaveIdempotencia.obrigatoria(chave)));
        var situacao = estadosSincronizacao.buscar(consulta.id()).orElse(null);
        return ResponseEntity.created(URI.create("/api/v1/consultas/" + consulta.id()))
                .body(ConsultaResponse.de(consulta, situacao));
    }

    @GetMapping("/api/v1/consultas")
    PaginaResponse<ConsultaResponse> listar(@RequestParam(name = "de", required = false) Instant de,
            @RequestParam(name = "ate", required = false) Instant ate,
            @RequestParam(name = "pacienteId", required = false) UUID pacienteId,
            @RequestParam(name = "pagina", required = false) Integer pagina,
            @RequestParam(name = "tamanho", required = false) Integer tamanho) {
        var resultado = listarConsultas.executar(de, ate, pacienteId, pagina, tamanho);
        var porConsulta = estadosSincronizacao.listar(resultado.itens().stream().map(consulta -> consulta.id()).toList());
        return PaginaResponse.de(resultado,
                consulta -> ConsultaResponse.de(consulta, porConsulta.get(consulta.id())));
    }

    @PostMapping("/api/v1/consultas/{id}/status")
    ConsultaResponse status(@PathVariable UUID id, @RequestBody AtualizarStatusConsultaRequest requisicao) {
        var consulta = atualizarStatus.executar(id, requisicao.status());
        return ConsultaResponse.de(consulta, estadosSincronizacao.buscar(id).orElse(null));
    }

    @GetMapping("/api/v1/consultas/disponibilidade")
    DisponibilidadeConsultaResponse disponibilidade(@RequestParam Instant agendadaPara) {
        return DisponibilidadeConsultaResponse.de(verificarDisponibilidade.executar(agendadaPara));
    }

    @GetMapping("/api/v1/consultas/disponibilidade/mensal")
    ResponseEntity<DisponibilidadeMensalResponse> disponibilidadeMensal(
            @RequestParam(name = "mes", required = false) String mesInformado,
            HttpServletResponse resposta) {
        resposta.setHeader("Cache-Control", "no-store");
        java.time.YearMonth mes = null;
        if (mesInformado != null) {
            if (!mesInformado.matches("[0-9]{4}-[0-9]{2}")) {
                throw new com.psiqapp.domain.exception.ValidacaoException(java.util.List.of(
                        new com.psiqapp.domain.validation.ErroDeValidacao("mes", "Informe o mês no formato YYYY-MM.")));
            }
            try {
                mes = java.time.YearMonth.parse(mesInformado);
            } catch (java.time.DateTimeException formatoInvalido) {
                throw new com.psiqapp.domain.exception.ValidacaoException(java.util.List.of(
                        new com.psiqapp.domain.validation.ErroDeValidacao("mes", "Informe o mês no formato YYYY-MM.")));
            }
        }
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(DisponibilidadeMensalResponse.de(disponibilidadeMensal.executar(mes)));
    }

    @PostMapping("/api/v1/consultas/{id}/sincronizacao-google/tentar-novamente")
    ResponseEntity<ConsultaResponse> tentarNovamente(@PathVariable UUID id) {
        var consulta = tentarNovamente.executar(id);
        var situacao = estadosSincronizacao.buscar(id).orElse(null);
        return ResponseEntity.accepted().body(ConsultaResponse.de(consulta, situacao));
    }
}
