package com.psiqapp.domain.modelo;

public enum StatusConsulta {
    AGENDADA,
    REALIZADA,
    CANCELADA,
    FALTA;

    public boolean finalizado() {
        return this != AGENDADA;
    }
}
