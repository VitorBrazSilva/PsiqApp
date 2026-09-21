package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.*;
import java.net.URI;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients/{pacienteId}")
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AnaliseController {
    private final ObterEstadoAnaliseUseCase obterEstado;
    private final ListarGeracoesAnaliseUseCase listarGeracoes;
    private final ObterAnaliseUseCase obterAnalise;
    private final SolicitarRegeneracaoAnaliseUseCase regenerar;

    public AnaliseController(ObterEstadoAnaliseUseCase obterEstado,
            ListarGeracoesAnaliseUseCase listarGeracoes, ObterAnaliseUseCase obterAnalise,
            SolicitarRegeneracaoAnaliseUseCase regenerar) {
        this.obterEstado = obterEstado;
        this.listarGeracoes = listarGeracoes;
        this.obterAnalise = obterAnalise;
        this.regenerar = regenerar;
    }

    @GetMapping("/analysis-state")
    EstadoAnaliseResponse estado(@PathVariable UUID pacienteId) {
        return EstadoAnaliseResponse.de(obterEstado.executar(pacienteId));
    }

    @GetMapping("/analysis-generations")
    PaginaResponse<GeracaoAnaliseResponse> geracoes(@PathVariable UUID pacienteId,
            @RequestParam(name = "page", required = false) Integer pagina,
            @RequestParam(name = "size", required = false) Integer tamanho) {
        return PaginaResponse.de(listarGeracoes.executar(pacienteId, pagina, tamanho), GeracaoAnaliseResponse::de);
    }

    @GetMapping("/analyses/{analiseId}")
    AnaliseResponse analise(@PathVariable UUID pacienteId, @PathVariable UUID analiseId) {
        return AnaliseResponse.de(obterAnalise.executar(pacienteId, analiseId));
    }

    @PostMapping("/analysis-generations")
    ResponseEntity<GeracaoAnaliseResponse> regenerar(@PathVariable UUID pacienteId,
            @RequestHeader(value = "Idempotency-Key", required = false) String chave) {
        var resultado = regenerar.executar(pacienteId, ChaveIdempotencia.obrigatoria(chave));
        return ResponseEntity.accepted()
                .location(URI.create("/api/v1/patients/" + pacienteId + "/analysis-generations/"
                        + resultado.geracao().id()))
                .body(GeracaoAnaliseResponse.de(resultado.geracao()));
    }
}
