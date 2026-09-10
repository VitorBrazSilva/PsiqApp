package com.psiqapp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityManagerFactory;
import java.time.Clock;
import java.time.ZoneOffset;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
@Testcontainers
class BackendBootstrapIT {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired TestRestTemplate http;
    @Autowired Flyway flyway;
    @Autowired EntityManagerFactory jpa;
    @Autowired JdbcTemplate jdbc;
    @Autowired Clock relogio;
    @Autowired Environment ambiente;

    @Test
    void contextoCarregaJpaFlywayPostgresEClockSemIAOuTabelasDeNegocio() {
        assertThat(jpa.isOpen()).isTrue();
        assertThat(flyway.validateWithResult().validationSuccessful).isTrue();
        assertThat(flyway.info().all()).isEmpty();
        assertThat(jdbc.queryForObject("select current_setting('server_version')", String.class)).startsWith("18.6");
        assertThat(jdbc.queryForList("select tablename from pg_tables where schemaname='public'", String.class))
                .isSubsetOf("flyway_schema_history");
        assertThat(relogio.getZone()).isEqualTo(ZoneOffset.UTC);
        assertThat(ambiente.getProperty("server.address")).isEqualTo("127.0.0.1");
        assertThat(ambiente.getProperty("spring.jpa.open-in-view")).isEqualTo("false");
        assertThat(ambiente.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("validate");
    }

    @Test
    void healthEReadinessExpostosLocalmenteSemDetalhesOuDependenciaDeIA() {
        for (String caminho : new String[]{"/api/v1/health", "/api/v1/health/readiness"}) {
            var resposta = http.getForEntity(caminho, JsonNode.class);
            assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(resposta.getBody().toString()).isEqualTo("{\"status\":\"UP\"}");
            assertThat(resposta.getHeaders().getFirst("X-Request-Id")).isNotBlank();
        }
    }

    @Test
    void naoExpoeEndpointsAdministrativosNemRotasDeProduto() {
        for (String caminho : new String[]{"/api/v1/env", "/api/v1/beans", "/api/v1/metrics",
                "/actuator", "/api/v1/patients", "/api/v1/appointments", "/teste/falha"}) {
            var resposta = http.getForEntity(caminho, JsonNode.class);
            assertThat(resposta.getStatusCode()).as(caminho).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(resposta.getBody().path("code").asText()).isEqualTo("RECURSO_NAO_ENCONTRADO");
        }
    }

    @Test
    void openApiDisponivelSemContratosDeProdutoAntecipados() {
        var resposta = http.getForEntity("/api/v1/openapi", JsonNode.class);
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resposta.getBody().path("openapi").asText()).startsWith("3.");
        assertThat(resposta.getBody().path("paths").isEmpty()).isTrue();
    }
}
