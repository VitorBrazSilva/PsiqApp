package com.psiqapp.adapter.out.persistence;

import com.psiqapp.domain.modelo.StatusConsulta;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "consulta")
class EntidadeConsultaJpa {
    @Id UUID id;
    @Column(name = "paciente_id", nullable = false) UUID pacienteId;
    @Column(name = "agendada_para", nullable = false) Instant agendadaPara;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false) StatusConsulta status;
    @Column(name = "observacoes") String observacoes;
    @Column(name = "criada_em", nullable = false) Instant criadaEm;
    @Column(name = "status_alterado_em") Instant statusAlteradoEm;
}
