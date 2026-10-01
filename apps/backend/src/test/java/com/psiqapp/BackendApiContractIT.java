package com.psiqapp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import java.net.URI;
import java.util.Map;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
@Testcontainers
class BackendApiContractIT {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired TestRestTemplate http;
    @Autowired Flyway flyway;
    @Autowired JdbcTemplate jdbc;

    @BeforeEach
    void limparBanco() {
        flyway.migrate();
        jdbc.execute("""
                truncate table evidencia_analise, analise_clinica, tentativa_geracao_analise, geracao_analise,
                registro_clinico, idempotencia, consulta, paciente restart identity cascade
                """);
    }

    @Test
    void contratoRestConsolidadoExpoeRotasDtoDatasPaginacaoEPrivacidade() {
        UUID pacienteId = UUID.fromString(criarPaciente(UUID.randomUUID(), "Ana Contrato",
                "529.982.247-25").getBody().path("id").asText());
        UUID consultaId = UUID.fromString(criarConsulta(pacienteId, UUID.randomUUID(),
                "2026-09-10T10:00:00-03:00").getBody().path("id").asText());
        var parecer = criarParecer(pacienteId, UUID.randomUUID(), Map.of(
                "texto", "Registro clinico ficticio para contrato.",
                "humor", "Humor ficticio preservado.",
                "medicamentos", "Medicamento ficticio registrado.",
                "dataHoraClinica", "2026-09-10T09:30:00-03:00",
                "consultaId", consultaId.toString()));
        UUID registroId = UUID.fromString(parecer.getBody().path("registro").path("id").asText());

        assertThat(parecer.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(parecer.getBody().path("registro").path("dataHoraClinica").asText())
                .isEqualTo("2026-09-10T12:30:00Z");
        assertThat(parecer.getBody().path("registro").path("criadoEm").asText()).endsWith("Z");
        assertThat(parecer.getBody().path("registro").path("pacienteId").asText()).isEqualTo(pacienteId.toString());
        assertThat(parecer.getBody().path("geracao").path("estado").asText()).isEqualTo("ENFILEIRADA");

        var paciente = http.getForEntity("/api/v1/pacientes/" + pacienteId, JsonNode.class);
        assertThat(paciente.getBody().path("dataNascimento").asText()).isEqualTo("1990-01-01");
        assertThat(paciente.getBody().path("cpf").asText()).isEqualTo("***.***.***-25");
        assertThat(paciente.getBody().toString()).doesNotContain("52998224725").doesNotContain("529.982.247-25");

        var timelinePadrao = http.getForEntity("/api/v1/pacientes/" + pacienteId + "/registros-clinicos",
                JsonNode.class);
        assertThat(timelinePadrao.getBody().path("pagina").asInt()).isZero();
        assertThat(timelinePadrao.getBody().path("tamanho").asInt()).isEqualTo(25);
        assertThat(timelinePadrao.getBody().path("itens").get(0).path("id").asText()).isEqualTo(registroId.toString());

        var timelineMaximo = http.getForEntity("/api/v1/pacientes/" + pacienteId + "/registros-clinicos?tamanho=100",
                JsonNode.class);
        assertThat(timelineMaximo.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(timelineMaximo.getBody().path("tamanho").asInt()).isEqualTo(100);

        var paginaInvalida = http.getForEntity("/api/v1/pacientes/" + pacienteId + "/registros-clinicos?pagina=-1",
                JsonNode.class);
        assertProblem(paginaInvalida, HttpStatus.BAD_REQUEST, "ENTRADA_INVALIDA");
        assertThat(paginaInvalida.getBody().path("errosDeCampo").get(0).path("campo").asText()).isEqualTo("page");
    }

    @Test
    void contratoDeIdempotenciaEProblemDetailsNaoEcoaDadosSensiveis() {
        UUID pacienteId = UUID.fromString(criarPaciente(UUID.randomUUID(), "Bia Idempotente",
                "390.533.447-05").getBody().path("id").asText());

        UUID chaveParecer = UUID.randomUUID();
        var primeiro = criarParecer(pacienteId, chaveParecer, Map.of("texto",
                "Texto clinico ficticio que nao deve aparecer em erro."));
        var repetido = criarParecer(pacienteId, chaveParecer, Map.of("texto",
                "Texto clinico ficticio que nao deve aparecer em erro."));
        var conflitante = criarParecer(pacienteId, chaveParecer, Map.of("texto",
                "Outro texto clinico ficticio rejeitado."));

        assertThat(repetido.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(repetido.getBody().path("registro").path("id").asText())
                .isEqualTo(primeiro.getBody().path("registro").path("id").asText());
        assertProblem(conflitante, HttpStatus.CONFLICT, "CONFLITO");
        assertThat(conflitante.getBody().toString())
                .doesNotContain("Outro texto clinico ficticio rejeitado")
                .doesNotContain("39053344705");

        var semChave = http.exchange(URI.create("/api/v1/pacientes/" + pacienteId + "/geracoes-analise"),
                HttpMethod.POST, json(Map.of()), JsonNode.class);
        assertProblem(semChave, HttpStatus.BAD_REQUEST, "ENTRADA_INVALIDA");
        assertThat(semChave.getBody().path("errosDeCampo").get(0).path("campo").asText())
                .isEqualTo("Idempotency-Key");

        var ausente = http.getForEntity("/api/v1/pacientes/" + UUID.randomUUID(), JsonNode.class);
        assertProblem(ausente, HttpStatus.NOT_FOUND, "RECURSO_NAO_ENCONTRADO");
    }

    @Test
    void openApiRepresentaContratosPublicosSemExporEntidadesJpa() {
        var resposta = http.getForEntity("/api/v1/openapi", JsonNode.class);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode paths = resposta.getBody().path("paths");
        assertThat(paths.has("/api/v1/pacientes")).isTrue();
        assertThat(paths.has("/api/v1/pacientes/{id}")).isTrue();
        assertThat(paths.has("/api/v1/pacientes/{pacienteId}/consultas")).isTrue();
        assertThat(paths.has("/api/v1/consultas")).isTrue();
        assertThat(paths.has("/api/v1/consultas/{id}/status")).isTrue();
        assertThat(paths.has("/api/v1/consultas/disponibilidade")).isTrue();
        assertThat(paths.has("/api/v1/consultas/{id}/sincronizacao-google/tentar-novamente")).isTrue();
        assertThat(paths.has("/api/v1/pacientes/{pacienteId}/registros-clinicos")).isTrue();
        assertThat(paths.has("/api/v1/pacientes/{pacienteId}/registros-clinicos/{parecerOriginalId}/complementos")).isTrue();
        assertThat(paths.has("/api/v1/pacientes/{pacienteId}/registros-clinicos/{registroId}")).isTrue();
        assertThat(paths.has("/api/v1/pacientes/{pacienteId}/geracoes-analise")).isTrue();
        assertThat(paths.has("/api/v1/pacientes/{pacienteId}/estado-analise")).isTrue();
        assertThat(paths.has("/api/v1/pacientes/{pacienteId}/analises/{analiseId}")).isTrue();
        String openapi = resposta.getBody().toString();
        assertThat(openapi).contains("Idempotency-Key", "PacienteResponse", "ConsultaResponse",
                "RegistroClinicoResponse", "EstadoAnaliseResponse", "PaginaResponse");
        assertThat(openapi).doesNotContain("EntidadePacienteJpa")
                .doesNotContain("EntidadeConsultaJpa")
                .doesNotContain("EntidadeRegistroClinicoJpa")
                .doesNotContain("EntidadeGeracaoAnaliseJpa");
    }

    private ResponseEntity<JsonNode> criarPaciente(UUID chave, String nome, String cpf) {
        var body = Map.of("nome", nome, "cpf", cpf, "dataNascimento", "1990-01-01",
                "telefone", "(11) 98765-4321", "email", "paciente@example.test", "queixaInicial", "");
        return http.exchange(URI.create("/api/v1/pacientes"), HttpMethod.POST, entidade(chave, body), JsonNode.class);
    }

    private ResponseEntity<JsonNode> criarConsulta(UUID pacienteId, UUID chave, String agendadaPara) {
        var body = Map.of("agendadaPara", agendadaPara, "observacoes", "Observacao ficticia de agenda.");
        return http.exchange(URI.create("/api/v1/pacientes/" + pacienteId + "/consultas"),
                HttpMethod.POST, entidade(chave, body), JsonNode.class);
    }

    private ResponseEntity<JsonNode> criarParecer(UUID pacienteId, UUID chave, Map<String, String> body) {
        return http.exchange(URI.create("/api/v1/pacientes/" + pacienteId + "/registros-clinicos"),
                HttpMethod.POST, entidade(chave, body), JsonNode.class);
    }

    private HttpEntity<Map<String, String>> entidade(UUID chave, Map<String, String> body) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Idempotency-Key", chave.toString());
        return new HttpEntity<>(body, headers);
    }

    private HttpEntity<Map<String, String>> json(Map<String, String> body) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }

    private void assertProblem(ResponseEntity<JsonNode> resposta, HttpStatus status, String codigo) {
        assertThat(resposta.getStatusCode()).isEqualTo(status);
        assertThat(resposta.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PROBLEM_JSON);
        assertThat(resposta.getHeaders().getFirst("X-Request-Id")).isNotBlank();
        assertThat(resposta.getBody().path("status").asInt()).isEqualTo(status.value());
        assertThat(resposta.getBody().path("codigo").asText()).isEqualTo(codigo);
        assertThat(resposta.getBody().path("idRequisicao").asText())
                .isEqualTo(resposta.getHeaders().getFirst("X-Request-Id"));
    }
}
