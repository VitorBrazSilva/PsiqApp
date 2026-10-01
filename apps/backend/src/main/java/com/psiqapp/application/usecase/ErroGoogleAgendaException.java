package com.psiqapp.application.usecase;

public class ErroGoogleAgendaException extends RuntimeException {
    private final String codigo;
    public ErroGoogleAgendaException(String codigo) { super(codigo); this.codigo = codigo; }
    public String codigo() { return codigo; }
}
