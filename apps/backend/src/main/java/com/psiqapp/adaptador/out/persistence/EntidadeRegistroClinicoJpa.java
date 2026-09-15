package com.psiqapp.adaptador.out.persistence;

import com.psiqapp.dominio.modelo.TipoRegistroClinico;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "clinical_record")
class EntidadeRegistroClinicoJpa {
    @Id UUID id;
    @Column(name = "patient_id", nullable = false) UUID pacienteId;
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false) TipoRegistroClinico tipo;
    @Column(name = "original_id") UUID parecerOriginalId;
    @Column(name = "appointment_id") UUID consultaId;
    @Column(name = "clinical_datetime", nullable = false) Instant dataHoraClinica;
    @Column(name = "created_at", nullable = false) Instant criadoEm;
    @Column(nullable = false) String text;
    @Column String mood;
    @Column String medications;
    @Column(nullable = false) long revision;
}
