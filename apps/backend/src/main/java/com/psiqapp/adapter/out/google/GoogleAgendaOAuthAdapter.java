package com.psiqapp.adapter.out.google;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.psiqapp.application.port.out.GoogleAgendaAutorizacaoPort;
import com.psiqapp.config.GoogleAgendaPropriedades;
import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class GoogleAgendaOAuthAdapter implements GoogleAgendaAutorizacaoPort {
    static final List<String> SCOPES = List.of("https://www.googleapis.com/auth/calendar.freebusy", "https://www.googleapis.com/auth/calendar.events.owned");
    private final GoogleAgendaPropriedades propriedades;
    public GoogleAgendaOAuthAdapter(GoogleAgendaPropriedades propriedades) { this.propriedades = propriedades; }
    private GoogleAuthorizationCodeFlow flow() {
        var secrets = new GoogleClientSecrets().setInstalled(new GoogleClientSecrets.Details()
                .setClientId(propriedades.clientId()).setClientSecret(propriedades.clientSecret()));
        return new GoogleAuthorizationCodeFlow.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance(), secrets, SCOPES).build();
    }
    @Override public URI urlAutorizacao(String state, boolean consentimento) {
        var url = flow().newAuthorizationUrl().setRedirectUri(propriedades.redirectUri()).setState(state).setAccessType("offline");
        if (consentimento) url.set("prompt", "consent");
        return URI.create(url.build());
    }
    @Override public Credenciais trocarCodigo(String codigo) {
        try {
            GoogleTokenResponse resposta = flow().newTokenRequest(codigo).setRedirectUri(propriedades.redirectUri()).execute();
            return new Credenciais(resposta.getRefreshToken());
        } catch (Exception excecao) { throw new IllegalStateException("Falha ao concluir autorização Google."); }
    }
    @Override public void revogar(String refreshToken) {
        try {
            String body = "token=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);
            var request = HttpRequest.newBuilder(URI.create("https://oauth2.googleapis.com/revoke"))
                    .timeout(Duration.ofSeconds(5)).header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body)).build();
            HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.discarding());
        } catch (Exception excecao) { throw new IllegalStateException("Falha sanitizada ao revogar autorização Google."); }
    }
}
