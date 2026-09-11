package com.psiqapp.adaptador.in.web;

import com.psiqapp.aplicacao.usecase.AtualizarStatusConsultaCasoDeUso;
import com.psiqapp.aplicacao.usecase.CriarConsultaCasoDeUso;
import com.psiqapp.aplicacao.usecase.ListarConsultasCasoDeUso;
import java.net.URI;
import java.time.Instant;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class ConsultaControlador {
    private final CriarConsultaCasoDeUso criarConsulta;
    private final ListarConsultasCasoDeUso listarConsultas;
    private final AtualizarStatusConsultaCasoDeUso atualizarStatus;

    public ConsultaControlador(CriarConsultaCasoDeUso criarConsulta, ListarConsultasCasoDeUso listarConsultas,
            AtualizarStatusConsultaCasoDeUso atualizarStatus) {
        this.criarConsulta = criarConsulta;
        this.listarConsultas = listarConsultas;
        this.atualizarStatus = atualizarStatus;
    }

    @PostMapping("/api/v1/patients/{pacienteId}/appointments")
    ResponseEntity<ConsultaResposta> criar(@PathVariable UUID pacienteId,
            @RequestHeader("Idempotency-Key") String chave, @RequestBody CriarConsultaRequisicao requisicao) {
        var consulta = criarConsulta.executar(new CriarConsultaCasoDeUso.Comando(pacienteId,
                requisicao.agendadaPara(), requisicao.observacoes(), ChaveIdempotencia.obrigatoria(chave)));
        return ResponseEntity.created(URI.create("/api/v1/appointments/" + consulta.id())).body(ConsultaResposta.de(consulta));
    }

    @GetMapping("/api/v1/appointments")
    PaginaResposta<ConsultaResposta> listar(@RequestParam(name = "from", required = false) Instant from,
            @RequestParam(name = "to", required = false) Instant to,
            @RequestParam(name = "patientId", required = false) UUID patientId,
            @RequestParam(name = "page", required = false) Integer pagina,
            @RequestParam(name = "size", required = false) Integer tamanho) {
        return PaginaResposta.de(listarConsultas.executar(from, to, patientId, pagina, tamanho), ConsultaResposta::de);
    }

    @PostMapping("/api/v1/appointments/{id}/status")
    ConsultaResposta status(@PathVariable UUID id, @RequestBody AtualizarStatusConsultaRequisicao requisicao) {
        return ConsultaResposta.de(atualizarStatus.executar(id, requisicao.status()));
    }
}
