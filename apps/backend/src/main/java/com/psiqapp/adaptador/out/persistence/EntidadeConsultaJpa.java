package com.psiqapp.adaptador.out.persistence;

import com.psiqapp.dominio.modelo.StatusConsulta;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "appointment")
class EntidadeConsultaJpa {
    @Id UUID id;
    @Column(name = "patient_id", nullable = false) UUID pacienteId;
    @Column(name = "scheduled_at", nullable = false) Instant agendadaPara;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false) StatusConsulta status;
    @Column(name = "notes") String observacoes;
    @Column(name = "created_at", nullable = false) Instant criadaEm;
    @Column(name = "status_changed_at") Instant statusAlteradoEm;
}
