package com.psiqapp.adapter.out.persistence;

import com.psiqapp.domain.modelo.TipoRegistroClinico;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "registro_clinico")
class EntidadeRegistroClinicoJpa {
    @Id UUID id;
    @Column(name = "paciente_id", nullable = false) UUID pacienteId;
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false) TipoRegistroClinico tipo;
    @Column(name = "parecer_original_id") UUID parecerOriginalId;
    @Column(name = "consulta_id") UUID consultaId;
    @Column(name = "data_hora_clinica", nullable = false) Instant dataHoraClinica;
    @Column(name = "criado_em", nullable = false) Instant criadoEm;
    @Column(name = "texto", nullable = false) String text;
    @Column(name = "humor") String mood;
    @Column(name = "medicamentos") String medications;
    @Column(nullable = false) long revision;
}
