package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;

public class ObterEstadoGoogleAgendaUseCase {
    private final ConexaoGoogleAgendaPort conexao;
    private final GoogleAgendaConfiguracaoPort propriedades;
    public ObterEstadoGoogleAgendaUseCase(ConexaoGoogleAgendaPort conexao, GoogleAgendaConfiguracaoPort propriedades) {
        this.conexao = conexao; this.propriedades = propriedades;
    }
    public EstadoConexaoGoogleAgenda executar() {
        if (!propriedades.configurado()) return new EstadoConexaoGoogleAgenda("NAO_CONFIGURADA");
        try { return new EstadoConexaoGoogleAgenda(conexao.estado()); }
        catch (RuntimeException excecao) { return new EstadoConexaoGoogleAgenda("INDISPONIVEL"); }
    }
}
