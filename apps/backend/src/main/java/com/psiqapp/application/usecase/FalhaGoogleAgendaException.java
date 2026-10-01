package com.psiqapp.application.usecase;

/** Categoria segura de falha do provider; a resposta original nunca atravessa a fronteira da aplicação. */
public final class FalhaGoogleAgendaException extends RuntimeException {
    public enum Tipo { TRANSITORIA, AUTORIZACAO, PERMANENTE }

    private final Tipo tipo;

    public FalhaGoogleAgendaException(Tipo tipo) {
        super("Falha ao comunicar com Google Agenda.");
        this.tipo = tipo;
    }

    public Tipo tipo() { return tipo; }
}
