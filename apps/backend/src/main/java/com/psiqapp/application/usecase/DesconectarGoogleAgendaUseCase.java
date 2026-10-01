package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaAutorizacaoPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import java.time.Instant;

public class DesconectarGoogleAgendaUseCase {
    private final ConexaoGoogleAgendaPort conexao;
    private final GoogleAgendaAutorizacaoPort autorizacao;
    private final GoogleAgendaConfiguracaoPort propriedades;
    public DesconectarGoogleAgendaUseCase(ConexaoGoogleAgendaPort conexao, GoogleAgendaAutorizacaoPort autorizacao,
            GoogleAgendaConfiguracaoPort propriedades) { this.conexao = conexao; this.autorizacao = autorizacao; this.propriedades = propriedades; }
    public void executar() {
        var salvo = propriedades.configurado() ? conexao.obter() : java.util.Optional.<ConexaoGoogleAgendaPort.Conexao>empty();
        conexao.desconectar(Instant.now());
        if (salvo.isPresent() && propriedades.oauthConfigurado()) {
            try { autorizacao.revogar(salvo.get().refreshToken()); } catch (RuntimeException ignorada) { /* falha remota não reativa a conexão */ }
        }
    }
}
