package com.psiqapp.application.port.out;

import java.net.URI;

public interface GoogleAgendaAutorizacaoPort {
    URI urlAutorizacao(String state, boolean solicitarConsentimento);
    Credenciais trocarCodigo(String codigo);
    void revogar(String refreshToken);

    record Credenciais(String refreshToken) {}
}
