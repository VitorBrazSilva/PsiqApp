package com.psiqapp.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "idempotencia")
class EntidadeIdempotenciaJpa {
    @Id UUID id;
    @Column(name = "operacao_escopo", nullable = false) String operacao;
    @Column(name = "paciente_id") UUID pacienteId;
    @Column(name = "key", nullable = false) UUID chave;
    @Column(name = "hash_payload", nullable = false) byte[] hashPayload;
    @Column(name = "tipo_recurso", nullable = false) String tipoRecurso;
    @Column(name = "recurso_id", nullable = false) UUID recursoId;
    @Column(name = "status_original", nullable = false) Short statusOriginal;
    @Column(name = "criada_em", nullable = false) Instant criadoEm;
}
