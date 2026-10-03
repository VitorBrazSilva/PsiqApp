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
    private static final Instant REFERENCIA_TESTE = Instant.parse("2026-10-02T18:00:00Z");

    @org.springframework.boot.test.context.TestConfiguration(proxyBeanMethods = false)
    static class RelogioTeste {
        @org.springframework.context.annotation.Bean
        @org.springframework.context.annotation.Primary
        java.time.Clock relogioTeste() {
            return java.time.Clock.fixed(REFERENCIA_TESTE, java.time.ZoneOffset.UTC);
        }
    }

    @Container
    @org.springframework.boot.testcontainers.service.connection.ServiceConnection
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

        var consulta = criarConsulta(pacienteA, UUID.randomUUID(), "2099-09-10T10:00:00-03:00");
        assertThat(consulta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        UUID consultaId = UUID.fromString(consulta.getBody().path("id").asText());
        assertThat(consulta.getBody().path("status").asText()).isEqualTo("AGENDADA");
        assertThat(consulta.getBody().path("agendadaPara").asText()).isEqualTo("2099-09-10T13:00:00Z");
        jdbc.update("insert into consulta (id, paciente_id, agendada_para, status, observacoes, criada_em) values (?, ?, ?, 'AGENDADA', ?, ?)",
                UUID.randomUUID(), pacienteA, java.sql.Timestamp.from(Instant.parse("2099-09-11T02:30:00Z")),
                "HorÃ¡rio fictÃ­cio no limite inclusivo", java.sql.Timestamp.from(REFERENCIA_TESTE));
        jdbc.update("insert into consulta (id, paciente_id, agendada_para, status, observacoes, criada_em) values (?, ?, ?, 'AGENDADA', ?, ?)",
                UUID.randomUUID(), pacienteA, java.sql.Timestamp.from(Instant.parse("2099-09-11T03:00:00Z")),
                "Meia-noite fictÃ­cia fora do perÃ­odo", java.sql.Timestamp.from(REFERENCIA_TESTE));

        var agendaA = http.getForEntity("/api/v1/consultas?pacienteId=" + pacienteA + "&pagina=0&tamanho=25", JsonNode.class);
        var agendaB = http.getForEntity("/api/v1/consultas?pacienteId=" + pacienteB + "&pagina=0&tamanho=25", JsonNode.class);
        assertThat(agendaA.getBody().path("itens")).hasSize(3);
        assertThat(agendaB.getBody().path("itens")).isEmpty();

        var agendaNova = http.getForEntity("/api/v1/agenda/consultas?grupo=PROXIMAS&pacienteId=" + pacienteA
                + "&dataInicial=2099-09-10&dataFinal=2099-09-10&pagina=0&tamanho=1", JsonNode.class);
        assertThat(agendaNova.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(agendaNova.getHeaders().getCacheControl()).contains("no-store");
        assertThat(agendaNova.getBody().path("itens")).hasSize(1);
        assertThat(agendaNova.getBody().path("total").asLong()).isEqualTo(2);
        assertThat(agendaNova.getBody().path("contagens").path("PROXIMAS").asLong()).isEqualTo(2);
        assertThat(agendaNova.getBody().path("contagens").path("REALIZADAS").asLong()).isZero();
        var agendaLimite = http.getForEntity("/api/v1/agenda/consultas?grupo=PROXIMAS&pacienteId=" + pacienteA
                + "&dataInicial=2099-09-11&dataFinal=2099-09-11&pagina=0&tamanho=25", JsonNode.class);
        assertThat(agendaLimite.getBody().path("itens")).hasSize(1);
        assertThat(agendaLimite.getBody().path("itens").get(0).path("agendadaPara").asText())
                .isEqualTo("2099-09-11T03:00:00Z");
        assertThat(agendaLimite.getBody().path("total").asLong()).isEqualTo(1);
        var agendaPacienteB = http.getForEntity("/api/v1/agenda/consultas?pacienteId=" + pacienteB, JsonNode.class);
        assertThat(agendaPacienteB.getBody().path("itens")).isEmpty();
        assertThat(agendaPacienteB.getBody().path("contagens").path("PROXIMAS").asLong()).isZero();

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

        var realizadas = http.getForEntity("/api/v1/agenda/consultas?grupo=REALIZADAS&pacienteId=" + pacienteA
                + "&pagina=9&tamanho=1", JsonNode.class);
        assertThat(realizadas.getBody().path("itens")).isEmpty();
        assertThat(realizadas.getBody().path("total").asLong()).isEqualTo(1);
        assertThat(realizadas.getBody().path("contagens").path("REALIZADAS").asLong()).isEqualTo(1);

        var periodoParcial = http.getForEntity("/api/v1/agenda/consultas?dataInicial=2026-09-10", JsonNode.class);
        assertThat(periodoParcial.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(periodoParcial.getBody().path("codigo").asText()).isEqualTo("ENTRADA_INVALIDA");

        var ausente = criarConsulta(UUID.randomUUID(), UUID.randomUUID(), "2026-09-10T10:00:00-03:00");
        assertThat(ausente.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void paginaAgendaCalculaGruposSobre120ConsultasSemDependerDaPagina() {
        UUID paciente = UUID.fromString(criarPaciente(UUID.randomUUID(), "Agenda Volume", "529.982.247-25")
                .getBody().path("id").asText());
        Instant agora = REFERENCIA_TESTE;
        Instant futura = agora.plusSeconds(86400 * 60L);
        Instant passada = agora.minusSeconds(86400 * 60L);
        for (int i = 0; i < 120; i++) {
            String status;
            Instant inicio;
            if (i < 20) { status = "AGENDADA"; inicio = futura.plusSeconds(i * 3600L); }
            else if (i < 40) { status = "AGENDADA"; inicio = passada.minusSeconds(i * 3600L); }
            else { status = switch ((i - 40) / 20) { case 0 -> "REALIZADA"; case 1 -> "CANCELADA"; case 2 -> "FALTA"; default -> "REALIZADA"; }; inicio = futura.plusSeconds(i * 3600L); }
            jdbc.update("insert into consulta (id, paciente_id, agendada_para, status, observacoes, criada_em) values (?, ?, ?, ?, ?, ?)",
                    UUID.randomUUID(), paciente, java.sql.Timestamp.from(inicio), status, "Nota fictÃ­cia de teste", java.sql.Timestamp.from(agora));
        }

        var primeira = http.getForEntity("/api/v1/agenda/consultas?grupo=PROXIMAS&pacienteId=" + paciente
                + "&pagina=0&tamanho=7", JsonNode.class).getBody();
        var quarta = http.getForEntity("/api/v1/agenda/consultas?grupo=PROXIMAS&pacienteId=" + paciente
                + "&pagina=2&tamanho=7", JsonNode.class).getBody();
        var foraDoLimite = http.getForEntity("/api/v1/agenda/consultas?grupo=PROXIMAS&pacienteId=" + paciente
                + "&pagina=9&tamanho=7", JsonNode.class).getBody();
        assertThat(primeira.path("itens")).hasSize(7);
        assertThat(quarta.path("itens")).hasSize(6);
        assertThat(primeira.path("contagens").path("PROXIMAS").asLong()).isEqualTo(20);
        assertThat(primeira.path("contagens").path("AGENDADAS_ANTERIORES").asLong()).isEqualTo(20);
        assertThat(primeira.path("contagens").path("REALIZADAS").asLong()).isEqualTo(40);
        assertThat(primeira.path("contagens").path("CANCELADAS").asLong()).isEqualTo(20);
        assertThat(primeira.path("contagens").path("FALTAS").asLong()).isEqualTo(20);
        assertThat(foraDoLimite.path("itens")).isEmpty();
        assertThat(foraDoLimite.path("total").asLong()).isEqualTo(20);
        assertThat(foraDoLimite.path("contagens").path("PROXIMAS").asLong()).isEqualTo(20);
    }

    @Test
    void timestampIgualAReferenciaPertenceSomenteAoGrupoProximas() {
        UUID paciente = UUID.fromString(criarPaciente(UUID.randomUUID(), "Agenda Igualdade", "529.982.247-25")
                .getBody().path("id").asText());
        jdbc.update("insert into consulta (id, paciente_id, agendada_para, status, observacoes, criada_em) values (?, ?, ?, 'AGENDADA', ?, ?)",
                UUID.randomUUID(), paciente, java.sql.Timestamp.from(REFERENCIA_TESTE.minusSeconds(1)), "Consulta fictÃ­cia anterior", java.sql.Timestamp.from(REFERENCIA_TESTE));
        jdbc.update("insert into consulta (id, paciente_id, agendada_para, status, observacoes, criada_em) values (?, ?, ?, 'AGENDADA', ?, ?)",
                UUID.randomUUID(), paciente, java.sql.Timestamp.from(REFERENCIA_TESTE), "Consulta fictÃ­cia na referÃªncia", java.sql.Timestamp.from(REFERENCIA_TESTE));
        jdbc.update("insert into consulta (id, paciente_id, agendada_para, status, observacoes, criada_em) values (?, ?, ?, 'AGENDADA', ?, ?)",
                UUID.randomUUID(), paciente, java.sql.Timestamp.from(REFERENCIA_TESTE.plusSeconds(1)), "Consulta fictÃ­cia futura", java.sql.Timestamp.from(REFERENCIA_TESTE));

        var proximas = http.getForEntity("/api/v1/agenda/consultas?grupo=PROXIMAS&pacienteId=" + paciente, JsonNode.class).getBody();
        var anteriores = http.getForEntity("/api/v1/agenda/consultas?grupo=AGENDADAS_ANTERIORES&pacienteId=" + paciente, JsonNode.class).getBody();
        assertThat(proximas.path("itens")).hasSize(2);
        assertThat(proximas.path("contagens").path("PROXIMAS").asLong()).isEqualTo(2);
        assertThat(anteriores.path("itens")).hasSize(1);
        assertThat(anteriores.path("contagens").path("AGENDADAS_ANTERIORES").asLong()).isEqualTo(1);
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
