package com.psiqapp.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface RepositoryGeracaoAnaliseJpaSpring extends JpaRepository<EntidadeGeracaoAnaliseJpa, UUID> {
    Optional<EntidadeGeracaoAnaliseJpa> findByRegistroDisparadorId(UUID registroDisparadorId);
    Optional<EntidadeGeracaoAnaliseJpa> findByPacienteIdAndId(UUID pacienteId, UUID id);
    Optional<EntidadeGeracaoAnaliseJpa> findFirstByPacienteIdAndStateInOrderBySolicitadaEmDescIdDesc(
            UUID pacienteId, java.util.Collection<com.psiqapp.domain.modelo.EstadoGeracaoAnalise> states);
    Optional<EntidadeGeracaoAnaliseJpa> findFirstByPacienteIdOrderByRevisaoSnapshotDescSequenciaRequestDesc(
            UUID pacienteId);
}
