package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaAutorizacaoPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import java.net.URI;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.time.Instant;
import java.time.Duration;

public class IniciarConexaoGoogleAgendaUseCase {
    private static final Duration VALIDADE = Duration.ofMinutes(10);
    private final GoogleAgendaAutorizacaoPort autorizacao;
    private final ConexaoGoogleAgendaPort conexao;
    private final GoogleAgendaConfiguracaoPort propriedades;
    private final ConcurrentHashMap<String, Sessao> estados = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public IniciarConexaoGoogleAgendaUseCase(GoogleAgendaAutorizacaoPort autorizacao, ConexaoGoogleAgendaPort conexao,
            GoogleAgendaConfiguracaoPort propriedades) {
        this.autorizacao = autorizacao; this.conexao = conexao; this.propriedades = propriedades;
    }

    public URI executar(String sessao) {
        if (!propriedades.configurado()) throw new ErroGoogleAgendaException("GOOGLE_NAO_CONFIGURADO");
        limparExpirados();
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String state = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        estados.put(sessao, new Sessao(state, Instant.now().plus(VALIDADE)));
        return autorizacao.urlAutorizacao(state, conexao.obter().isEmpty());
    }

    public boolean consumir(String sessao, String state) {
        Sessao salvo = estados.remove(sessao);
        return salvo != null && salvo.expiraEm().isAfter(Instant.now()) && state != null
                && java.security.MessageDigest.isEqual(salvo.state().getBytes(java.nio.charset.StandardCharsets.UTF_8),
                        state.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private void limparExpirados() { estados.entrySet().removeIf(e -> !e.getValue().expiraEm().isAfter(Instant.now())); }
    private record Sessao(String state, Instant expiraEm) {}
}
