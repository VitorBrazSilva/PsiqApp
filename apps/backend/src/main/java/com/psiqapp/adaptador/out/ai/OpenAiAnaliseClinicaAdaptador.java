package com.psiqapp.adaptador.out.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.psiqapp.aplicacao.port.FalhaProviderException;
import com.psiqapp.aplicacao.port.ProvedorAnaliseClinicaPort;
import com.psiqapp.aplicacao.servico.ValidadorRespostaAnalise;
import com.psiqapp.configuracao.OpenAiPropriedades;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.core.JsonSchemaLocalValidation;
import com.openai.errors.OpenAIIoException;
import com.openai.errors.OpenAIRetryableException;
import com.openai.errors.OpenAIServiceException;
import com.openai.models.responses.ResponseUsage;
import com.openai.models.responses.StructuredResponseCreateParams;
import java.util.Map;
import java.util.Optional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
@ConditionalOnProperty(prefix = "psiqapp.analysis.provider", name = "type", havingValue = "openai")
class OpenAiAnaliseClinicaAdaptador implements ProvedorAnaliseClinicaPort {
    private final OpenAiPropriedades props;
    private final ObjectMapper json;

    OpenAiAnaliseClinicaAdaptador(OpenAiPropriedades props, ObjectMapper json) {
        this.props = props;
        this.json = json;
    }

    @Override
    public RespostaProvider gerar(Solicitacao solicitacao) {
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            throw new FalhaProviderException("OPENAI_CONFIGURATION_INVALID", false, null);
        }
        try {
            OpenAIClient client = OpenAIOkHttpClient.fromEnv()
                    .withOptions(options -> options.timeout(solicitacao.timeout()).maxRetries(0));
            StructuredResponseCreateParams<ValidadorRespostaAnalise.Resposta> params =
                    com.openai.models.responses.ResponseCreateParams.builder()
                            .model(props.model())
                            .instructions(instrucoesSistema())
                            .input(montarPayload(solicitacao))
                            .text(ValidadorRespostaAnalise.Resposta.class, JsonSchemaLocalValidation.NO)
                            .build();
            var resposta = client.responses().create(params);
            var payload = resposta.output().stream()
                    .flatMap(item -> item.message().stream())
                    .flatMap(message -> message.content().stream())
                    .flatMap(content -> content.outputText().stream())
                    .findFirst()
                    .orElseThrow(() -> new FalhaProviderException("OPENAI_EMPTY_RESPONSE", false, null));
            var usage = resposta.usage().orElse(null);
            return new RespostaProvider(payload, resposta.id(), tokensEntrada(usage), tokensSaida(usage));
        } catch (FalhaProviderException e) {
            throw e;
        } catch (OpenAIRetryableException | OpenAIIoException e) {
            throw new FalhaProviderException("OPENAI_TRANSIENT_ERROR", true, null);
        } catch (OpenAIServiceException e) {
            boolean transitoria = e.statusCode() == 429 || e.statusCode() >= 500;
            String codigo = transitoria ? "OPENAI_TRANSIENT_HTTP_" + e.statusCode()
                    : "OPENAI_PERMANENT_HTTP_" + e.statusCode();
            throw new FalhaProviderException(codigo, transitoria, retryAfterMs(e));
        } catch (IllegalArgumentException e) {
            throw new FalhaProviderException("OPENAI_CONFIGURATION_INVALID", false, null);
        } catch (RuntimeException e) {
            throw new FalhaProviderException("OPENAI_TRANSIENT_ERROR", true, null);
        }
    }

    private String montarPayload(Solicitacao solicitacao) {
        try {
            return json.writeValueAsString(Map.of(
                    "model", props.model(),
                    "mode", solicitacao.modo().name(),
                    "snapshotRevision", solicitacao.snapshot().revisaoSnapshot(),
                    "records", solicitacao.snapshot().registros()));
        } catch (JsonProcessingException e) {
            throw new FalhaProviderException("OPENAI_PAYLOAD_INVALID", false, null);
        }
    }

    private String instrucoesSistema() {
        return """
                Voce gera exclusivamente JSON estruturado para apoiar leitura longitudinal psiquiatrica.
                Use somente os registros enviados, sem diagnosticar, prescrever, recomendar conduta,
                inventar informacoes ou usar conhecimento externo para criar fatos clinicos.
                Cada item de timeline, patterns e attentionPoints deve ter evidence com recordAlias,
                field e quote literal copiado do snapshot. O campo evidence.field deve ser exatamente
                uma destas strings minúsculas: "text", "mood" ou "medications"; nunca use maiúsculas.
                REGRA CRITICA SOBRE evidence.quote: quote nao e resumo, traducao, correcao ou reescrita.
                Para cada evidencia, copie exatamente um trecho continuo do valor do campo fonte do registro
                escolhido, preservando palavras, acentos, pontuacao e ordem. Nao invente trechos e nao use
                reticencias. Antes de responder, confirme que cada quote aparece literalmente no campo fonte.
                Em SUMMARY_ONLY, patterns deve ser vazio
                e limitations deve declarar insuficiencia para evolucao ou tendencia longitudinal.
                """;
    }

    private Integer tokensEntrada(ResponseUsage usage) {
        if (usage == null || usage.inputTokens() > Integer.MAX_VALUE) {
            return null;
        }
        return (int) usage.inputTokens();
    }

    private Integer tokensSaida(ResponseUsage usage) {
        if (usage == null || usage.outputTokens() > Integer.MAX_VALUE) {
            return null;
        }
        return (int) usage.outputTokens();
    }

    private Long retryAfterMs(OpenAIServiceException e) {
        Optional<String> valor = e.headers().values("retry-after").stream().findFirst();
        if (valor.isEmpty()) {
            return null;
        }
        try {
            return Math.max(0, Long.parseLong(valor.get())) * 1000;
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}
