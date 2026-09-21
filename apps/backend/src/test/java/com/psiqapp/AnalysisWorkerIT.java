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
                truncate table evidencia_analise, analise_clinica, tentativa_geracao_analise, geracao_analise,
                registro_clinico, idempotencia, consulta, paciente restart identity cascade
                """);
    }

    @Test
    void processaGeracaoComFakeProviderEFazFinalizacaoAtomica() {
        UUID pacienteId = criarPaciente("Alice Worker", "529.982.247-25");
        UUID geracaoId = criarParecer(pacienteId, "Registro clinico ficticio para worker.");

        assertThat(processador.executarUma()).isEqualTo(ProcessarGeracaoAnaliseUseCase.Resultado.PROCESSADA);

        assertThat(jdbc.queryForObject("select estado from geracao_analise where id = ?", String.class, geracaoId))
                .isEqualTo("CONCLUIDA");
        assertThat(jdbc.queryForObject("select count(*) from analise_clinica where geracao_id = ?",
                Long.class, geracaoId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from evidencia_analise where paciente_id = ?",
                Long.class, pacienteId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select resultado from tentativa_geracao_analise where geracao_id = ?",
                String.class, geracaoId)).isEqualTo("SUCCESS");
    }

    @Test
    void skipLockedImpedeQueDuasReivindicacoesPeguemAMesmaGeracao() {
        UUID pacienteId = criarPaciente("Beto Worker", "390.533.447-05");
        UUID geracaoId = criarParecer(pacienteId, "Registro clinico ficticio para lease.");
        jdbc.update("""
                update geracao_analise
                   set estado = 'EM_EXECUCAO', token_reserva = ?, reserva_expira_em = ?
                 where id = ?
                """, UUID.randomUUID(), java.sql.Timestamp.from(Instant.now().plusSeconds(60)), geracaoId);

        assertThat(processador.executarUma()).isEqualTo(ProcessarGeracaoAnaliseUseCase.Resultado.NENHUMA_GERACAO);
        assertThat(jdbc.queryForObject("select count(*) from analise_clinica", Long.class)).isZero();
    }

    @Test
    void leaseExpiradoPodeSerRecuperadoENaoFicaPreso() {
        UUID pacienteId = criarPaciente("Clara Worker", "111.444.777-35");
        UUID geracaoId = criarParecer(pacienteId, "Registro clinico ficticio com lease expirado.");
        jdbc.update("""
                update geracao_analise
                   set estado = 'EM_EXECUCAO', token_reserva = ?, reserva_expira_em = ?, contagem_tentativas = 1
                 where id = ?
                """, UUID.randomUUID(), java.sql.Timestamp.from(Instant.now().minusSeconds(60)), geracaoId);

        assertThat(processador.executarUma()).isEqualTo(ProcessarGeracaoAnaliseUseCase.Resultado.PROCESSADA);
        assertThat(jdbc.queryForObject("select contagem_tentativas from geracao_analise where id = ?",
                Integer.class, geracaoId)).isEqualTo(2);
        assertThat(jdbc.queryForObject("select estado from geracao_analise where id = ?", String.class, geracaoId))
                .isEqualTo("CONCLUIDA");
    }

    @Test
    void tokenInvalidoNaoFinalizaGeracao() {
        UUID pacienteId = criarPaciente("Dora Worker", "529.982.247-25");
        UUID geracaoId = criarParecer(pacienteId, "Registro clinico ficticio para token invalido.");
        jdbc.update("""
                update geracao_analise
                   set estado = 'EM_EXECUCAO', token_reserva = ?, reserva_expira_em = ?, contagem_tentativas = 1
                 where id = ?
                """, UUID.randomUUID(), java.sql.Timestamp.from(Instant.now().plusSeconds(60)), geracaoId);

        int atualizadas = jdbc.update("""
                update geracao_analise
                   set estado = 'CONCLUIDA'
                 where id = ?
                   and estado = 'EM_EXECUCAO'
                   and token_reserva = ?
                   and reserva_expira_em > now()
                """, geracaoId, UUID.randomUUID());

        assertThat(atualizadas).isZero();
        assertThat(jdbc.queryForObject("select estado from geracao_analise where id = ?", String.class, geracaoId))
                .isEqualTo("EM_EXECUCAO");
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
