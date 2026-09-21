package com.psiqapp.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "paciente")
class EntidadePacienteJpa {
    @Id UUID id;
    @Column(name = "nome", nullable = false) String nome;
    @Column(name = "nome_busca", nullable = false) String nomeBusca;
    @Column(nullable = false) String cpf;
    @Column(name = "data_nascimento", nullable = false) LocalDate dataNascimento;
    @Column(name = "telefone", nullable = false) String telefone;
    @Column(nullable = false) String email;
    @Column(name = "queixa_inicial") String queixaInicial;
    @Column(name = "revisao_clinica", nullable = false) long revisaoClinica;
    @Column(name = "sequencia_requisicao", nullable = false) long sequenciaRequest;
    @Column(name = "criado_em", nullable = false) Instant criadoEm;
}
