package com.psiqapp.adapter.in.web;

import com.psiqapp.domain.modelo.Paciente;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PacienteResponse(
        UUID id,
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String telefone,
        String email,
        String queixaInicial,
        Instant criadoEm) {
    static PacienteResponse de(Paciente paciente) {
        return new PacienteResponse(paciente.id(), paciente.nome(), mascararCpf(paciente.cpf()), paciente.dataNascimento(),
                paciente.telefone(), paciente.email(), paciente.queixaInicial(), paciente.criadoEm());
    }

    private static String mascararCpf(String cpf) {
        if (cpf == null || cpf.length() < 2) {
            return null;
        }
        return "***.***.***-" + cpf.substring(cpf.length() - 2);
    }
}
