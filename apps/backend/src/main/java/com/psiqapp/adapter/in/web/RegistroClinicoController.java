package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.CriarComplementoUseCase;
import com.psiqapp.application.usecase.CriarParecerUseCase;
import com.psiqapp.application.usecase.ListarLinhaDoTempoUseCase;
import com.psiqapp.application.usecase.ObterRegistroClinicoUseCase;
import java.net.URI;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients/{pacienteId}/clinical-records")
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class RegistroClinicoController {
    private final CriarParecerUseCase criarParecer;
    private final CriarComplementoUseCase criarComplemento;
    private final ListarLinhaDoTempoUseCase listarLinhaDoTempo;
    private final ObterRegistroClinicoUseCase obterRegistro;

    public RegistroClinicoController(CriarParecerUseCase criarParecer, CriarComplementoUseCase criarComplemento,
            ListarLinhaDoTempoUseCase listarLinhaDoTempo, ObterRegistroClinicoUseCase obterRegistro) {
        this.criarParecer = criarParecer;
        this.criarComplemento = criarComplemento;
        this.listarLinhaDoTempo = listarLinhaDoTempo;
        this.obterRegistro = obterRegistro;
    }

    @PostMapping
    ResponseEntity<CriarRegistroClinicoResponse> criarParecer(@PathVariable UUID pacienteId,
            @RequestHeader(value = "Idempotency-Key", required = false) String chave,
            @RequestBody CriarRegistroClinicoRequest requisicao) {
        var resultado = criarParecer.executar(new CriarParecerUseCase.Comando(pacienteId, requisicao.texto(),
                requisicao.humor(), requisicao.medicamentos(), requisicao.dataHoraClinica(), requisicao.consultaId(),
                ChaveIdempotencia.obrigatoria(chave)));
        return ResponseEntity.created(URI.create("/api/v1/patients/" + pacienteId + "/clinical-records/"
                + resultado.registro().id())).body(CriarRegistroClinicoResponse.de(resultado));
    }

    @PostMapping("/{originalId}/complements")
    ResponseEntity<CriarRegistroClinicoResponse> criarComplemento(@PathVariable UUID pacienteId,
            @PathVariable UUID originalId, @RequestHeader(value = "Idempotency-Key", required = false) String chave,
            @RequestBody CriarRegistroClinicoRequest requisicao) {
        var resultado = criarComplemento.executar(new CriarComplementoUseCase.Comando(pacienteId, originalId,
                requisicao.texto(), requisicao.humor(), requisicao.medicamentos(), requisicao.dataHoraClinica(),
                requisicao.consultaId(), ChaveIdempotencia.obrigatoria(chave)));
        return ResponseEntity.created(URI.create("/api/v1/patients/" + pacienteId + "/clinical-records/"
                + resultado.registro().id())).body(CriarRegistroClinicoResponse.de(resultado));
    }

    @GetMapping
    PaginaResponse<RegistroClinicoResponse> listar(@PathVariable UUID pacienteId,
            @RequestParam(name = "page", required = false) Integer pagina,
            @RequestParam(name = "size", required = false) Integer tamanho) {
        return PaginaResponse.de(listarLinhaDoTempo.executar(pacienteId, pagina, tamanho), RegistroClinicoResponse::de);
    }

    @GetMapping("/{registroId}")
    RegistroClinicoResponse obter(@PathVariable UUID pacienteId, @PathVariable UUID registroId) {
        return RegistroClinicoResponse.de(obterRegistro.executar(pacienteId, registroId));
    }
}
