package com.psiqapp.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;
import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaAutorizacaoPort;
import com.psiqapp.config.GoogleAgendaPropriedades;
import java.net.URI;
import java.util.Base64;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class IniciarConexaoGoogleAgendaUseCaseTest {
    private final ConexaoGoogleAgendaPort conexao = mock(ConexaoGoogleAgendaPort.class);
    private final GoogleAgendaAutorizacaoPort autorizacao = mock(GoogleAgendaAutorizacaoPort.class);
    private final GoogleAgendaPropriedades props = new GoogleAgendaPropriedades("client", "secret",
            "https://app.example/api/v1/integracoes/google-agenda/callback", "https://app.example/agenda",
            Base64.getEncoder().encodeToString(new byte[32]));

    @Test void stateAleatorioSoPodeSerConsumidoUmaVezNaSessaoQueIniciou() {
        when(conexao.obter()).thenReturn(Optional.empty());
        when(autorizacao.urlAutorizacao(anyString(), anyBoolean())).thenAnswer(i -> URI.create("https://google.example/?state=" + i.getArgument(0)));
        var useCase = new IniciarConexaoGoogleAgendaUseCase(autorizacao, conexao, props);
        String state = useCase.executar("sessao-a").getQuery().substring("state=".length());
        assertThat(state).hasSize(43);
        assertThat(useCase.consumir("sessao-b", state)).isFalse();
        assertThat(useCase.consumir("sessao-a", "errado")).isFalse();
        assertThat(useCase.consumir("sessao-a", state)).isFalse();

        String segundo = useCase.executar("sessao-a").getQuery().substring("state=".length());
        assertThat(useCase.consumir("sessao-a", segundo)).isTrue();
        assertThat(useCase.consumir("sessao-a", segundo)).isFalse();
    }

    @Test void configuraçãoAusenteNãoIniciaFluxo() {
        var useCase = new IniciarConexaoGoogleAgendaUseCase(autorizacao, conexao,
                new GoogleAgendaPropriedades("", "", "", "", ""));
        assertThatThrownBy(() -> useCase.executar("sessao")).isInstanceOf(ErroGoogleAgendaException.class)
                .hasMessage("GOOGLE_NAO_CONFIGURADO");
        verifyNoInteractions(autorizacao);
    }
}
