package com.psiqapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
class ClinicalRecordsIT {
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
    void criaParecerComGeracaoPendenteIdempotenteEConsultaOpcional() {
        UUID pacienteId = criarPaciente("Ana Registro", "529.982.247-25");
        UUID consultaId = criarConsulta(pacienteId, "2026-09-14T10:00:00-03:00");
        UUID chave = UUID.randomUUID();

        var parecer = criarParecer(pacienteId, chave, Map.of(
                "texto", "Registro clinico ficticio inicial.",
                "humor", "Humor ficticio estavel.",
                "medicamentos", "Medicacao ficticia em uso.",
                "dataHoraClinica", "2026-09-14T09:30:00-03:00",
                "consultaId", consultaId.toString()));

        assertThat(parecer.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        JsonNode body = parecer.getBody();
        UUID registroId = UUID.fromString(body.path("registro").path("id").asText());
        UUID geracaoId = UUID.fromString(body.path("geracao").path("id").asText());
        assertThat(body.path("geracaoId").asText()).isEqualTo(geracaoId.toString());
        assertThat(body.path("registro").path("tipo").asText()).isEqualTo("PARECER");
        assertThat(body.path("registro").path("consultaId").asText()).isEqualTo(consultaId.toString());
        assertThat(body.path("registro").path("dataHoraClinica").asText()).isEqualTo("2026-09-14T12:30:00Z");
        assertThat(body.path("registro").path("criadoEm").asText()).isNotBlank();
        assertThat(body.path("geracao").path("estado").asText()).isEqualTo("ENFILEIRADA");
        assertThat(body.path("geracao").path("revisaoSnapshot").asLong()).isEqualTo(1);
        assertThat(body.path("geracao").path("sequenciaRequest").asLong()).isEqualTo(1);
        assertThat(body.path("geracao").path("totalRegistros").asInt()).isEqualTo(1);
        assertThat(body.path("geracao").path("totalOriginais").asInt()).isEqualTo(1);
        assertThat(body.path("geracao").path("modo").asText()).isEqualTo("RESUMO");

        var repetido = criarParecer(pacienteId, chave, Map.of(
                "texto", "Registro clinico ficticio inicial.",
                "humor", "Humor ficticio estavel.",
                "medicamentos", "Medicacao ficticia em uso.",
                "dataHoraClinica", "2026-09-14T09:30:00-03:00",
                "consultaId", consultaId.toString()));
        assertThat(repetido.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(repetido.getBody().path("registro").path("id").asText()).isEqualTo(registroId.toString());
        assertThat(repetido.getBody().path("geracao").path("id").asText()).isEqualTo(geracaoId.toString());
        assertThat(jdbc.queryForObject("select count(*) from registro_clinico", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from geracao_analise", Long.class)).isEqualTo(1);
    }

    @Test
    void criaComplementoPreservaOriginalEOrdenaLinhaDoTempoPorDataClinicaECriacao() {
        UUID pacienteId = criarPaciente("Beto Linha", "390.533.447-05");
        UUID originalId = UUID.fromString(criarParecer(pacienteId, UUID.randomUUID(), Map.of(
                "texto", "Primeiro registro ficticio.",
                "dataHoraClinica", "2026-09-10T08:00:00-03:00")).getBody().path("registro").path("id").asText());
        UUID segundoId = UUID.fromString(criarParecer(pacienteId, UUID.randomUUID(), Map.of(
                "texto", "Segundo registro ficticio no mesmo horario.",
                "dataHoraClinica", "2026-09-10T08:00:00-03:00")).getBody().path("registro").path("id").asText());

        var complemento = criarComplemento(pacienteId, originalId, UUID.randomUUID(), Map.of(
                "texto", "Complemento ficticio retroativo.",
                "humor", "Humor complementar ficticio.",
                "dataHoraClinica", "2026-09-09T08:00:00-03:00"));
        assertThat(complemento.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(complemento.getBody().path("registro").path("tipo").asText()).isEqualTo("COMPLEMENTO");
        assertThat(complemento.getBody().path("registro").path("parecerOriginalId").asText()).isEqualTo(originalId.toString());
        assertThat(complemento.getBody().path("geracao").path("totalRegistros").asInt()).isEqualTo(3);
        assertThat(complemento.getBody().path("geracao").path("totalComplementos").asInt()).isEqualTo(1);

        var timeline = http.getForEntity("/api/v1/pacientes/" + pacienteId + "/registros-clinicos?pagina=0&tamanho=10", JsonNode.class);
        assertThat(timeline.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(timeline.getBody().path("itens")).hasSize(3);
        assertThat(timeline.getBody().path("itens").get(0).path("id").asText()).isEqualTo(segundoId.toString());
        assertThat(timeline.getBody().path("itens").get(1).path("id").asText()).isEqualTo(originalId.toString());

        var fonte = http.getForEntity("/api/v1/pacientes/" + pacienteId + "/registros-clinicos/" + originalId, JsonNode.class);
        assertThat(fonte.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(fonte.getBody().path("texto").asText()).isEqualTo("Primeiro registro ficticio.");
    }

    @Test
    void rejeitaTextoVazioAssociacaoDeOutroPacienteEComplementoInvalido() {
        UUID pacienteA = criarPaciente("Clara Alfa", "529.982.247-25");
        UUID pacienteB = criarPaciente("Clara Beta", "390.533.447-05");
        UUID consultaB = criarConsulta(pacienteB, "2026-09-14T10:00:00-03:00");

        var vazio = criarParecer(pacienteA, UUID.randomUUID(), Map.of("texto", ""));
        assertThat(vazio.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(vazio.getBody().path("codigo").asText()).isEqualTo("ENTRADA_INVALIDA");
        assertThat(vazio.getBody().toString()).doesNotContain("Registro clinico");

        var consultaDeOutroPaciente = criarParecer(pacienteA, UUID.randomUUID(), Map.of(
                "texto", "Registro ficticio com consulta divergente.",
                "consultaId", consultaB.toString()));
        assertThat(consultaDeOutroPaciente.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        UUID originalB = UUID.fromString(criarParecer(pacienteB, UUID.randomUUID(), Map.of(
                "texto", "Original ficticio de outro paciente.")).getBody().path("registro").path("id").asText());
        var complementoCruzado = criarComplemento(pacienteA, originalB, UUID.randomUUID(), Map.of(
                "texto", "Complemento ficticio cruzado."));
        assertThat(complementoCruzado.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void bancoRejeitaUpdateDeleteComplementoDeComplementoEReferenciaCruzada() {
        UUID pacienteA = criarPaciente("Dora Alfa", "529.982.247-25");
        UUID pacienteB = criarPaciente("Dora Beta", "390.533.447-05");
        UUID originalA = UUID.fromString(criarParecer(pacienteA, UUID.randomUUID(), Map.of(
                "texto", "Original ficticio A.")).getBody().path("registro").path("id").asText());
        UUID originalB = UUID.fromString(criarParecer(pacienteB, UUID.randomUUID(), Map.of(
                "texto", "Original ficticio B.")).getBody().path("registro").path("id").asText());
        UUID complementoA = UUID.fromString(criarComplemento(pacienteA, originalA, UUID.randomUUID(), Map.of(
                "texto", "Complemento ficticio A.")).getBody().path("registro").path("id").asText());

        assertThatThrownBy(() -> jdbc.update("update registro_clinico set texto = ? where id = ?",
                "Alteracao proibida.", originalA)).isInstanceOf(DataAccessException.class);
        assertThatThrownBy(() -> jdbc.update("delete from registro_clinico where id = ?", originalA))
                .isInstanceOf(DataAccessException.class);

        assertThatThrownBy(() -> inserirRegistroDireto(pacienteA, complementoA, null, "COMPLEMENT", 99))
                .isInstanceOf(DataAccessException.class);
        assertThatThrownBy(() -> inserirRegistroDireto(pacienteA, originalB, null, "COMPLEMENT", 100))
                .isInstanceOf(DataAccessException.class);
    }

    @Test
    void registroRetroativoCriaNovoSnapshotSemAlterarGeracoesAnteriores() {
        UUID pacienteId = criarPaciente("Eva Snapshot", "529.982.247-25");
        UUID primeiraGeracao = UUID.fromString(criarParecer(pacienteId, UUID.randomUUID(), Map.of(
                "texto", "Registro ficticio recente.",
                "dataHoraClinica", "2026-09-12T10:00:00-03:00")).getBody().path("geracao").path("id").asText());
        UUID segundaGeracao = UUID.fromString(criarParecer(pacienteId, UUID.randomUUID(), Map.of(
                "texto", "Registro ficticio retroativo.",
                "dataHoraClinica", "2026-08-01T10:00:00-03:00")).getBody().path("geracao").path("id").asText());

        assertThat(jdbc.queryForObject("select revisao_snapshot from geracao_analise where id = ?",
                Long.class, primeiraGeracao)).isEqualTo(1L);
        assertThat(jdbc.queryForObject("select total_registros from geracao_analise where id = ?",
                Integer.class, primeiraGeracao)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select revisao_snapshot from geracao_analise where id = ?",
                Long.class, segundaGeracao)).isEqualTo(2L);
        assertThat(jdbc.queryForObject("select total_registros from geracao_analise where id = ?",
                Integer.class, segundaGeracao)).isEqualTo(2);
    }

    private UUID criarPaciente(String nome, String cpf) {
        var body = Map.of("nome", nome, "cpf", cpf, "dataNascimento", "1990-01-01",
                "telefone", "(11) 98765-4321", "email", "paciente@example.test", "queixaInicial", "");
        var resposta = http.exchange(URI.create("/api/v1/pacientes"), HttpMethod.POST,
                entidade(UUID.randomUUID(), body), JsonNode.class);
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return UUID.fromString(resposta.getBody().path("id").asText());
    }

    private UUID criarConsulta(UUID pacienteId, String agendadaPara) {
        var body = Map.of("agendadaPara", agendadaPara, "observacoes", "Observacao ficticia de agenda.");
        var resposta = http.exchange(URI.create("/api/v1/pacientes/" + pacienteId + "/consultas"),
                HttpMethod.POST, entidade(UUID.randomUUID(), body), JsonNode.class);
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return UUID.fromString(resposta.getBody().path("id").asText());
    }

    private ResponseEntity<JsonNode> criarParecer(UUID pacienteId, UUID chave, Map<String, String> body) {
        return http.exchange(URI.create("/api/v1/pacientes/" + pacienteId + "/registros-clinicos"),
                HttpMethod.POST, entidade(chave, body), JsonNode.class);
    }

    private ResponseEntity<JsonNode> criarComplemento(UUID pacienteId, UUID originalId, UUID chave, Map<String, String> body) {
        return http.exchange(URI.create("/api/v1/pacientes/" + pacienteId + "/registros-clinicos/" + originalId + "/complementos"),
                HttpMethod.POST, entidade(chave, body), JsonNode.class);
    }

    private void inserirRegistroDireto(UUID pacienteId, UUID originalId, UUID consultaId, String tipo, long revisao) {
        jdbc.update("""
                insert into registro_clinico
                (id, paciente_id, tipo, parecer_original_id, consulta_id, data_hora_clinica, criado_em,
                 texto, humor, medicamentos, revision)
                values (?, ?, ?, ?, ?, now(), now(), ?, null, null, ?)
                """, UUID.randomUUID(), pacienteId, tipo, originalId, consultaId,
                "Registro clinico ficticio direto.", revisao);
    }

    private HttpEntity<Map<String, String>> entidade(UUID chave, Map<String, String> body) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Idempotency-Key", chave.toString());
        return new HttpEntity<>(body, headers);
    }
}
