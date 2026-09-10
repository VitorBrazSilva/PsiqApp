package com.psiqapp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;

/** Testa o contrato HTTP e estados do health; PostgreSQL real e verificado separadamente em BackendBootstrapIT. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration"
})
@Import(HealthLocalTest.BancoSimulado.class)
class HealthLocalTest {
    @Autowired TestRestTemplate http;
    @Autowired AtomicBoolean bancoDisponivel;

    @Test
    void readinessRefleteBancoSemExporDetalhesNemDependerDeIA() {
        try {
            bancoDisponivel.set(true);
            var saudavel = http.getForEntity("/api/v1/health/readiness", JsonNode.class);
            assertThat(saudavel.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(saudavel.getBody().toString()).isEqualTo("{\"status\":\"UP\"}");
            bancoDisponivel.set(false);
            var indisponivel = http.getForEntity("/api/v1/health/readiness", JsonNode.class);
            assertThat(indisponivel.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
            assertThat(indisponivel.getBody().toString()).isEqualTo("{\"status\":\"DOWN\"}");
        } finally {
            bancoDisponivel.set(true);
        }
    }

    @Test
    void exposicaoRestritaAHealthEOpenApiSemRotasFuncionais() {
        assertThat(http.getForEntity("/api/v1/health", JsonNode.class).getStatusCode()).isEqualTo(HttpStatus.OK);
        for (String rota : new String[]{"/api/v1/env", "/api/v1/beans", "/api/v1/metrics", "/actuator",
                "/api/v1/patients", "/teste/falha"}) {
            var resposta = http.getForEntity(rota, JsonNode.class);
            assertThat(resposta.getStatusCode()).as(rota).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(resposta.getBody().path("code").asText()).isEqualTo("RECURSO_NAO_ENCONTRADO");
        }
        var openapi = http.getForEntity("/api/v1/openapi", JsonNode.class);
        assertThat(openapi.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(openapi.getBody().path("paths").isEmpty()).isTrue();
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class BancoSimulado {
        @Bean
        AtomicBoolean bancoDisponivel() { return new AtomicBoolean(true); }

        @Bean
        HealthIndicator dbHealthIndicator(AtomicBoolean bancoDisponivel) {
            return () -> (bancoDisponivel.get() ? Health.up() : Health.down())
                    .withDetail("detalhe", "DETALHE_FICTICIO_NAO_PUBLICO").build();
        }
    }
}
