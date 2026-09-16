package com.psiqapp.adaptador.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface RepositorioGeracaoAnaliseJpaSpring extends JpaRepository<EntidadeGeracaoAnaliseJpa, UUID> {
    Optional<EntidadeGeracaoAnaliseJpa> findByRegistroDisparadorId(UUID registroDisparadorId);
    Optional<EntidadeGeracaoAnaliseJpa> findByPacienteIdAndId(UUID pacienteId, UUID id);
    Optional<EntidadeGeracaoAnaliseJpa> findFirstByPacienteIdAndStateInOrderBySolicitadaEmDescIdDesc(
            UUID pacienteId, java.util.Collection<com.psiqapp.dominio.modelo.EstadoGeracaoAnalise> states);
    Optional<EntidadeGeracaoAnaliseJpa> findFirstByPacienteIdOrderByRevisaoSnapshotDescSequenciaRequisicaoDesc(
            UUID pacienteId);
}
