package com.psiqapp.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.psiqapp.domain.modelo.TipoRegistroClinico;

interface RepositoryRegistroClinicoJpaSpring extends JpaRepository<EntidadeRegistroClinicoJpa, UUID> {
    Optional<EntidadeRegistroClinicoJpa> findByPacienteIdAndId(UUID pacienteId, UUID id);
    Optional<EntidadeRegistroClinicoJpa> findByPacienteIdAndIdAndTipo(UUID pacienteId, UUID id, TipoRegistroClinico tipo);
}
