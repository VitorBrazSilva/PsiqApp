package com.psiqapp.adaptador.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "idempotency_record")
class EntidadeIdempotenciaJpa {
    @Id UUID id;
    @Column(name = "scope_operation", nullable = false) String operacao;
    @Column(name = "patient_id") UUID pacienteId;
    @Column(name = "key", nullable = false) UUID chave;
    @Column(name = "payload_hash", nullable = false) byte[] hashPayload;
    @Column(name = "resource_type", nullable = false) String tipoRecurso;
    @Column(name = "resource_id", nullable = false) UUID recursoId;
    @Column(name = "original_status", nullable = false) Short statusOriginal;
    @Column(name = "created_at", nullable = false) Instant criadoEm;
}
