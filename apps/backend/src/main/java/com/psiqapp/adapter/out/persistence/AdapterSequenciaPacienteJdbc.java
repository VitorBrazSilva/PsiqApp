package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.RepositorySequenciaPacientePort;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdapterSequenciaPacienteJdbc implements RepositorySequenciaPacientePort {
    private final JdbcTemplate jdbc;

    AdapterSequenciaPacienteJdbc(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Optional<Sequencias> reservarParaNovoRegistroClinico(UUID pacienteId) {
        return reservar(pacienteId, true);
    }

    @Override
    public Optional<Sequencias> reservarParaRegeneracao(UUID pacienteId) {
        return reservar(pacienteId, false);
    }

    private Optional<Sequencias> reservar(UUID pacienteId, boolean incrementarRevisao) {
        var atual = jdbc.query("""
                select revisao_clinica, sequencia_requisicao
                  from paciente
                 where id = ?
                 for update
                """, (rs, rowNum) -> new Sequencias(rs.getLong("revisao_clinica") + 1,
                rs.getLong("sequencia_requisicao") + 1), pacienteId);
        if (atual.isEmpty()) return Optional.empty();
        var sequencias = atual.get(0);
        long revisao = incrementarRevisao ? sequencias.revisaoClinica() : sequencias.revisaoClinica() - 1;
        sequencias = new Sequencias(revisao, sequencias.sequenciaRequest());
        jdbc.update("""
                update paciente
                   set revisao_clinica = ?,
                       sequencia_requisicao = ?
                 where id = ?
                """, sequencias.revisaoClinica(), sequencias.sequenciaRequest(), pacienteId);
        return Optional.of(sequencias);
    }
}
