package com.psiqapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import com.psiqapp.application.usecase.FalhaGoogleAgendaException;
import com.psiqapp.application.usecase.ProcessarSincronizacaoGoogleAgendaUseCase;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.web.util.UriComponentsBuilder;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "psiqapp.google-agenda.client-id=fixture-client-id",
        "psiqapp.google-agenda.client-secret=fixture-client-secret",
        "psiqapp.google-agenda.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "psiqapp.google-agenda.worker.enabled=false"
})
@ActiveProfiles("local")
@Testcontainers
class GoogleAgendaCalendarIT {
    private static final Instant INICIO = Instant.parse("2026-10-01T13:00:00Z");
    private static final Instant INICIO_TRES_DIAS_DEPOIS = INICIO.plus(java.time.Duration.ofDays(3));
    private static final List<String> CPFS_FICTICIOS = List.of("529.982.247-25", "390.533.447-05", "111.444.777-35");
    private static final String TOKEN = "refresh-token-ficticio";
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired TestRestTemplate http;
    @Autowired Flyway flyway;
    @Autowired JdbcTemplate jdbc;
    @Autowired ConexaoGoogleAgendaPort conexao;
    @Autowired RepositorySincronizacaoConsultaPort sincronizacoes;
    @Autowired ProcessarSincronizacaoGoogleAgendaUseCase worker;
    @MockitoBean GoogleAgendaCalendarioPort calendario;
    private int cpfAtual;

    @BeforeEach
    void limparBanco() {
        reset(calendario);
        flyway.migrate();
        jdbc.execute("truncate table sincronizacao_consulta_google, idempotencia, consulta, paciente restart identity cascade");
        jdbc.execute("delete from conexao_google_agenda");
        cpfAtual = 0;
    }

    @Test
    void disponibilidadeLocalEAgendamentoUsamIntervaloDeUmaHoraComFimExclusivo() {
        UUID paciente = criarPaciente("Aline Agenda");

        UUID chavePrimeira = UUID.randomUUID();
        var primeira = criarConsulta(paciente, chavePrimeira, "2026-10-01T10:00:00-03:00");
        assertThat(primeira.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(primeira.getBody().path("sincronizacaoGoogleAgenda").path("estado").asText())
                .isEqualTo("AGUARDANDO_CONEXAO");
        var primeiraRepetida = criarConsulta(paciente, chavePrimeira, "2026-10-01T10:00:00-03:00");
        assertThat(primeiraRepetida.getBody().path("id").asText())
                .isEqualTo(primeira.getBody().path("id").asText());
        assertThat(jdbc.queryForObject("select count(*) from sincronizacao_consulta_google", Long.class)).isEqualTo(1);

        var adjacente = disponibilidade("2026-10-01T11:00:00-03:00");
        assertThat(adjacente.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(adjacente.getBody().path("estado").asText()).isEqualTo("DISPONIVEL");
        assertThat(adjacente.getBody().path("fusoHorario").asText()).isEqualTo("America/Sao_Paulo");

        assertThat(criarConsulta(paciente, UUID.randomUUID(), "2026-10-01T11:00:00-03:00").getStatusCode())
                .isEqualTo(HttpStatus.CREATED);
        assertThat(criarConsulta(paciente, UUID.randomUUID(), "2026-10-01T10:30:00-03:00").getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
        assertThat(jdbc.queryForObject("select count(*) from sincronizacao_consulta_google", Long.class)).isEqualTo(2);
    }

    @Test
    void freeBusyBloqueiaConflitoGoogleEIndisponibilidadeRetornaContratoDistinto() {
        UUID paciente = criarPaciente("Bruno Calendário");
        conexao.salvar(TOKEN, Instant.now());
        when(calendario.consultarOcupacao(anyString(), any(), any())).thenReturn(List.of(
                new GoogleAgendaCalendarioPort.Intervalo(INICIO.plusSeconds(600), INICIO.plusSeconds(1_800))));

        var disponibilidadeOcupada = disponibilidade("2026-10-01T10:00:00-03:00");
        assertThat(disponibilidadeOcupada.getBody().path("estado").asText()).isEqualTo("OCUPADO");
        var conflito = criarConsulta(paciente, UUID.randomUUID(), "2026-10-01T10:00:00-03:00");
        assertThat(conflito.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(conflito.getBody().path("codigo").asText()).isEqualTo("CONFLITO");

        reset(calendario);
        when(calendario.consultarOcupacao(anyString(), any(), any()))
                .thenThrow(new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.TRANSITORIA));
        var indisponivel = disponibilidade("2026-10-01T12:00:00-03:00");
        assertThat(indisponivel.getBody().path("estado").asText()).isEqualTo("INDISPONIVEL");
        var falha = criarConsulta(paciente, UUID.randomUUID(), "2026-10-01T12:00:00-03:00");
        assertThat(falha.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(falha.getBody().path("codigo").asText()).isEqualTo("GOOGLE_DISPONIBILIDADE_INDISPONIVEL");
        assertThat(falha.getBody().toString()).doesNotContain(TOKEN, "GoogleJsonResponseException", "refresh_token");
        assertThat(jdbc.queryForObject("select count(*) from consulta", Long.class)).isZero();
        assertThat(jdbc.queryForObject("select count(*) from sincronizacao_consulta_google", Long.class)).isZero();
    }

    @Test
    void disponibilidadeMensalAtivaRetorna503SanitizadoSemSlotsParciais() {
        conexao.salvar(TOKEN, Instant.now());
        when(calendario.consultarOcupacao(anyString(), any(), any()))
                .thenThrow(new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.TRANSITORIA));

        var resposta = http.getForEntity("/api/v1/consultas/disponibilidade/mensal?mes=2026-10", JsonNode.class);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(resposta.getBody().path("codigo").asText())
                .isEqualTo("GOOGLE_DISPONIBILIDADE_INDISPONIVEL");
        assertThat(resposta.getHeaders().getCacheControl()).contains("no-store");
        assertThat(resposta.getBody().toString()).doesNotContain(TOKEN, "dias", "horarios", "freeBusy");
    }

    @Test
    void mudancaDaConexaoDuranteFreeBusyInvalidaDisponibilidadeMensal() {
        conexao.salvar(TOKEN, Instant.now());
        when(calendario.consultarOcupacao(anyString(), any(), any())).thenAnswer(invocacao -> {
            conexao.desconectar(Instant.now());
            return List.of(new GoogleAgendaCalendarioPort.Intervalo(INICIO, INICIO_TRES_DIAS_DEPOIS));
        });

        var resposta = http.getForEntity("/api/v1/consultas/disponibilidade/mensal?mes=2026-10", JsonNode.class);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(resposta.getBody().path("codigo").asText())
                .isEqualTo("GOOGLE_DISPONIBILIDADE_INDISPONIVEL");
        assertThat(resposta.getBody().toString()).doesNotContain("dias", "horarios", INICIO.toString());
    }

    @Test
    void concorrenciaDeCriacaoLocalEAtomicidadeDaIntencaoSincronizada() throws Exception {
        UUID paciente = criarPaciente("Carla Concorrente");
        Callable<ResponseEntity<JsonNode>> chamadaA = () -> criarConsulta(paciente, UUID.randomUUID(), "2026-10-02T10:00:00-03:00");
        Callable<ResponseEntity<JsonNode>> chamadaB = () -> criarConsulta(paciente, UUID.randomUUID(), "2026-10-02T10:00:00-03:00");
        try (var executor = Executors.newFixedThreadPool(2)) {
            var primeira = executor.submit(chamadaA);
            var segunda = executor.submit(chamadaB);
            var statusA = primeira.get().getStatusCode();
            var statusB = segunda.get().getStatusCode();
            assertThat(List.of(statusA, statusB)).contains(HttpStatus.CREATED, HttpStatus.CONFLICT);
        }
        assertThat(jdbc.queryForObject("select count(*) from consulta", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from sincronizacao_consulta_google", Long.class)).isEqualTo(1);

        jdbc.execute("create or replace function rejeitar_intencao_google() returns trigger language plpgsql as $$ begin raise exception 'falha de fixture'; end $$");
        jdbc.execute("create trigger rejeitar_intencao_google before insert on sincronizacao_consulta_google for each row execute function rejeitar_intencao_google()");
        UUID outroPaciente = criarPaciente("Davi Atomicidade");
        var falha = criarConsulta(outroPaciente, UUID.randomUUID(), "2026-10-03T10:00:00-03:00");
        assertThat(falha.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        jdbc.execute("drop trigger rejeitar_intencao_google on sincronizacao_consulta_google");
        jdbc.execute("drop function rejeitar_intencao_google()");
        assertThat(jdbc.queryForObject("select count(*) from consulta", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("select count(*) from idempotencia where operacao_escopo='CRIAR_CONSULTA'", Long.class))
                .isEqualTo(1);
    }

    @Test
    void workerRetomaPendenciaEStatusUsaIdEstavelSemAlterarHorario() {
        UUID paciente = criarPaciente("Eva Worker");
        conexao.salvar(TOKEN, Instant.now());
        when(calendario.consultarOcupacao(anyString(), any(), any())).thenReturn(List.of());
        var consulta = criarConsulta(paciente, UUID.randomUUID(), "2026-10-04T10:00:00-03:00");
        UUID consultaId = UUID.fromString(consulta.getBody().path("id").asText());
        String eventoId = consultaId.toString().replace("-", "");
        when(calendario.consultaAssociada(TOKEN, eventoId)).thenReturn(Optional.empty());
        jdbc.update("update sincronizacao_consulta_google set proxima_tentativa = ? where consulta_id = ?",
                java.sql.Timestamp.from(Instant.now().minusSeconds(1)), consultaId);

        assertThat(worker.processarLote()).isEqualTo(1);
        assertThat(sincronizacoes.buscar(consultaId).orElseThrow().estado())
                .isEqualTo(RepositorySincronizacaoConsultaPort.Estado.SINCRONIZADA);

        var falta = atualizarStatus(consultaId, "FALTA");
        assertThat(falta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(falta.getBody().path("sincronizacaoGoogleAgenda").path("estado").asText()).isEqualTo("PENDENTE");
        when(calendario.consultaAssociada(TOKEN, eventoId)).thenReturn(Optional.of(consultaId.toString()));
        assertThat(worker.processarLote()).isEqualTo(1);
        assertThat(jdbc.queryForObject("select agendada_para from consulta where id = ?", java.sql.Timestamp.class,
                consultaId).toInstant()).isEqualTo(INICIO_TRES_DIAS_DEPOIS);
        org.mockito.Mockito.verify(calendario).criarEvento(org.mockito.ArgumentMatchers.eq(TOKEN),
                org.mockito.ArgumentMatchers.eq(eventoId), org.mockito.ArgumentMatchers.argThat(evento ->
                        evento.status().name().equals("AGENDADA") && evento.inicio().equals(INICIO_TRES_DIAS_DEPOIS)));
        org.mockito.Mockito.verify(calendario).atualizarEvento(org.mockito.ArgumentMatchers.eq(TOKEN),
                org.mockito.ArgumentMatchers.eq(eventoId), org.mockito.ArgumentMatchers.argThat(evento ->
                        evento.status().name().equals("FALTA") && evento.inicio().equals(INICIO_TRES_DIAS_DEPOIS)
                                && evento.fim().equals(INICIO_TRES_DIAS_DEPOIS.plusSeconds(3_600))));

        UUID consultaCancelada = UUID.fromString(criarConsulta(paciente, UUID.randomUUID(),
                "2026-10-04T12:00:00-03:00").getBody().path("id").asText());
        String eventoCanceladoId = consultaCancelada.toString().replace("-", "");
        when(calendario.consultaAssociada(TOKEN, eventoCanceladoId)).thenReturn(Optional.empty());
        assertThat(worker.processarLote()).isEqualTo(1);
        assertThat(atualizarStatus(consultaCancelada, "CANCELADA").getStatusCode()).isEqualTo(HttpStatus.OK);
        when(calendario.consultaAssociada(TOKEN, eventoCanceladoId)).thenReturn(Optional.of(consultaCancelada.toString()));
        assertThat(worker.processarLote()).isEqualTo(1);
        org.mockito.Mockito.verify(calendario).removerEvento(TOKEN, eventoCanceladoId);
    }

    @Test
    void retriesLimitadosSaoPersistidosRecuperaveisEReiniciadosPorAcaoManual() {
        UUID paciente = criarPaciente("Felipe Retry");
        conexao.salvar(TOKEN, Instant.now());
        when(calendario.consultarOcupacao(anyString(), any(), any())).thenReturn(List.of());
        UUID consultaId = UUID.fromString(criarConsulta(paciente, UUID.randomUUID(), "2026-10-05T10:00:00-03:00")
                .getBody().path("id").asText());
        String eventoId = consultaId.toString().replace("-", "");
        when(calendario.consultaAssociada(TOKEN, eventoId)).thenReturn(Optional.empty());
        var falhaTransitoria = new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.TRANSITORIA);
        doThrow(falhaTransitoria, falhaTransitoria, falhaTransitoria, falhaTransitoria, falhaTransitoria)
                .when(calendario).criarEvento(org.mockito.ArgumentMatchers.eq(TOKEN),
                        org.mockito.ArgumentMatchers.eq(eventoId), any());

        for (int tentativa = 0; tentativa < 5; tentativa++) {
            jdbc.update("update sincronizacao_consulta_google set proxima_tentativa = ? where consulta_id = ?",
                    java.sql.Timestamp.from(Instant.now().minusSeconds(1)), consultaId);
            worker.processarLote();
        }
        assertThat(sincronizacoes.buscar(consultaId).orElseThrow().estado())
                .isEqualTo(RepositorySincronizacaoConsultaPort.Estado.FALHA);
        assertThat(jdbc.queryForObject("select tentativas from sincronizacao_consulta_google where consulta_id = ?",
                Integer.class, consultaId)).isEqualTo(5);

        var novaTentativa = http.postForEntity("/api/v1/consultas/" + consultaId
                + "/sincronizacao-google/tentar-novamente", HttpEntity.EMPTY, JsonNode.class);
        assertThat(novaTentativa.getStatusCode()).isEqualTo(HttpStatus.ACCEPTED);
        assertThat(novaTentativa.getBody().path("sincronizacaoGoogleAgenda").path("estado").asText()).isEqualTo("PENDENTE");
        assertThat(jdbc.queryForObject("select tentativas from sincronizacao_consulta_google where consulta_id = ?",
                Integer.class, consultaId)).isZero();

        org.mockito.Mockito.doNothing().when(calendario).criarEvento(
                org.mockito.ArgumentMatchers.eq(TOKEN), org.mockito.ArgumentMatchers.eq(eventoId), any());
        jdbc.update("update sincronizacao_consulta_google set proxima_tentativa = ? where consulta_id = ?",
                java.sql.Timestamp.from(Instant.now().minusSeconds(1)), consultaId);
        worker.processarLote();
        assertThat(sincronizacoes.buscar(consultaId).orElseThrow().estado())
                .isEqualTo(RepositorySincronizacaoConsultaPort.Estado.SINCRONIZADA);
    }

    @Test
    void consultaLegadaNaoRecebeEstadoDeSincronizacao() {
        UUID paciente = criarPaciente("Gabi Legada");
        UUID consultaId = UUID.randomUUID();
        jdbc.update("""
                insert into consulta (id, paciente_id, agendada_para, status, observacoes, criada_em)
                values (?, ?, ?, 'AGENDADA', null, ?)
                """, consultaId, paciente, java.sql.Timestamp.from(INICIO), java.sql.Timestamp.from(Instant.now()));
        assertThat(sincronizacoes.buscar(consultaId)).isEmpty();
        assertThat(jdbc.queryForObject("select count(*) from sincronizacao_consulta_google", Long.class)).isZero();

        var consultaPublica = http.getForEntity("/api/v1/consultas?pacienteId=" + paciente, JsonNode.class);
        assertThat(consultaPublica.getBody().path("itens").get(0).path("sincronizacaoGoogleAgenda")
                .path("estado").asText()).isEqualTo("NAO_APLICAVEL");
    }

    @Test
    void workerRecuperaClaimExpiradoDepoisDeReiniciar() {
        UUID paciente = criarPaciente("Gabi Lease");
        UUID consultaId = UUID.fromString(criarConsulta(paciente, UUID.randomUUID(),
                "2026-10-06T10:00:00-03:00").getBody().path("id").asText());
        conexao.salvar(TOKEN, Instant.now());
        String eventoId = consultaId.toString().replace("-", "");
        when(calendario.consultaAssociada(TOKEN, eventoId)).thenReturn(Optional.empty());

        Instant agora = Instant.now();
        var claimAntesDaQueda = sincronizacoes.reivindicarVencidas(agora, agora.plusSeconds(120), 20);
        assertThat(claimAntesDaQueda).hasSize(1);
        assertThat(claimAntesDaQueda.get(0).tentativas()).isEqualTo(1);
        jdbc.update("update sincronizacao_consulta_google set proxima_tentativa = ? where consulta_id = ?",
                java.sql.Timestamp.from(agora.minusSeconds(1)), consultaId);

        assertThat(worker.processarLote()).isEqualTo(1);
        assertThat(sincronizacoes.buscar(consultaId).orElseThrow().estado())
                .isEqualTo(RepositorySincronizacaoConsultaPort.Estado.SINCRONIZADA);
        assertThat(jdbc.queryForObject("select tentativas from sincronizacao_consulta_google where consulta_id = ?",
                Integer.class, consultaId)).isEqualTo(2);
        org.mockito.Mockito.verify(calendario).criarEvento(org.mockito.ArgumentMatchers.eq(TOKEN),
                org.mockito.ArgumentMatchers.eq(eventoId), any());
    }

    @Test
    void atualizacaoDeBancoComConsultaLegadaNaoFazBackfill() {
        String schema = "agenda_upgrade_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        UUID pacienteId = UUID.randomUUID();
        UUID consultaId = UUID.randomUUID();
        try {
            Flyway antesDaFeature = Flyway.configure()
                    .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                    .schemas(schema).defaultSchema(schema).target(MigrationVersion.fromVersion("5")).load();
            antesDaFeature.migrate();
            jdbc.update("""
                    insert into %s.paciente (id, nome, nome_busca, cpf, data_nascimento, telefone, email, criado_em)
                    values (?, ?, ?, ?, ?, ?, ?, ?)
                    """.formatted(schema), pacienteId, "Heitor Legado", "heitor legado", "52998224725",
                    java.time.LocalDate.of(1990, 1, 1), "+5511987654321", "heitor@example.test",
                    java.sql.Timestamp.from(Instant.now()));
            jdbc.update("""
                    insert into %s.consulta (id, paciente_id, agendada_para, status, criada_em)
                    values (?, ?, ?, 'AGENDADA', ?)
                    """.formatted(schema), consultaId, pacienteId, java.sql.Timestamp.from(INICIO),
                    java.sql.Timestamp.from(Instant.now()));

            Flyway atualizacao = Flyway.configure()
                    .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                    .schemas(schema).defaultSchema(schema).load();
            atualizacao.migrate();

            assertThat(jdbc.queryForObject("select count(*) from " + schema + ".consulta", Long.class)).isEqualTo(1);
            assertThat(jdbc.queryForObject("select count(*) from " + schema + ".sincronizacao_consulta_google",
                    Long.class)).isZero();
            assertThat(jdbc.queryForObject("""
                    select count(*) from pg_indexes
                     where schemaname = ?
                       and indexname in ('ix_sincronizacao_consulta_google_vencidas',
                                         'ix_consulta_agendada_para_agendada')
                    """, Long.class, schema)).isEqualTo(2);
        } finally {
            jdbc.execute("drop schema if exists " + schema + " cascade");
        }
    }

    private UUID criarPaciente(String nome) {
        var body = Map.of("nome", nome, "cpf", CPFS_FICTICIOS.get(cpfAtual++), "dataNascimento", "1990-01-01",
                "telefone", "(11) 98765-4321", "email", "paciente@example.test", "queixaInicial", "");
        var resposta = http.exchange(URI.create("/api/v1/pacientes"), HttpMethod.POST,
                entidade(UUID.randomUUID(), body), JsonNode.class);
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return UUID.fromString(resposta.getBody().path("id").asText());
    }

    private ResponseEntity<JsonNode> criarConsulta(UUID pacienteId, UUID chave, String inicio) {
        var body = Map.of("agendadaPara", inicio, "observacoes", "Observacao ficticia de agenda.");
        return http.exchange(URI.create("/api/v1/pacientes/" + pacienteId + "/consultas"), HttpMethod.POST,
                entidade(chave, body), JsonNode.class);
    }

    private ResponseEntity<JsonNode> disponibilidade(String inicio) {
        URI uri = UriComponentsBuilder.fromPath("/api/v1/consultas/disponibilidade")
                .queryParam("agendadaPara", inicio).build().encode().toUri();
        return http.getForEntity(uri, JsonNode.class);
    }

    private ResponseEntity<JsonNode> atualizarStatus(UUID consultaId, String status) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return http.exchange(URI.create("/api/v1/consultas/" + consultaId + "/status"), HttpMethod.POST,
                new HttpEntity<>(Map.of("status", status), headers), JsonNode.class);
    }

    private HttpEntity<Map<String, String>> entidade(UUID chave, Map<String, String> body) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Idempotency-Key", chave.toString());
        return new HttpEntity<>(body, headers);
    }

}
