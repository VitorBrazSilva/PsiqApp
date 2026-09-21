package com.psiqapp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.psiqapp.application.usecase.ProcessarGeracaoAnaliseUseCase;
import java.net.URI;
import java.time.Instant;
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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "psiqapp.analysis.worker.enabled=false")
@ActiveProfiles("local")
@Testcontainers
class AnalysisWorkerIT {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired TestRestTemplate http;
    @Autowired Flyway flyway;
    @Autowired JdbcTemplate jdbc;
    @Autowired ProcessarGeracaoAnaliseUseCase processador;

    @BeforeEach
    void limparBanco() {
        flyway.migrate();
        jdbc.execute("""
                truncate table analysis_evidence, clinical_analysis, analysis_attempt, analysis_generation,
                clinical_record, idempotency_record, appointment, patient restart identity cascade
                """);
    }

    @Test
    void processaGeracaoComFakeProviderEFazFinalizacaoAtomica() {
        UUID pacienteId = criarPaciente("Alice Worker", "529.982.247-25");
        UUID geracaoId = criarParecer(pacienteId, "Registro clinico ficticio para worker.");

        assertThat(processador.executarUma()).isEqualTo(ProcessarGeracaoAnaliseUseCase.Resultado.PROCESSADA);

        assertThat(jdbc.queryForObject("select state from analysis_generation where id = ?", String.class, geracaoId))
                .isEqualTo("COMPLETED");
        assertThat(jdbc.queryForObject("select count(*) from clinical_analysis where generation_id = ?",
                Long.class, geracaoId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from analysis_evidence where patient_id = ?",
                Long.class, pacienteId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select outcome from analysis_attempt where generation_id = ?",
                String.class, geracaoId)).isEqualTo("SUCCESS");
    }

    @Test
    void skipLockedImpedeQueDuasReivindicacoesPeguemAMesmaGeracao() {
        UUID pacienteId = criarPaciente("Beto Worker", "390.533.447-05");
        UUID geracaoId = criarParecer(pacienteId, "Registro clinico ficticio para lease.");
        jdbc.update("""
                update analysis_generation
                   set state = 'RUNNING', lease_token = ?, lease_expires_at = ?
                 where id = ?
                """, UUID.randomUUID(), java.sql.Timestamp.from(Instant.now().plusSeconds(60)), geracaoId);

        assertThat(processador.executarUma()).isEqualTo(ProcessarGeracaoAnaliseUseCase.Resultado.NENHUMA_GERACAO);
        assertThat(jdbc.queryForObject("select count(*) from clinical_analysis", Long.class)).isZero();
    }

    @Test
    void leaseExpiradoPodeSerRecuperadoENaoFicaPreso() {
        UUID pacienteId = criarPaciente("Clara Worker", "111.444.777-35");
        UUID geracaoId = criarParecer(pacienteId, "Registro clinico ficticio com lease expirado.");
        jdbc.update("""
                update analysis_generation
                   set state = 'RUNNING', lease_token = ?, lease_expires_at = ?, attempt_count = 1
                 where id = ?
                """, UUID.randomUUID(), java.sql.Timestamp.from(Instant.now().minusSeconds(60)), geracaoId);

        assertThat(processador.executarUma()).isEqualTo(ProcessarGeracaoAnaliseUseCase.Resultado.PROCESSADA);
        assertThat(jdbc.queryForObject("select attempt_count from analysis_generation where id = ?",
                Integer.class, geracaoId)).isEqualTo(2);
        assertThat(jdbc.queryForObject("select state from analysis_generation where id = ?", String.class, geracaoId))
                .isEqualTo("COMPLETED");
    }

    @Test
    void tokenInvalidoNaoFinalizaGeracao() {
        UUID pacienteId = criarPaciente("Dora Worker", "529.982.247-25");
        UUID geracaoId = criarParecer(pacienteId, "Registro clinico ficticio para token invalido.");
        jdbc.update("""
                update analysis_generation
                   set state = 'RUNNING', lease_token = ?, lease_expires_at = ?, attempt_count = 1
                 where id = ?
                """, UUID.randomUUID(), java.sql.Timestamp.from(Instant.now().plusSeconds(60)), geracaoId);

        int atualizadas = jdbc.update("""
                update analysis_generation
                   set state = 'COMPLETED'
                 where id = ?
                   and state = 'RUNNING'
                   and lease_token = ?
                   and lease_expires_at > now()
                """, geracaoId, UUID.randomUUID());

        assertThat(atualizadas).isZero();
        assertThat(jdbc.queryForObject("select state from analysis_generation where id = ?", String.class, geracaoId))
                .isEqualTo("RUNNING");
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

    private HttpEntity<Map<String, String>> entidade(UUID chave, Map<String, String> body) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Idempotency-Key", chave.toString());
        return new HttpEntity<>(body, headers);
    }
}
