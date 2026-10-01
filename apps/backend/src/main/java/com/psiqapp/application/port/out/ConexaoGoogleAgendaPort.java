package com.psiqapp.application.port.out;

import java.time.Instant;
import java.util.Optional;

public interface ConexaoGoogleAgendaPort {
    String estado();
    Optional<Conexao> obter();
    void salvar(String refreshToken, Instant conectadaEm);
    void desconectar(Instant desconectadaEm);

    record Conexao(String refreshToken, Instant conectadaEm) {}
}
