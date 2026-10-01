package com.psiqapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.psiqapp.application.port.out.GoogleAgendaAutorizacaoPort;
import java.net.URI;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Testcontainers
class GoogleAgendaOAuthIT {
    private static final String CHAVE = Base64.getEncoder().encodeToString(new byte[32]);
    @Container @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18.6");

    @DynamicPropertySource static void propriedades(DynamicPropertyRegistry registry) {
        registry.add("psiqapp.google-agenda.client-id", () -> "client-id-fake");
        registry.add("psiqapp.google-agenda.client-secret", () -> "client-secret-fake");
        registry.add("psiqapp.google-agenda.redirect-uri", () -> "http://127.0.0.1:8080/api/v1/integracoes/google-agenda/callback");
        registry.add("psiqapp.google-agenda.frontend-uri", () -> "http://127.0.0.1:5173/agenda");
        registry.add("psiqapp.google-agenda.encryption-key", () -> CHAVE);
    }

    @Autowired MockMvc http;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    @MockitoBean GoogleAgendaAutorizacaoPort autorizacao;

    @BeforeEach void limparConexaoAnterior() { jdbc.update("delete from conexao_google_agenda"); }

    @Test void callbackPersisteTokenSomenteCifradoEEstadoNaoRevelaCredenciais() throws Exception {
        when(autorizacao.urlAutorizacao(anyString(), anyBoolean())).thenAnswer(i -> URI.create("https://google.invalid/auth?state=" + i.getArgument(0)));
        when(autorizacao.trocarCodigo("codigo-secreto-falso")).thenReturn(new GoogleAgendaAutorizacaoPort.Credenciais("refresh-token-falso"));
        MvcResult inicio = http.perform(get("/api/v1/integracoes/google-agenda/conectar")).andExpect(status().is3xxRedirection()).andReturn();
        String state = URI.create(inicio.getResponse().getRedirectedUrl()).getQuery().substring("state=".length());
        var cookieOAuth = inicio.getResponse().getCookie("PSIQAPP_GOOGLE_OAUTH");
        String cookie = cookieOAuth.getValue();
        assertThat(cookieOAuth.isHttpOnly()).isTrue();
        assertThat(inicio.getResponse().getHeader("Set-Cookie")).contains("SameSite=Lax");

        http.perform(get("/api/v1/integracoes/google-agenda/callback").cookie(new jakarta.servlet.http.Cookie("PSIQAPP_GOOGLE_OAUTH", cookie))
                        .param("state", state).param("code", "codigo-secreto-falso"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("http://127.0.0.1:5173/agenda?googleAgenda=conectada"));
        assertThat(jdbc.queryForObject("select refresh_token_cifrado from conexao_google_agenda", String.class))
                .doesNotContain("refresh-token-falso");
        assertThat(jdbc.queryForObject("select refresh_token_iv from conexao_google_agenda", String.class)).isNotBlank();
        http.perform(get("/api/v1/integracoes/google-agenda")).andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CONECTADA"))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("refresh-token-falso"))))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("codigo-secreto-falso"))));
    }

    @Test void stateInvalidoNaoTrocaCodigoNemCriaConexao() throws Exception {
        when(autorizacao.urlAutorizacao(anyString(), anyBoolean())).thenAnswer(i -> URI.create("https://google.invalid/auth?state=" + i.getArgument(0)));
        MvcResult inicio = http.perform(get("/api/v1/integracoes/google-agenda/conectar")).andReturn();
        String cookie = inicio.getResponse().getCookie("PSIQAPP_GOOGLE_OAUTH").getValue();
        http.perform(get("/api/v1/integracoes/google-agenda/callback").cookie(new jakarta.servlet.http.Cookie("PSIQAPP_GOOGLE_OAUTH", cookie))
                        .param("state", "state-invalido").param("code", "codigo-falso"))
                .andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("http://127.0.0.1:5173/agenda?googleAgenda=erro"));
        verify(autorizacao, never()).trocarCodigo(anyString());
        assertThat(jdbc.queryForObject("select count(*) from conexao_google_agenda", Integer.class)).isZero();
    }

    @Test void desconexaoApagaTokenLocalMesmoSeRevogacaoFalhar() throws Exception {
        when(autorizacao.trocarCodigo(anyString())).thenReturn(new GoogleAgendaAutorizacaoPort.Credenciais("refresh-fake"));
        when(autorizacao.urlAutorizacao(anyString(), anyBoolean())).thenAnswer(i -> URI.create("https://google.invalid/auth?state=" + i.getArgument(0)));
        MvcResult inicio = http.perform(get("/api/v1/integracoes/google-agenda/conectar")).andReturn();
        String state = URI.create(inicio.getResponse().getRedirectedUrl()).getQuery().substring("state=".length());
        http.perform(get("/api/v1/integracoes/google-agenda/callback").cookie(inicio.getResponse().getCookie("PSIQAPP_GOOGLE_OAUTH"))
                .param("state", state).param("code", "code"));
        doThrow(new IllegalStateException("falha fake")).when(autorizacao).revogar("refresh-fake");
        http.perform(delete("/api/v1/integracoes/google-agenda/conexao")).andExpect(status().isNoContent());
        assertThat(jdbc.queryForObject("select estado from conexao_google_agenda", String.class)).isEqualTo("DESCONECTADA");
        assertThat(jdbc.queryForObject("select refresh_token_cifrado from conexao_google_agenda", String.class)).isNull();
        http.perform(get("/api/v1/integracoes/google-agenda")).andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("DESCONECTADA"));
    }
}
