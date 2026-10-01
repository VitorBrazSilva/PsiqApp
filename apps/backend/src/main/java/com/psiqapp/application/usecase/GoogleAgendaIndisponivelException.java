package com.psiqapp.application.usecase;

/** Erro sanitizado usado quando uma conexão ativa não permite validar disponibilidade. */
public final class GoogleAgendaIndisponivelException extends RuntimeException {
    public GoogleAgendaIndisponivelException() {
        super("Não foi possível verificar a agenda Google.");
    }
}
