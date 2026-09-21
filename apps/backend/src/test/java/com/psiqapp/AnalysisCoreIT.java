package com.psiqapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataAccessException;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
@Testcontainers
class AnalysisCoreIT {
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
    void estadoHistoricoRegeneracaoManualEIdempotencia() {
        UUID pacienteId = criarPaciente("Ana Analise", "529.982.247-25");
        UUID primeiraGeracao = criarParecer(pacienteId, "Registro clinico ficticio inicial.");

        var bloqueada = regenerar(pacienteId, UUID.randomUUID());
        assertThat(bloqueada.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        jdbc.update("update geracao_analise set estado = 'FALHA', concluida_em = now(), codigo_falha = 'MANUAL_TEST' where id = ?",
                primeiraGeracao);
        UUID chave = UUID.randomUUID();
        var regeneracao = regenerar(pacienteId, chave);
        assertThat(regeneracao.getStatusCode()).isEqualTo(HttpStatus.ACCEPTED);
        UUID geracaoManual = UUID.fromString(regeneracao.getBody().path("id").asText());
        assertThat(regeneracao.getBody().path("estado").asText()).isEqualTo("ENFILEIRADA");
        assertThat(regeneracao.getBody().path("modo").asText()).isEqualTo("RESUMO");

        var repetida = regenerar(pacienteId, chave);
        assertThat(repetida.getStatusCode()).isEqualTo(HttpStatus.ACCEPTED);
        assertThat(repetida.getBody().path("id").asText()).isEqualTo(geracaoManual.toString());

        var estado = http.getForEntity("/api/v1/patients/" + pacienteId + "/analysis-state", JsonNode.class);
        assertThat(estado.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(estado.getBody().path("activeGeneration").path("id").asText()).isEqualTo(geracaoManual.toString());
        assertThat(estado.getBody().path("canRegenerate").asBoolean()).isFalse();
        assertThat(estado.getBody().path("reason").asText()).isEqualTo("GENERATION_ACTIVE");

        var historico = http.getForEntity("/api/v1/patients/" + pacienteId + "/analysis-generations?page=0&size=10",
                JsonNode.class);
        assertThat(historico.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(historico.getBody().path("items")).hasSize(2);
    }

    @Test
    void concorrenciaDeRegeneracaoManualCriaApenasUmaGeracaoAtiva() throws Exception {
        UUID pacienteId = criarPaciente("Caio Concorrencia", "111.444.777-35");
        UUID primeiraGeracao = criarParecer(pacienteId, "Registro clinico ficticio para concorrencia.");
        jdbc.update("update geracao_analise set estado = 'FALHA', concluida_em = now() where id = ?",
                primeiraGeracao);

        try (var executor = Executors.newFixedThreadPool(2)) {
            var respostas = executor.invokeAll(List.of(
                    () -> regenerar(pacienteId, UUID.randomUUID()).getStatusCode(),
                    () -> regenerar(pacienteId, UUID.randomUUID()).getStatusCode()));
            assertThat(respostas.stream().map(f -> {
                try {
                    return f.get();
                } catch (Exception e) {
                    throw new IllegalStateException(e);
                }
            }).toList()).containsExactlyInAnyOrder(HttpStatus.ACCEPTED, HttpStatus.CONFLICT);
        }
        assertThat(jdbc.queryForObject("""
                select count(*) from geracao_analise
                 where paciente_id = ? and gatilho = 'MANUAL'
                """, Long.class, pacienteId)).isEqualTo(1);
    }

    @Test
    void analiseAtualUsaMaiorSnapshotETriggersAppendOnly() {
        UUID pacienteId = criarPaciente("Bia Atual", "390.533.447-05");
        UUID geracao1 = criarParecer(pacienteId, "Primeiro registro clinico ficticio.");
        jdbc.update("update geracao_analise set estado = 'FALHA', concluida_em = now() where id = ?", geracao1);
        UUID geracao2 = criarParecer(pacienteId, "Segundo registro clinico ficticio.");
        jdbc.update("update geracao_analise set estado = 'FALHA', concluida_em = now() where id = ?", geracao2);

        UUID analise1 = inserirAnalise(geracao1, pacienteId, "RESUMO");
        UUID analise2 = inserirAnalise(geracao2, pacienteId, "LONGITUDINAL");

        var estado = http.getForEntity("/api/v1/patients/" + pacienteId + "/analysis-state", JsonNode.class);
        assertThat(estado.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(estado.getBody().path("currentAnalysis").path("id").asText()).isEqualTo(analise2.toString());

        var historica = http.getForEntity("/api/v1/patients/" + pacienteId + "/analyses/" + analise1, JsonNode.class);
        assertThat(historica.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(historica.getBody().path("id").asText()).isEqualTo(analise1.toString());

        assertThatThrownBy(() -> jdbc.update("update analise_clinica set modo = 'RESUMO' where id = ?",
                analise2)).isInstanceOf(DataAccessException.class);
    }

    private UUID inserirAnalise(UUID geracaoId, UUID pacienteId, String modo) {
        UUID analiseId = UUID.randomUUID();
        jdbc.update("""
                insert into analise_clinica
                (id, geracao_id, paciente_id, gerada_em, modo, conteudo_validado, versao_regras_seguranca, criada_em)
                values (?, ?, ?, now(), ?, ?::jsonb, 'test', now())
                """, analiseId, geracaoId, pacienteId, modo,
                "{\"linhaDoTempo\":[],\"padroes\":[],\"pontosDeAtencao\":[],\"limitacoes\":[\"Limite ficticio.\"]}");
        jdbc.update("update geracao_analise set estado = 'CONCLUIDA', concluida_em = now() where id = ?", geracaoId);
        return analiseId;
    }

    private UUID criarPaciente(String nome, String cpf) {
        var body = Map.of("nome", nome, "cpf", cpf, "dataNascimento", "1990-01-01",
                "telefone", "(11) 98765-4321", "email", "paciente@example.test", "queixaInicial", "");
        var resposta = http.exchange(URI.create("/api/v1/patients"), HttpMethod.POST,
                entidade(UUID.randomUUID(), body), JsonNode.class);
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return UUID.fromString(resposta.getBody().path("id").asText());
    }

    private UUID criarParecer(UUID pacienteId, String texto) {
        var resposta = http.exchange(URI.create("/api/v1/patients/" + pacienteId + "/clinical-records"),
                HttpMethod.POST, entidade(UUID.randomUUID(), Map.of("texto", texto)), JsonNode.class);
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return UUID.fromString(resposta.getBody().path("geracao").path("id").asText());
    }

    private ResponseEntity<JsonNode> regenerar(UUID pacienteId, UUID chave) {
        return http.exchange(URI.create("/api/v1/patients/" + pacienteId + "/analysis-generations"),
                HttpMethod.POST, entidade(chave, Map.of()), JsonNode.class);
    }

    private HttpEntity<Map<String, String>> entidade(UUID chave, Map<String, String> body) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Idempotency-Key", chave.toString());
        return new HttpEntity<>(body, headers);
    }
}
