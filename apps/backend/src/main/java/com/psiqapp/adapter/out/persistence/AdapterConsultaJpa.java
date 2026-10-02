package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.application.port.out.GrupoAgendaConsulta;
import com.psiqapp.application.port.out.PaginaAgendaConsultas;
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
    public PaginaAgendaConsultas listarAgenda(GrupoAgendaConsulta grupo, UUID pacienteId, Instant de, Instant ate,
            Instant referenciaEm, int pagina, int tamanho) {
        String ordenacao = grupo == GrupoAgendaConsulta.PROXIMAS
                ? " order by agendada_para asc, id asc" : " order by agendada_para desc, id desc";
        String consultaSql = """
                with universo as (
                    select id, paciente_id, agendada_para, status, observacoes, criada_em, status_alterado_em
                      from consulta
                     where (?::uuid is null or paciente_id = ?)
                       and (?::timestamptz is null or agendada_para >= ?)
                       and (?::timestamptz is null or agendada_para < ?)
                ), contagens as (
                    select
                      count(*) filter (where status = 'AGENDADA' and agendada_para >= ?) proximas,
                      count(*) filter (where status = 'AGENDADA' and agendada_para < ?) anteriores,
                      count(*) filter (where status = 'REALIZADA') realizadas,
                      count(*) filter (where status = 'CANCELADA') canceladas,
                      count(*) filter (where status = 'FALTA') faltas
                    from universo
                ), itens as (
                    select * from universo
                     where ((? = 'PROXIMAS' and status = 'AGENDADA' and agendada_para >= ?)
                         or (? = 'AGENDADAS_ANTERIORES' and status = 'AGENDADA' and agendada_para < ?)
                         or (? = 'REALIZADAS' and status = 'REALIZADA')
                         or (? = 'CANCELADAS' and status = 'CANCELADA')
                         or (? = 'FALTAS' and status = 'FALTA'))
                )
                select c.*, coalesce((select count(*) from itens), 0) total_grupo,
                       contagens.proximas, contagens.anteriores, contagens.realizadas,
                       contagens.canceladas, contagens.faltas
                  from contagens left join lateral (
                    select * from itens
                """ + ordenacao + " limit ? offset ?) c on true";
        var ts = java.sql.Timestamp.from(referenciaEm);
        var parametros = new Object[] { pacienteId, pacienteId,
                de == null ? null : java.sql.Timestamp.from(de), de == null ? null : java.sql.Timestamp.from(de),
                ate == null ? null : java.sql.Timestamp.from(ate), ate == null ? null : java.sql.Timestamp.from(ate),
                ts, ts, grupo.name(), ts, grupo.name(), ts, grupo.name(), grupo.name(), grupo.name(),
                tamanho, (long) pagina * tamanho };
        var linhas = jdbc.query(consultaSql, (rs, rowNum) -> new Object[] {
                rs.getObject("id", UUID.class), rs.getObject("paciente_id", UUID.class),
                rs.getTimestamp("agendada_para") == null ? null : rs.getTimestamp("agendada_para").toInstant(),
                rs.getString("status"), rs.getString("observacoes"),
                rs.getTimestamp("criada_em") == null ? null : rs.getTimestamp("criada_em").toInstant(),
                rs.getTimestamp("status_alterado_em") == null ? null : rs.getTimestamp("status_alterado_em").toInstant(),
                rs.getLong("total_grupo"), rs.getLong("proximas"), rs.getLong("anteriores"),
                rs.getLong("realizadas"), rs.getLong("canceladas"), rs.getLong("faltas") }, parametros);
        var itensConsulta = linhas.stream().filter(linha -> linha[0] != null).map(linha -> new Consulta(
                (UUID) linha[0], (UUID) linha[1], (Instant) linha[2], StatusConsulta.valueOf((String) linha[3]),
                (String) linha[4], (Instant) linha[5], (Instant) linha[6])).toList();
        var contagens = new java.util.EnumMap<GrupoAgendaConsulta, Long>(GrupoAgendaConsulta.class);
        if (linhas.isEmpty()) {
            for (var grupoContagem : GrupoAgendaConsulta.values()) contagens.put(grupoContagem, 0L);
            return new PaginaAgendaConsultas(new Pagina<>(itensConsulta, pagina, tamanho, 0), contagens);
        }
        Object[] linha = linhas.getFirst();
        long total = ((Number) linha[7]).longValue();
        contagens.put(GrupoAgendaConsulta.PROXIMAS, ((Number) linha[8]).longValue());
        contagens.put(GrupoAgendaConsulta.AGENDADAS_ANTERIORES, ((Number) linha[9]).longValue());
        contagens.put(GrupoAgendaConsulta.REALIZADAS, ((Number) linha[10]).longValue());
        contagens.put(GrupoAgendaConsulta.CANCELADAS, ((Number) linha[11]).longValue());
        contagens.put(GrupoAgendaConsulta.FALTAS, ((Number) linha[12]).longValue());
        return new PaginaAgendaConsultas(new Pagina<>(itensConsulta, pagina, tamanho, total), contagens);
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
