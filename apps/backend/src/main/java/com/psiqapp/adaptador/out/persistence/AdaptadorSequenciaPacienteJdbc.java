package com.psiqapp.adaptador.out.persistence;

import com.psiqapp.aplicacao.port.RepositorioSequenciaPacientePort;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdaptadorSequenciaPacienteJdbc implements RepositorioSequenciaPacientePort {
    private final JdbcTemplate jdbc;

    AdaptadorSequenciaPacienteJdbc(JdbcTemplate jdbc) {
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
                select clinical_revision, request_sequence
                  from patient
                 where id = ?
                 for update
                """, (rs, rowNum) -> new Sequencias(rs.getLong("clinical_revision") + 1,
                rs.getLong("request_sequence") + 1), pacienteId);
        if (atual.isEmpty()) return Optional.empty();
        var sequencias = atual.get(0);
        long revisao = incrementarRevisao ? sequencias.revisaoClinica() : sequencias.revisaoClinica() - 1;
        sequencias = new Sequencias(revisao, sequencias.sequenciaRequisicao());
        jdbc.update("""
                update patient
                   set clinical_revision = ?,
                       request_sequence = ?
                 where id = ?
                """, sequencias.revisaoClinica(), sequencias.sequenciaRequisicao(), pacienteId);
        return Optional.of(sequencias);
    }
}
