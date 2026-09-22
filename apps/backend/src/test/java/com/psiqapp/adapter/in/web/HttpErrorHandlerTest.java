package com.psiqapp.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestComponent;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(controllers = HttpErrorHandlerTest.ControllerDeTeste.class)
@Import({HttpErrorHandlerTest.ControllerDeTeste.class, HttpErrorHandler.class, FiltroRequestId.class})
class HttpErrorHandlerTest {
    private static final String SENSIVEL = "CONTEUDO_FICTICIO_NAO_DEVE_VAZAR";
    @Autowired MockMvc mvc;

    @Test
    void validationRetornaProblemDetailsSemMensagemOuValorRejeitado() throws Exception {
        String id = UUID.randomUUID().toString();
        mvc.perform(post("/teste/entrada").header(FiltroRequestId.HEADER, id)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"texto\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("about:blank"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Bad Request"))
                .andExpect(jsonPath("$.codigo").value("ENTRADA_INVALIDA"))
                .andExpect(jsonPath("$.errosDeCampo[0].campo").value("texto"))
                .andExpect(jsonPath("$.errosDeCampo[0].mensagem").value("Valor invalido."))
                .andExpect(jsonPath("$.idRequisicao").value(id))
                .andExpect(jsonPath("$.instance").value("urn:uuid:" + id))
                .andExpect(header().string(FiltroRequestId.HEADER, id))
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).doesNotContain(SENSIVEL));
        assertThat(MDC.get("requestId")).isNull();
    }

    @Test
    void jsonMalformadoNaoEcoaBodyNemHeaderArbitrario() throws Exception {
        var resposta = mvc.perform(post("/teste/entrada")
                        .header(FiltroRequestId.HEADER, SENSIVEL)
                        .contentType(MediaType.APPLICATION_JSON).content(SENSIVEL))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("ENTRADA_INVALIDA"))
                .andExpect(jsonPath("$.errosDeCampo").doesNotExist())
                .andReturn().getResponse();
        String id = resposta.getHeader(FiltroRequestId.HEADER);
        assertThat(UUID.fromString(id).toString()).isEqualTo(id);
        assertThat(resposta.getContentAsString()).contains(id).doesNotContain(SENSIVEL);
    }

    @Test
    void recursoAusenteNaoEcoaCaminhoNemQueryString() throws Exception {
        mvc.perform(get("/nao-existe/" + SENSIVEL).param("q", SENSIVEL))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("RECURSO_NAO_ENCONTRADO"))
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).doesNotContain(SENSIVEL));
    }

    @Test
    void falhasTecnicasNaoExpoemMensagensDeExcecao() throws Exception {
        mvc.perform(get("/teste/falha"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.codigo").value("ERRO_INTERNO"))
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).doesNotContain(SENSIVEL));
        mvc.perform(get("/teste/indisponivel"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.codigo").value("SERVICO_INDISPONIVEL"))
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).doesNotContain(SENSIVEL));
    }

    @Test
    void preservaStatusDeConflitoSemExporReason() throws Exception {
        mvc.perform(get("/teste/conflito"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("CONFLITO"))
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).doesNotContain(SENSIVEL));
    }

    @Test
    void metodoNaoPermitidoPreservaHeaderAllow() throws Exception {
        mvc.perform(post("/teste/falha"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(header().string("Allow", "GET"))
                .andExpect(jsonPath("$.status").value(405));
    }

    @RestController
    @TestComponent
    static class ControllerDeTeste {
        record Entrada(@NotBlank(message = SENSIVEL) String texto) {}

        @PostMapping("/teste/entrada")
        void entrada(@Valid @RequestBody Entrada entrada) {}

        @GetMapping("/teste/falha")
        void falha() { throw new IllegalStateException(SENSIVEL); }

        @GetMapping("/teste/indisponivel")
        void indisponivel() { throw new DataAccessResourceFailureException(SENSIVEL); }

        @GetMapping("/teste/conflito")
        void conflito() { throw new ResponseStatusException(HttpStatus.CONFLICT, SENSIVEL); }
    }
}
