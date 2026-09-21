package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.AtualizarStatusConsultaUseCase;
import com.psiqapp.application.usecase.CriarConsultaUseCase;
import com.psiqapp.application.usecase.ListarConsultasUseCase;
import java.net.URI;
import java.time.Instant;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class ConsultaController {
    private final CriarConsultaUseCase criarConsulta;
    private final ListarConsultasUseCase listarConsultas;
    private final AtualizarStatusConsultaUseCase atualizarStatus;

    public ConsultaController(CriarConsultaUseCase criarConsulta, ListarConsultasUseCase listarConsultas,
            AtualizarStatusConsultaUseCase atualizarStatus) {
        this.criarConsulta = criarConsulta;
        this.listarConsultas = listarConsultas;
        this.atualizarStatus = atualizarStatus;
    }

    @PostMapping("/api/v1/patients/{pacienteId}/appointments")
    ResponseEntity<ConsultaResponse> criar(@PathVariable UUID pacienteId,
            @RequestHeader(value = "Idempotency-Key", required = false) String chave,
            @RequestBody CriarConsultaRequest requisicao) {
        var consulta = criarConsulta.executar(new CriarConsultaUseCase.Comando(pacienteId,
                requisicao.agendadaPara(), requisicao.observacoes(), ChaveIdempotencia.obrigatoria(chave)));
        return ResponseEntity.created(URI.create("/api/v1/appointments/" + consulta.id())).body(ConsultaResponse.de(consulta));
    }

    @GetMapping("/api/v1/appointments")
    PaginaResponse<ConsultaResponse> listar(@RequestParam(name = "from", required = false) Instant from,
            @RequestParam(name = "to", required = false) Instant to,
            @RequestParam(name = "patientId", required = false) UUID patientId,
            @RequestParam(name = "page", required = false) Integer pagina,
            @RequestParam(name = "size", required = false) Integer tamanho) {
        return PaginaResponse.de(listarConsultas.executar(from, to, patientId, pagina, tamanho), ConsultaResponse::de);
    }

    @PostMapping("/api/v1/appointments/{id}/status")
    ConsultaResponse status(@PathVariable UUID id, @RequestBody AtualizarStatusConsultaRequest requisicao) {
        return ConsultaResponse.de(atualizarStatus.executar(id, requisicao.status()));
    }
}
