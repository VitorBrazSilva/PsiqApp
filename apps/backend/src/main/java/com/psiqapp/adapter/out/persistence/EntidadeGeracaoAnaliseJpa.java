package com.psiqapp.adapter.out.persistence;

import com.psiqapp.domain.modelo.EstadoGeracaoAnalise;
import com.psiqapp.domain.modelo.GatilhoGeracaoAnalise;
import com.psiqapp.domain.modelo.ModoAnalise;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "analysis_generation")
class EntidadeGeracaoAnaliseJpa {
    @Id UUID id;
    @Column(name = "patient_id", nullable = false) UUID pacienteId;
    @Enumerated(EnumType.STRING)
    @Column(name = "trigger", nullable = false) GatilhoGeracaoAnalise gatilho;
    @Column(name = "trigger_record_id") UUID registroDisparadorId;
    @Column(name = "snapshot_revision", nullable = false) long revisaoSnapshot;
    @Column(name = "request_sequence", nullable = false) long sequenciaRequest;
    @Column(name = "requested_at", nullable = false) Instant solicitadaEm;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false) EstadoGeracaoAnalise state;
    @Column(name = "total_records", nullable = false) int totalRegistros;
    @Column(name = "original_records", nullable = false) int totalOriginais;
    @Column(name = "complement_records", nullable = false) int totalComplementos;
    @Column(name = "last_clinical_record_id") UUID ultimoRegistroClinicoId;
    @Column(name = "attempt_count", nullable = false) int tentativas;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false) ModoAnalise mode;
}
