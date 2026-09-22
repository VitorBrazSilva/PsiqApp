package com.psiqapp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
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
import org.springframework.web.util.UriComponentsBuilder;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
@Testcontainers
class PatientAppointmentIT {
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
    void criaBuscaObtemPacienteComIdempotenciaEProblemDetails() {
        UUID chave = UUID.randomUUID();
        var paciente = criarPaciente(chave, "Ana Ávila", "529.982.247-25");
        assertThat(paciente.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String id = paciente.getBody().path("id").asText();
        assertThat(paciente.getBody().path("cpf").asText()).isEqualTo("***.***.***-25");
        assertThat(paciente.getBody().path("telefone").asText()).isEqualTo("+5511987654321");
        assertThat(paciente.getBody().path("queixaInicial").isNull()).isTrue();

        var repetido = criarPaciente(chave, "Ana Ávila", "529.982.247-25");
        assertThat(repetido.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(repetido.getBody().path("id").asText()).isEqualTo(id);
        assertThat(jdbc.queryForObject("select count(*) from paciente", Long.class)).isEqualTo(1);

        var conflito = criarPaciente(chave, "Outra Pessoa", "390.533.447-05");
        assertThat(conflito.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(conflito.getBody().path("codigo").asText()).isEqualTo("CONFLITO");

        var busca = http.getForEntity("/api/v1/pacientes?nome=avila&pagina=0&tamanho=10", JsonNode.class);
        assertThat(busca.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(busca.getBody().path("itens").get(0).path("id").asText()).isEqualTo(id);

        criarPaciente(UUID.randomUUID(), "Ana Percentual % Literal", "390.533.447-05");
        var uriCuringaLiteral = UriComponentsBuilder.fromPath("/api/v1/pacientes")
                .queryParam("nome", "%")
                .queryParam("pagina", 0)
                .queryParam("tamanho", 10)
                .build().encode().toUri();
        var curingaLiteral = http.getForEntity(uriCuringaLiteral, JsonNode.class);
        assertThat(curingaLiteral.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(curingaLiteral.getBody().path("itens")).hasSize(1);

        criarPaciente(UUID.randomUUID(), "Ana Segunda", "111.444.777-35");
        var pagina0 = http.getForEntity("/api/v1/pacientes?nome=ana&pagina=0&tamanho=1", JsonNode.class);
        var pagina1 = http.getForEntity("/api/v1/pacientes?nome=ana&pagina=1&tamanho=1", JsonNode.class);
        assertThat(pagina0.getBody().path("itens")).hasSize(1);
        assertThat(pagina1.getBody().path("itens")).hasSize(1);
        assertThat(pagina0.getBody().path("total").asLong()).isGreaterThanOrEqualTo(3);

        var obtido = http.getForEntity("/api/v1/pacientes/" + id, JsonNode.class);
        assertThat(obtido.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(obtido.getBody().path("nome").asText()).isEqualTo("Ana Ávila");

        var invalido = criarPaciente(UUID.randomUUID(), "", "111.111.111-11");
        assertThat(invalido.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(invalido.getBody().path("codigo").asText()).isEqualTo("ENTRADA_INVALIDA");
        assertThat(invalido.getBody().toString()).doesNotContain("111.111.111-11");
    }

    @Test
    void criaListaEAtualizaConsultaIsolandoPaciente() {
        UUID pacienteA = UUID.fromString(criarPaciente(UUID.randomUUID(), "Bruna Costa", "529.982.247-25")
                .getBody().path("id").asText());
        UUID pacienteB = UUID.fromString(criarPaciente(UUID.randomUUID(), "Carlos Lima", "390.533.447-05")
                .getBody().path("id").asText());

        var consulta = criarConsulta(pacienteA, UUID.randomUUID(), "2026-09-10T10:00:00-03:00");
        assertThat(consulta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID consultaId = UUID.fromString(consulta.getBody().path("id").asText());
        assertThat(consulta.getBody().path("status").asText()).isEqualTo("AGENDADA");
        assertThat(consulta.getBody().path("agendadaPara").asText()).isEqualTo("2026-09-10T13:00:00Z");

        var agendaA = http.getForEntity("/api/v1/consultas?pacienteId=" + pacienteA + "&pagina=0&tamanho=25", JsonNode.class);
        var agendaB = http.getForEntity("/api/v1/consultas?pacienteId=" + pacienteB + "&pagina=0&tamanho=25", JsonNode.class);
        assertThat(agendaA.getBody().path("itens")).hasSize(1);
        assertThat(agendaB.getBody().path("itens")).isEmpty();

        UUID chaveConsulta = UUID.randomUUID();
        var consultaIdempotente = criarConsulta(pacienteA, chaveConsulta, "2026-09-11T10:00:00-03:00");
        var consultaRepetida = criarConsulta(pacienteA, chaveConsulta, "2026-09-11T10:00:00-03:00");
        assertThat(consultaRepetida.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(consultaRepetida.getBody().path("id").asText()).isEqualTo(consultaIdempotente.getBody().path("id").asText());

        var realizada = atualizarStatus(consultaId, "REALIZADA");
        assertThat(realizada.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(realizada.getBody().path("status").asText()).isEqualTo("REALIZADA");

        var trocaFinal = atualizarStatus(consultaId, "CANCELADA");
        assertThat(trocaFinal.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        var retornoAgendada = atualizarStatus(consultaId, "AGENDADA");
        assertThat(retornoAgendada.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        UUID canceladaId = UUID.fromString(criarConsulta(pacienteA, UUID.randomUUID(), "2026-09-12T10:00:00-03:00")
                .getBody().path("id").asText());
        UUID faltaId = UUID.fromString(criarConsulta(pacienteA, UUID.randomUUID(), "2026-09-13T10:00:00-03:00")
                .getBody().path("id").asText());
        assertThat(atualizarStatus(canceladaId, "CANCELADA").getBody().path("status").asText()).isEqualTo("CANCELADA");
        assertThat(atualizarStatus(faltaId, "FALTA").getBody().path("status").asText()).isEqualTo("FALTA");

        var ausente = criarConsulta(UUID.randomUUID(), UUID.randomUUID(), "2026-09-10T10:00:00-03:00");
        assertThat(ausente.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void concorrenciaMantemCpfUnico() throws Exception {
        try (var executor = Executors.newFixedThreadPool(2)) {
            var primeiro = executor.submit(() -> criarPaciente(UUID.randomUUID(), "Daniel Alfa", "529.982.247-25").getStatusCode());
            var segundo = executor.submit(() -> criarPaciente(UUID.randomUUID(), "Daniel Beta", "529.982.247-25").getStatusCode());
            assertThat(firstOrSecond(firstOrSecond(primeiro.get(), segundo.get()), HttpStatus.CREATED))
                    .isEqualTo(HttpStatus.CREATED);
            assertThat(jdbc.queryForObject("select count(*) from paciente where cpf='52998224725'", Long.class)).isEqualTo(1);
        }
    }

    @Test
    void concorrenciaComMesmaChaveDeIdempotenciaRetornaMesmoPacienteSemDuplicar() throws Exception {
        UUID chave = UUID.randomUUID();
        Callable<ResponseEntity<JsonNode>> chamada = () -> criarPaciente(chave, "Eva Idempotente", "529.982.247-25");
        try (var executor = Executors.newFixedThreadPool(2)) {
            var primeiro = executor.submit(chamada);
            var segundo = executor.submit(chamada);
            var resposta1 = primeiro.get();
            var resposta2 = segundo.get();
            assertThat(resposta1.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(resposta2.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(resposta1.getBody().path("id").asText()).isEqualTo(resposta2.getBody().path("id").asText());
            assertThat(jdbc.queryForObject("select count(*) from paciente where cpf='52998224725'", Long.class)).isEqualTo(1);
        }
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

    private ResponseEntity<JsonNode> atualizarStatus(UUID consultaId, String status) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return http.exchange(URI.create("/api/v1/consultas/" + consultaId + "/status"),
                HttpMethod.POST, new HttpEntity<>(Map.of("status", status), headers), JsonNode.class);
    }

    private HttpEntity<Map<String, String>> entidade(UUID chave, Map<String, String> body) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Idempotency-Key", chave.toString());
        return new HttpEntity<>(body, headers);
    }

    private HttpStatusCode firstOrSecond(HttpStatusCode first, HttpStatusCode second) {
        return first == HttpStatus.CREATED || second == HttpStatus.CREATED ? HttpStatus.CREATED : first;
    }
}
