package com.psiqapp.adaptador.out.persistence;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface RepositorioPacienteJpaSpring extends JpaRepository<EntidadePacienteJpa, UUID> {
    boolean existsByCpf(String cpf);

    @Query("""
            select p from EntidadePacienteJpa p
            where :termo = '' or p.nomeBusca like concat('%', :termo, '%') escape '\\'
            order by p.nomeBusca asc, p.id asc
            """)
    Page<EntidadePacienteJpa> buscar(@Param("termo") String termo, Pageable pageable);
}
