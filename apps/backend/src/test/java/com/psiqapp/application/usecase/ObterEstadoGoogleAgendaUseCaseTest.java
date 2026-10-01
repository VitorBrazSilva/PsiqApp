package com.psiqapp.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.config.GoogleAgendaPropriedades;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class ObterEstadoGoogleAgendaUseCaseTest {
    private final ConexaoGoogleAgendaPort conexao = mock(ConexaoGoogleAgendaPort.class);
    private final GoogleAgendaPropriedades props = new GoogleAgendaPropriedades("client", "secret",
            "https://api.example/api/v1/integracoes/google-agenda/callback", "https://app.example/agenda",
            Base64.getEncoder().encodeToString(new byte[32]));

    @Test void preservaEstadoDeConexaoPersistidoSemExporCredenciais() {
        when(conexao.estado()).thenReturn("DESCONECTADA");
        assertThat(new ObterEstadoGoogleAgendaUseCase(conexao, props).executar().estado()).isEqualTo("DESCONECTADA");
        verify(conexao, never()).obter();
    }

    @Test void falhaAoLerEstadoEApresentadaComoIndisponivel() {
        when(conexao.estado()).thenThrow(new IllegalStateException("falha protegida"));
        assertThat(new ObterEstadoGoogleAgendaUseCase(conexao, props).executar().estado()).isEqualTo("INDISPONIVEL");
    }
}
