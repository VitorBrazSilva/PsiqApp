package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaAutorizacaoPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import java.time.Instant;

public class ConcluirConexaoGoogleAgendaUseCase {
    private final IniciarConexaoGoogleAgendaUseCase inicio;
    private final GoogleAgendaAutorizacaoPort autorizacao;
    private final ConexaoGoogleAgendaPort conexao;
    private final GoogleAgendaConfiguracaoPort propriedades;
    public ConcluirConexaoGoogleAgendaUseCase(IniciarConexaoGoogleAgendaUseCase inicio,
            GoogleAgendaAutorizacaoPort autorizacao, ConexaoGoogleAgendaPort conexao, GoogleAgendaConfiguracaoPort propriedades) {
        this.inicio = inicio; this.autorizacao = autorizacao; this.conexao = conexao; this.propriedades = propriedades;
    }
    public boolean executar(String sessao, String state, String codigo) {
        if (!propriedades.configurado() || !inicio.consumir(sessao, state) || codigo == null || codigo.isBlank()) return false;
        try {
            var credenciais = autorizacao.trocarCodigo(codigo);
            String token = credenciais.refreshToken();
            if ((token == null || token.isBlank()) && conexao.obter().isPresent()) return true;
            if (token == null || token.isBlank()) return false;
            conexao.salvar(token, Instant.now());
            return true;
        } catch (RuntimeException excecao) { return false; }
    }
}
