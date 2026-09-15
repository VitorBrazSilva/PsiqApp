package com.psiqapp.adaptador.out.persistence;

import com.psiqapp.aplicacao.port.Pagina;
import com.psiqapp.aplicacao.port.RepositorioConsultaPort;
import com.psiqapp.dominio.modelo.Consulta;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.psiqapp.dominio.modelo.StatusConsulta;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdaptadorConsultaJpa implements RepositorioConsultaPort {
    private final RepositorioConsultaJpaSpring repositorio;
    private final JdbcTemplate jdbc;

    AdaptadorConsultaJpa(RepositorioConsultaJpaSpring repositorio, JdbcTemplate jdbc) {
        this.repositorio = repositorio;
        this.jdbc = jdbc;
    }

    @Override
    public Consulta salvar(Consulta consulta) {
        return paraDominio(repositorio.saveAndFlush(paraJpa(consulta)));
    }

    @Override
    public Optional<Consulta> buscarPorId(UUID id) {
        return repositorio.findById(id).map(this::paraDominio);
    }

    @Override
    public Optional<UUID> pacienteDaConsulta(UUID consultaId) {
        return repositorio.findById(consultaId).map(entidade -> entidade.pacienteId);
    }

    @Override
    public Pagina<Consulta> listar(Instant de, Instant ate, UUID pacienteId, int pagina, int tamanho) {
        var filtros = new StringBuilder(" from appointment where 1=1");
        var parametros = new ArrayList<>();
        if (de != null) {
            filtros.append(" and scheduled_at >= ?");
            parametros.add(de);
        }
        if (ate != null) {
            filtros.append(" and scheduled_at <= ?");
            parametros.add(ate);
        }
        if (pacienteId != null) {
            filtros.append(" and patient_id = ?");
            parametros.add(pacienteId);
        }
        Long total = jdbc.queryForObject("select count(*)" + filtros, Long.class, parametros.toArray());
        parametros.add(tamanho);
        parametros.add((long) pagina * tamanho);
        var itens = jdbc.query("""
                select id, patient_id, scheduled_at, status, notes, created_at, status_changed_at
                """ + filtros + " order by scheduled_at asc, id asc limit ? offset ?",
                (rs, rowNum) -> new Consulta(
                        rs.getObject("id", UUID.class),
                        rs.getObject("patient_id", UUID.class),
                        rs.getTimestamp("scheduled_at").toInstant(),
                        com.psiqapp.dominio.modelo.StatusConsulta.valueOf(rs.getString("status")),
                        rs.getString("notes"),
                        rs.getTimestamp("created_at").toInstant(),
                        rs.getTimestamp("status_changed_at") == null ? null : rs.getTimestamp("status_changed_at").toInstant()),
                parametros.toArray());
        return new Pagina<>(itens, pagina, tamanho, total == null ? 0 : total);
    }

    @Override
    public boolean atualizarStatusSeAgendada(UUID id, StatusConsulta status, Instant alteradoEm) {
        return repositorio.atualizarStatusSeAgendada(id, status, alteradoEm) == 1;
    }

    private EntidadeConsultaJpa paraJpa(Consulta consulta) {
        var entidade = new EntidadeConsultaJpa();
        entidade.id = consulta.id();
        entidade.pacienteId = consulta.pacienteId();
        entidade.agendadaPara = consulta.agendadaPara();
        entidade.status = consulta.status();
        entidade.observacoes = consulta.observacoes();
        entidade.criadaEm = consulta.criadaEm();
        entidade.statusAlteradoEm = consulta.statusAlteradoEm();
        return entidade;
    }

    private Consulta paraDominio(EntidadeConsultaJpa entidade) {
        return new Consulta(entidade.id, entidade.pacienteId, entidade.agendadaPara, entidade.status,
                entidade.observacoes, entidade.criadaEm, entidade.statusAlteradoEm);
    }
}
