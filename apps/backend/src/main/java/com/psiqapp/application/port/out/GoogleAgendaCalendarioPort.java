package com.psiqapp.application.port.out;

import com.psiqapp.domain.modelo.StatusConsulta;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Contrato mínimo para consultar ocupação e manter eventos próprios no calendário principal. */
public interface GoogleAgendaCalendarioPort {
    List<Intervalo> consultarOcupacao(String refreshToken, Instant inicio, Instant fim);
    Optional<String> consultaAssociada(String refreshToken, String idEvento);
    void criarEvento(String refreshToken, String idEvento, EventoConsulta evento);
    void atualizarEvento(String refreshToken, String idEvento, EventoConsulta evento);
    void removerEvento(String refreshToken, String idEvento);

    record Intervalo(Instant inicio, Instant fim) {}

    record EventoConsulta(UUID consultaId, String nomePaciente, String emailPaciente,
            Instant inicio, Instant fim, StatusConsulta status) {}
}
