package com.psiqapp.adaptador.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.psiqapp.dominio.modelo.TipoRegistroClinico;

interface RepositorioRegistroClinicoJpaSpring extends JpaRepository<EntidadeRegistroClinicoJpa, UUID> {
    Optional<EntidadeRegistroClinicoJpa> findByPacienteIdAndId(UUID pacienteId, UUID id);
    Optional<EntidadeRegistroClinicoJpa> findByPacienteIdAndIdAndTipo(UUID pacienteId, UUID id, TipoRegistroClinico tipo);
}
