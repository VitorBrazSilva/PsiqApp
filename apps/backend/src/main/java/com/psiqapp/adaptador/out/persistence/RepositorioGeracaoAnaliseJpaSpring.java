package com.psiqapp.adaptador.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface RepositorioGeracaoAnaliseJpaSpring extends JpaRepository<EntidadeGeracaoAnaliseJpa, UUID> {
    Optional<EntidadeGeracaoAnaliseJpa> findByRegistroDisparadorId(UUID registroDisparadorId);
}
