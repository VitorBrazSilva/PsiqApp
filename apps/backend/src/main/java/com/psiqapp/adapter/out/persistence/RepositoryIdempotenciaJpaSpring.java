package com.psiqapp.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface RepositoryIdempotenciaJpaSpring extends JpaRepository<EntidadeIdempotenciaJpa, UUID> {
    @Query("""
            select i from EntidadeIdempotenciaJpa i
            where i.operacao = :operacao
              and ((:pacienteId is null and i.pacienteId is null) or i.pacienteId = :pacienteId)
              and i.chave = :chave
            """)
    Optional<EntidadeIdempotenciaJpa> buscar(@Param("operacao") String operacao,
            @Param("pacienteId") UUID pacienteId, @Param("chave") UUID chave);
}
