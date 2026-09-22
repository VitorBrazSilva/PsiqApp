package com.psiqapp.adapter.in.web;

import com.psiqapp.application.usecase.BuscarPacientesUseCase;
import com.psiqapp.application.usecase.CriarPacienteUseCase;
import com.psiqapp.application.usecase.ObterPacienteUseCase;
import java.net.URI;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pacientes")
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class PacienteController {
    private final CriarPacienteUseCase criarPaciente;
    private final BuscarPacientesUseCase buscarPacientes;
    private final ObterPacienteUseCase obterPaciente;

    public PacienteController(CriarPacienteUseCase criarPaciente, BuscarPacientesUseCase buscarPacientes,
            ObterPacienteUseCase obterPaciente) {
        this.criarPaciente = criarPaciente;
        this.buscarPacientes = buscarPacientes;
        this.obterPaciente = obterPaciente;
    }

    @PostMapping
    ResponseEntity<PacienteResponse> criar(@RequestHeader(value = "Idempotency-Key", required = false) String chave,
            @RequestBody CriarPacienteRequest requisicao) {
        var paciente = criarPaciente.executar(new CriarPacienteUseCase.Comando(requisicao.nome(), requisicao.cpf(),
                requisicao.dataNascimento(), requisicao.telefone(), requisicao.email(), requisicao.queixaInicial(),
                ChaveIdempotencia.obrigatoria(chave)));
        return ResponseEntity.created(URI.create("/api/v1/pacientes/" + paciente.id())).body(PacienteResponse.de(paciente));
    }

    @GetMapping
    PaginaResponse<PacienteResponse> buscar(@RequestParam(name = "nome", required = false) String termo,
            @RequestParam(name = "pagina", required = false) Integer pagina,
            @RequestParam(name = "tamanho", required = false) Integer tamanho) {
        return PaginaResponse.de(buscarPacientes.executar(termo, pagina, tamanho), PacienteResponse::de);
    }

    @GetMapping("/{id}")
    PacienteResponse obter(@PathVariable UUID id) {
        return PacienteResponse.de(obterPaciente.executar(id));
    }
}
