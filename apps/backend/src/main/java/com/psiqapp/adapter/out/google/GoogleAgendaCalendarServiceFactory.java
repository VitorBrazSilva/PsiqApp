package com.psiqapp.adapter.out.google;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.psiqapp.application.usecase.FalhaGoogleAgendaException;
import com.psiqapp.config.GoogleAgendaPropriedades;
import org.springframework.stereotype.Component;

@Component
class GoogleAgendaCalendarServiceFactory implements GoogleCalendarServiceFactory {
    private final GoogleAgendaPropriedades propriedades;

    GoogleAgendaCalendarServiceFactory(GoogleAgendaPropriedades propriedades) {
        this.propriedades = propriedades;
    }

    @Override
    public Calendar criar(String refreshToken) {
        if (!propriedades.configurado() || refreshToken == null || refreshToken.isBlank()) {
            throw new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.AUTORIZACAO);
        }
        try {
            var transporte = new NetHttpTransport();
            var json = GsonFactory.getDefaultInstance();
            var credencial = new GoogleCredential.Builder()
                    .setTransport(transporte)
                    .setJsonFactory(json)
                    .setClientSecrets(propriedades.clientId(), propriedades.clientSecret())
                    .build()
                    .setRefreshToken(refreshToken);
            HttpRequestInitializer inicializador = requisicao -> {
                credencial.initialize(requisicao);
                requisicao.setConnectTimeout(5_000);
                requisicao.setReadTimeout(10_000);
            };
            return new Calendar.Builder(transporte, json, inicializador)
                    .setApplicationName("PsiqApp")
                    .build();
        } catch (RuntimeException excecao) {
            throw new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.AUTORIZACAO);
        }
    }
}
