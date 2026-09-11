package com.psiqapp.adaptador.in.web;

import com.psiqapp.dominio.modelo.Paciente;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PacienteResposta(
        UUID id,
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String telefone,
        String email,
        String queixaInicial,
        Instant criadoEm) {
    static PacienteResposta de(Paciente paciente) {
        return new PacienteResposta(paciente.id(), paciente.nome(), paciente.cpf(), paciente.dataNascimento(),
                paciente.telefone(), paciente.email(), paciente.queixaInicial(), paciente.criadoEm());
    }
}
