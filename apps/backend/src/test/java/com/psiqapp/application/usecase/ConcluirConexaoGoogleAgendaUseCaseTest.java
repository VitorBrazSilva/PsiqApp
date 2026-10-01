package com.psiqapp.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaAutorizacaoPort;
import com.psiqapp.config.GoogleAgendaPropriedades;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ConcluirConexaoGoogleAgendaUseCaseTest {
    private final ConexaoGoogleAgendaPort conexao = mock(ConexaoGoogleAgendaPort.class);
    private final GoogleAgendaAutorizacaoPort autorizacao = mock(GoogleAgendaAutorizacaoPort.class);
    private final GoogleAgendaPropriedades props = new GoogleAgendaPropriedades("client", "secret",
            "https://app.example/api/v1/integracoes/google-agenda/callback", "https://app.example/agenda",
            Base64.getEncoder().encodeToString(new byte[32]));

    @Test void callbackSemRefreshTokenMantemCredencialExistente() {
        when(conexao.obter()).thenReturn(Optional.of(new ConexaoGoogleAgendaPort.Conexao("refresh-existente-falso", Instant.now())));
        when(autorizacao.urlAutorizacao(anyString(), anyBoolean())).thenReturn(java.net.URI.create("https://google.invalid"));
        var inicio = new IniciarConexaoGoogleAgendaUseCase(autorizacao, conexao, props);
        inicio.executar("sessao");
        when(autorizacao.trocarCodigo("codigo-falso")).thenReturn(new GoogleAgendaAutorizacaoPort.Credenciais(null));
        var concluir = new ConcluirConexaoGoogleAgendaUseCase(inicio, autorizacao, conexao, props);
        assertThat(concluir.executar("sessao", "state-errado", "codigo-falso")).isFalse();

        // Inicia novo fluxo e consome o estado correto; o Google pode omitir refresh_token em reconexões.
        inicio.executar("sessao");
        var state = capturarState(autorizacao);
        assertThat(concluir.executar("sessao", state, "codigo-falso")).isTrue();
        verify(conexao, never()).salvar(anyString(), any());
    }

    @Test void falhaDoProviderEDevolvidaComoResultadoSanitizado() {
        when(conexao.obter()).thenReturn(Optional.empty());
        when(autorizacao.urlAutorizacao(anyString(), anyBoolean())).thenReturn(java.net.URI.create("https://google.invalid"));
        var inicio = new IniciarConexaoGoogleAgendaUseCase(autorizacao, conexao, props);
        inicio.executar("sessao");
        var state = capturarState(autorizacao);
        when(autorizacao.trocarCodigo("codigo-falso")).thenThrow(new IllegalStateException("token=segredo-falso"));
        assertThat(new ConcluirConexaoGoogleAgendaUseCase(inicio, autorizacao, conexao, props)
                .executar("sessao", state, "codigo-falso")).isFalse();
    }

    private String capturarState(GoogleAgendaAutorizacaoPort port) {
        var captor = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(port, atLeastOnce()).urlAutorizacao(captor.capture(), anyBoolean());
        return captor.getValue();
    }
}
