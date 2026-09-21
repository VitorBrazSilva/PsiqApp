package com.psiqapp.domain.modelo;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record Paciente(
        UUID id,
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String telefone,
        String email,
        String queixaInicial,
        String nomeBusca,
        Instant criadoEm) {}
