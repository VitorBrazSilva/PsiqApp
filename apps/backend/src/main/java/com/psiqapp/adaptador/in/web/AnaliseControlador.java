package com.psiqapp.adaptador.in.web;

import com.psiqapp.aplicacao.usecase.*;
import java.net.URI;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients/{pacienteId}")
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AnaliseControlador {
    private final ObterEstadoAnaliseCasoDeUso obterEstado;
    private final ListarGeracoesAnaliseCasoDeUso listarGeracoes;
    private final ObterAnaliseCasoDeUso obterAnalise;
    private final SolicitarRegeneracaoAnaliseCasoDeUso regenerar;

    public AnaliseControlador(ObterEstadoAnaliseCasoDeUso obterEstado,
            ListarGeracoesAnaliseCasoDeUso listarGeracoes, ObterAnaliseCasoDeUso obterAnalise,
            SolicitarRegeneracaoAnaliseCasoDeUso regenerar) {
        this.obterEstado = obterEstado;
        this.listarGeracoes = listarGeracoes;
        this.obterAnalise = obterAnalise;
        this.regenerar = regenerar;
    }

    @GetMapping("/analysis-state")
    EstadoAnaliseResposta estado(@PathVariable UUID pacienteId) {
        return EstadoAnaliseResposta.de(obterEstado.executar(pacienteId));
    }

    @GetMapping("/analysis-generations")
    PaginaResposta<GeracaoAnaliseResposta> geracoes(@PathVariable UUID pacienteId,
            @RequestParam(name = "page", required = false) Integer pagina,
            @RequestParam(name = "size", required = false) Integer tamanho) {
        return PaginaResposta.de(listarGeracoes.executar(pacienteId, pagina, tamanho), GeracaoAnaliseResposta::de);
    }

    @GetMapping("/analyses/{analiseId}")
    AnaliseResposta analise(@PathVariable UUID pacienteId, @PathVariable UUID analiseId) {
        return AnaliseResposta.de(obterAnalise.executar(pacienteId, analiseId));
    }

    @PostMapping("/analysis-generations")
    ResponseEntity<GeracaoAnaliseResposta> regenerar(@PathVariable UUID pacienteId,
            @RequestHeader("Idempotency-Key") String chave) {
        var resultado = regenerar.executar(pacienteId, ChaveIdempotencia.obrigatoria(chave));
        return ResponseEntity.accepted()
                .location(URI.create("/api/v1/patients/" + pacienteId + "/analysis-generations/"
                        + resultado.geracao().id()))
                .body(GeracaoAnaliseResposta.de(resultado.geracao()));
    }
}
