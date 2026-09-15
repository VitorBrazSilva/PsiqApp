package com.psiqapp.adaptador.in.web;

import com.psiqapp.aplicacao.usecase.CriarComplementoCasoDeUso;
import com.psiqapp.aplicacao.usecase.CriarParecerCasoDeUso;
import com.psiqapp.aplicacao.usecase.ListarLinhaDoTempoCasoDeUso;
import com.psiqapp.aplicacao.usecase.ObterRegistroClinicoCasoDeUso;
import java.net.URI;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients/{pacienteId}/clinical-records")
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class RegistroClinicoControlador {
    private final CriarParecerCasoDeUso criarParecer;
    private final CriarComplementoCasoDeUso criarComplemento;
    private final ListarLinhaDoTempoCasoDeUso listarLinhaDoTempo;
    private final ObterRegistroClinicoCasoDeUso obterRegistro;

    public RegistroClinicoControlador(CriarParecerCasoDeUso criarParecer, CriarComplementoCasoDeUso criarComplemento,
            ListarLinhaDoTempoCasoDeUso listarLinhaDoTempo, ObterRegistroClinicoCasoDeUso obterRegistro) {
        this.criarParecer = criarParecer;
        this.criarComplemento = criarComplemento;
        this.listarLinhaDoTempo = listarLinhaDoTempo;
        this.obterRegistro = obterRegistro;
    }

    @PostMapping
    ResponseEntity<CriarRegistroClinicoResposta> criarParecer(@PathVariable UUID pacienteId,
            @RequestHeader("Idempotency-Key") String chave, @RequestBody CriarRegistroClinicoRequisicao requisicao) {
        var resultado = criarParecer.executar(new CriarParecerCasoDeUso.Comando(pacienteId, requisicao.texto(),
                requisicao.humor(), requisicao.medicamentos(), requisicao.dataHoraClinica(), requisicao.consultaId(),
                ChaveIdempotencia.obrigatoria(chave)));
        return ResponseEntity.created(URI.create("/api/v1/patients/" + pacienteId + "/clinical-records/"
                + resultado.registro().id())).body(CriarRegistroClinicoResposta.de(resultado));
    }

    @PostMapping("/{originalId}/complements")
    ResponseEntity<CriarRegistroClinicoResposta> criarComplemento(@PathVariable UUID pacienteId,
            @PathVariable UUID originalId, @RequestHeader("Idempotency-Key") String chave,
            @RequestBody CriarRegistroClinicoRequisicao requisicao) {
        var resultado = criarComplemento.executar(new CriarComplementoCasoDeUso.Comando(pacienteId, originalId,
                requisicao.texto(), requisicao.humor(), requisicao.medicamentos(), requisicao.dataHoraClinica(),
                requisicao.consultaId(), ChaveIdempotencia.obrigatoria(chave)));
        return ResponseEntity.created(URI.create("/api/v1/patients/" + pacienteId + "/clinical-records/"
                + resultado.registro().id())).body(CriarRegistroClinicoResposta.de(resultado));
    }

    @GetMapping
    PaginaResposta<RegistroClinicoResposta> listar(@PathVariable UUID pacienteId,
            @RequestParam(name = "page", required = false) Integer pagina,
            @RequestParam(name = "size", required = false) Integer tamanho) {
        return PaginaResposta.de(listarLinhaDoTempo.executar(pacienteId, pagina, tamanho), RegistroClinicoResposta::de);
    }

    @GetMapping("/{registroId}")
    RegistroClinicoResposta obter(@PathVariable UUID pacienteId, @PathVariable UUID registroId) {
        return RegistroClinicoResposta.de(obterRegistro.executar(pacienteId, registroId));
    }
}
