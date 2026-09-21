package com.psiqapp.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient")
class EntidadePacienteJpa {
    @Id UUID id;
    @Column(name = "name", nullable = false) String nome;
    @Column(name = "search_name", nullable = false) String nomeBusca;
    @Column(nullable = false) String cpf;
    @Column(name = "birth_date", nullable = false) LocalDate dataNascimento;
    @Column(nullable = false) String phone;
    @Column(nullable = false) String email;
    @Column(name = "initial_complaint") String queixaInicial;
    @Column(name = "clinical_revision", nullable = false) long revisaoClinica;
    @Column(name = "request_sequence", nullable = false) long sequenciaRequest;
    @Column(name = "created_at", nullable = false) Instant criadoEm;
}
