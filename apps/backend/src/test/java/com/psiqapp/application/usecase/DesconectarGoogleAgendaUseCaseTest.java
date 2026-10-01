package com.psiqapp.application.usecase;

import static org.mockito.Mockito.*;
import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaAutorizacaoPort;
import com.psiqapp.config.GoogleAgendaPropriedades;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class DesconectarGoogleAgendaUseCaseTest {
    private final ConexaoGoogleAgendaPort conexao = mock(ConexaoGoogleAgendaPort.class);
    private final GoogleAgendaAutorizacaoPort autorizacao = mock(GoogleAgendaAutorizacaoPort.class);
    private final GoogleAgendaPropriedades props = new GoogleAgendaPropriedades("client", "secret",
            "https://app.example/api/v1/integracoes/google-agenda/callback", "https://app.example/agenda",
            Base64.getEncoder().encodeToString(new byte[32]));

    @Test void desconectaLocalmenteMesmoQuandoRevogacaoGoogleFalha() {
        when(conexao.obter()).thenReturn(Optional.of(new ConexaoGoogleAgendaPort.Conexao("refresh-fake", Instant.now())));
        doThrow(new IllegalStateException("erro remoto")).when(autorizacao).revogar("refresh-fake");
        new DesconectarGoogleAgendaUseCase(conexao, autorizacao, props).executar();
        verify(conexao).desconectar(any());
        verify(autorizacao).revogar("refresh-fake");
    }

    @Test void chaveAusenteAindaPermiteRemoverCredencialLocalSemTentarDescriptografar() {
        var semChave = new GoogleAgendaPropriedades("client", "secret",
                "https://app.example/api/v1/integracoes/google-agenda/callback", "https://app.example/agenda", "");
        new DesconectarGoogleAgendaUseCase(conexao, autorizacao, semChave).executar();
        verify(conexao).desconectar(any());
        verifyNoInteractions(autorizacao);
    }
}
