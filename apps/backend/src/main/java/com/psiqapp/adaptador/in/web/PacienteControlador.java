package com.psiqapp.adaptador.in.web;

import com.psiqapp.aplicacao.usecase.BuscarPacientesCasoDeUso;
import com.psiqapp.aplicacao.usecase.CriarPacienteCasoDeUso;
import com.psiqapp.aplicacao.usecase.ObterPacienteCasoDeUso;
import java.net.URI;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class PacienteControlador {
    private final CriarPacienteCasoDeUso criarPaciente;
    private final BuscarPacientesCasoDeUso buscarPacientes;
    private final ObterPacienteCasoDeUso obterPaciente;

    public PacienteControlador(CriarPacienteCasoDeUso criarPaciente, BuscarPacientesCasoDeUso buscarPacientes,
            ObterPacienteCasoDeUso obterPaciente) {
        this.criarPaciente = criarPaciente;
        this.buscarPacientes = buscarPacientes;
        this.obterPaciente = obterPaciente;
    }

    @PostMapping
    ResponseEntity<PacienteResposta> criar(@RequestHeader(value = "Idempotency-Key", required = false) String chave,
            @RequestBody CriarPacienteRequisicao requisicao) {
        var paciente = criarPaciente.executar(new CriarPacienteCasoDeUso.Comando(requisicao.nome(), requisicao.cpf(),
                requisicao.dataNascimento(), requisicao.telefone(), requisicao.email(), requisicao.queixaInicial(),
                ChaveIdempotencia.obrigatoria(chave)));
        return ResponseEntity.created(URI.create("/api/v1/patients/" + paciente.id())).body(PacienteResposta.de(paciente));
    }

    @GetMapping
    PaginaResposta<PacienteResposta> buscar(@RequestParam(name = "q", required = false) String termo,
            @RequestParam(name = "page", required = false) Integer pagina,
            @RequestParam(name = "size", required = false) Integer tamanho) {
        return PaginaResposta.de(buscarPacientes.executar(termo, pagina, tamanho), PacienteResposta::de);
    }

    @GetMapping("/{id}")
    PacienteResposta obter(@PathVariable UUID id) {
        return PacienteResposta.de(obterPaciente.executar(id));
    }
}
