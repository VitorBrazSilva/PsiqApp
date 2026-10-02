package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.domain.modelo.Consulta;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.psiqapp.domain.modelo.StatusConsulta;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdapterConsultaJpa implements RepositoryConsultaPort {
    private static final long LOCK_AGENDA = 1_140_802_026L;
    private final RepositoryConsultaJpaSpring repositorio;
    private final JdbcTemplate jdbc;

    AdapterConsultaJpa(RepositoryConsultaJpaSpring repositorio, JdbcTemplate jdbc) {
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
        var filtros = new StringBuilder(" from consulta where 1=1");
        var parametros = new ArrayList<>();
        if (de != null) {
            filtros.append(" and agendada_para >= ?");
            parametros.add(de);
        }
        if (ate != null) {
            filtros.append(" and agendada_para <= ?");
            parametros.add(ate);
        }
        if (pacienteId != null) {
            filtros.append(" and paciente_id = ?");
            parametros.add(pacienteId);
        }
        Long total = jdbc.queryForObject("select count(*)" + filtros, Long.class, parametros.toArray());
        parametros.add(tamanho);
        parametros.add((long) pagina * tamanho);
        var itens = jdbc.query("""
                select id, paciente_id, agendada_para, status, observacoes, criada_em, status_alterado_em
                """ + filtros + " order by agendada_para asc, id asc limit ? offset ?",
                (rs, rowNum) -> new Consulta(
                        rs.getObject("id", UUID.class),
                        rs.getObject("paciente_id", UUID.class),
                        rs.getTimestamp("agendada_para").toInstant(),
                        com.psiqapp.domain.modelo.StatusConsulta.valueOf(rs.getString("status")),
                        rs.getString("observacoes"),
                        rs.getTimestamp("criada_em").toInstant(),
                        rs.getTimestamp("status_alterado_em") == null ? null : rs.getTimestamp("status_alterado_em").toInstant()),
                parametros.toArray());
        return new Pagina<>(itens, pagina, tamanho, total == null ? 0 : total);
    }

    @Override
    public boolean atualizarStatusSeAgendada(UUID id, StatusConsulta status, Instant alteradoEm) {
        return repositorio.atualizarStatusSeAgendada(id, status, alteradoEm) == 1;
    }

    @Override
    public void bloquearAgendaParaCriacao() {
        jdbc.execute("select pg_advisory_xact_lock(" + LOCK_AGENDA + ")");
    }

    @Override
    public boolean existeAgendadaSobreposta(Instant inicio, Instant fim) {
        Boolean conflito = jdbc.queryForObject("""
                select exists (
                    select 1 from consulta
                     where status = 'AGENDADA'
                       and agendada_para < ?
                       and agendada_para + interval '1 hour' > ?
                )
                """, Boolean.class, java.sql.Timestamp.from(fim), java.sql.Timestamp.from(inicio));
        return Boolean.TRUE.equals(conflito);
    }

    @Override
    public java.util.List<Instant> listarIniciosAgendadosSobrepostos(Instant inicio, Instant fim) {
        return jdbc.query("""
                select agendada_para from consulta
                 where status = 'AGENDADA'
                   and agendada_para < ?
                   and agendada_para + interval '1 hour' > ?
                 order by agendada_para
                """, (rs, rowNum) -> rs.getTimestamp("agendada_para").toInstant(),
                java.sql.Timestamp.from(fim), java.sql.Timestamp.from(inicio));
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
