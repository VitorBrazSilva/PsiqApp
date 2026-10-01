package com.psiqapp.config;

import java.util.Base64;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "psiqapp.google-agenda")
public record GoogleAgendaPropriedades(String clientId, String clientSecret, String redirectUri,
        String frontendUri, String encryptionKey) implements GoogleAgendaConfiguracaoPort {
    @Override public boolean oauthConfigurado() {
        return preenchido(clientId) && preenchido(clientSecret) && preenchido(redirectUri)
                && redirectUriValido() && destinoFinalValido();
    }

    @Override public boolean cifraConfigurada() {
        if (!preenchido(encryptionKey)) return false;
        try { return Base64.getDecoder().decode(encryptionKey).length == 32; }
        catch (IllegalArgumentException excecao) { return false; }
    }

    @Override public boolean configurado() { return oauthConfigurado() && cifraConfigurada(); }

    public byte[] chaveDecodificada() { return Base64.getDecoder().decode(encryptionKey); }

    private boolean redirectUriValido() {
        try {
            var uri = java.net.URI.create(redirectUri);
            return uri.getHost() != null && uri.getUserInfo() == null && uri.getQuery() == null && uri.getFragment() == null
                    && "/api/v1/integracoes/google-agenda/callback".equals(uri.getPath())
                    && ("https".equalsIgnoreCase(uri.getScheme()) || loopback(uri.getHost()));
        } catch (RuntimeException excecao) { return false; }
    }

    private boolean destinoFinalValido() {
        try {
            var uri = java.net.URI.create(frontendUri);
            return uri.getHost() != null && uri.getUserInfo() == null && uri.getQuery() == null && uri.getFragment() == null
                    && "/agenda".equals(uri.getPath())
                    && ("https".equalsIgnoreCase(uri.getScheme()) || loopback(uri.getHost()));
        } catch (RuntimeException excecao) { return false; }
    }

    private static boolean loopback(String host) {
        return "localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host) || "::1".equals(host);
    }

    private static boolean preenchido(String valor) { return valor != null && !valor.isBlank(); }
}
