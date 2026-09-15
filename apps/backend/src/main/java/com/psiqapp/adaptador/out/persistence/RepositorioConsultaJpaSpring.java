package com.psiqapp.adaptador.out.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.psiqapp.dominio.modelo.StatusConsulta;
import java.time.Instant;

interface RepositorioConsultaJpaSpring extends JpaRepository<EntidadeConsultaJpa, UUID> {
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update EntidadeConsultaJpa c
            set c.status = :status, c.statusAlteradoEm = :alteradoEm
            where c.id = :id and c.status = com.psiqapp.dominio.modelo.StatusConsulta.AGENDADA
            """)
    int atualizarStatusSeAgendada(@Param("id") UUID id, @Param("status") StatusConsulta status,
            @Param("alteradoEm") Instant alteradoEm);
}
