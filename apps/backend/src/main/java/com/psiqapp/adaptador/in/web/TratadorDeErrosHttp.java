package com.psiqapp.adaptador.in.web;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class TratadorDeErrosHttp extends ResponseEntityExceptionHandler {
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<RespostaProblema.ErroDeCampo> campos = List.of();
        if (ex instanceof MethodArgumentNotValidException validacao) {
            campos = validacao.getBindingResult().getFieldErrors().stream()
                    .map(erro -> new RespostaProblema.ErroDeCampo(
                            erro.getField().replaceAll("\\[[^]]*]", "[]"), "Valor invalido."))
                    .distinct().toList();
        }
        return resposta(status, headers, campos, request);
    }

    @ExceptionHandler(DataAccessResourceFailureException.class)
    ResponseEntity<Object> indisponibilidade(WebRequest request) {
        return resposta(HttpStatus.SERVICE_UNAVAILABLE, HttpHeaders.EMPTY, List.of(), request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> inesperado(WebRequest request) {
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, HttpHeaders.EMPTY, List.of(), request);
    }

    private ResponseEntity<Object> resposta(HttpStatusCode status, HttpHeaders headers,
            List<RespostaProblema.ErroDeCampo> campos, WebRequest request) {
        Object atributo = request.getAttribute(FiltroRequestId.ATRIBUTO, RequestAttributes.SCOPE_REQUEST);
        String requestId = atributo instanceof String id ? id : UUID.randomUUID().toString();
        String codigo = switch (status.value()) {
            case 400 -> "ENTRADA_INVALIDA";
            case 404 -> "RECURSO_NAO_ENCONTRADO";
            case 405 -> "METODO_NAO_PERMITIDO";
            case 406 -> "FORMATO_NAO_ACEITO";
            case 409 -> "CONFLITO";
            case 415 -> "TIPO_DE_CONTEUDO_NAO_SUPORTADO";
            case 503 -> "SERVICO_INDISPONIVEL";
            default -> status.is5xxServerError() ? "ERRO_INTERNO" : "REQUISICAO_REJEITADA";
        };
        String detalhe = switch (status.value()) {
            case 400 -> "Verifique os campos da requisicao.";
            case 404 -> "Recurso nao encontrado.";
            case 503 -> "Servico temporariamente indisponivel.";
            default -> "Nao foi possivel processar a requisicao.";
        };
        HttpStatus conhecido = HttpStatus.resolve(status.value());
        String titulo = conhecido == null ? "Erro HTTP" : conhecido.getReasonPhrase();
        var problema = new RespostaProblema(URI.create("about:blank"), titulo, status.value(),
                detalhe, URI.create("urn:uuid:" + requestId), codigo, campos, requestId);
        HttpHeaders seguros = new HttpHeaders();
        seguros.putAll(headers);
        seguros.setContentType(MediaType.APPLICATION_PROBLEM_JSON);
        seguros.set(FiltroRequestId.HEADER, requestId);
        MDC.put("codigo", codigo);
        return new ResponseEntity<>(problema, seguros, status);
    }
}
