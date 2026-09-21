package com.psiqapp.adapter.in.web;

import java.time.LocalDate;

public record CriarPacienteRequest(
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String telefone,
        String email,
        String queixaInicial) {}
