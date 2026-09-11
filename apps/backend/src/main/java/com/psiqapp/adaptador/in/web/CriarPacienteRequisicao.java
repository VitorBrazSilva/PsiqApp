package com.psiqapp.adaptador.in.web;

import java.time.LocalDate;

public record CriarPacienteRequisicao(
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String telefone,
        String email,
        String queixaInicial) {}
