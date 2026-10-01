package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import com.psiqapp.domain.modelo.StatusConsulta;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdapterSincronizacaoConsultaJpa implements RepositorySincronizacaoConsultaPort {
    private final JdbcTemplate jdbc;

    AdapterSincronizacaoConsultaJpa(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void criar(UUID consultaId, String idEvento, Estado estado, Instant agora) {
        jdbc.update("""
                insert into sincronizacao_consulta_google
                    (consulta_id, google_event_id, estado, tentativas, proxima_tentativa, atualizada_em)
                values (?, ?, ?, 0, ?, ?)
                """, consultaId, idEvento, estado.name(), java.sql.Timestamp.from(agora), java.sql.Timestamp.from(agora));
    }

    @Override
    public boolean solicitar(UUID consultaId, Estado estado, Instant agora) {
        return jdbc.update("""
                update sincronizacao_consulta_google
                   set estado = ?, tentativas = 0, proxima_tentativa = ?, ultimo_erro = null,
                       versao = versao + 1, atualizada_em = ?
                 where consulta_id = ?
                """, estado.name(), java.sql.Timestamp.from(agora), java.sql.Timestamp.from(agora), consultaId) == 1;
    }

    @Override
    public Optional<Situacao> buscar(UUID consultaId) {
        return jdbc.query("""
                select estado, ultima_tentativa
                  from sincronizacao_consulta_google
                 where consulta_id = ?
                """, rs -> rs.next() ? Optional.of(new Situacao(Estado.valueOf(rs.getString("estado")),
                instante(rs, "ultima_tentativa"))) : Optional.empty(), consultaId);
    }

    @Override
    public Map<UUID, Situacao> listar(List<UUID> consultaIds) {
        if (consultaIds.isEmpty()) return Map.of();
        String parametros = consultaIds.stream().map(ignorado -> "?").collect(Collectors.joining(", "));
        return jdbc.query("""
                select consulta_id, estado, ultima_tentativa
                  from sincronizacao_consulta_google
                 where consulta_id in (""" + parametros + ")", rs -> {
            var situacoes = new HashMap<UUID, Situacao>();
            while (rs.next()) {
                situacoes.put(rs.getObject("consulta_id", UUID.class), new Situacao(
                        Estado.valueOf(rs.getString("estado")), instante(rs, "ultima_tentativa")));
            }
            return situacoes;
        }, consultaIds.toArray());
    }

    @Override
    @Transactional
    public List<Trabalho> reivindicarVencidas(Instant agora, Instant expiraEm, int limite) {
        return jdbc.query("""
                with candidatas as (
                    select s.consulta_id
                      from sincronizacao_consulta_google s
                     where s.estado in ('PENDENTE', 'AGUARDANDO_CONEXAO')
                       and s.proxima_tentativa <= ?
                     order by s.proxima_tentativa, s.consulta_id
                     limit ?
                     for update of s skip locked
                )
                update sincronizacao_consulta_google s
                   set estado = 'PENDENTE',
                       tentativas = s.tentativas + 1,
                       proxima_tentativa = ?,
                       ultima_tentativa = ?,
                       atualizada_em = ?
                  from candidatas, consulta c, paciente p
                 where s.consulta_id = candidatas.consulta_id
                   and c.id = s.consulta_id
                   and p.id = c.paciente_id
                returning s.consulta_id, s.google_event_id, s.estado, s.tentativas, s.versao,
                          c.agendada_para, c.status, p.nome as nome_paciente, p.email as email_paciente
                """, this::paraTrabalho, java.sql.Timestamp.from(agora), limite,
                java.sql.Timestamp.from(expiraEm), java.sql.Timestamp.from(agora), java.sql.Timestamp.from(agora));
    }

    @Override
    public boolean concluir(UUID consultaId, int versao, Instant agora) {
        return atualizarResultado(consultaId, versao, "SINCRONIZADA", null, agora, agora) == 1;
    }

    @Override
    public boolean aguardarConexao(UUID consultaId, int versao, Instant agora) {
        return atualizarResultado(consultaId, versao, "AGUARDANDO_CONEXAO", null, agora, agora) == 1;
    }

    @Override
    public boolean reagendar(UUID consultaId, int versao, String categoriaErro, Instant proximaTentativa, Instant agora) {
        return atualizarResultado(consultaId, versao, "PENDENTE", categoriaErro, proximaTentativa, agora) == 1;
    }

    @Override
    public boolean falhar(UUID consultaId, int versao, String categoriaErro, Instant agora) {
        return atualizarResultado(consultaId, versao, "FALHA", categoriaErro, agora, agora) == 1;
    }

    @Override
    public boolean tentarNovamente(UUID consultaId, Estado estado, Instant agora) {
        return jdbc.update("""
                update sincronizacao_consulta_google
                   set estado = ?, tentativas = 0, proxima_tentativa = ?, ultimo_erro = null,
                       versao = versao + 1, atualizada_em = ?
                 where consulta_id = ?
                """, estado.name(), java.sql.Timestamp.from(agora), java.sql.Timestamp.from(agora), consultaId) == 1;
    }

    private int atualizarResultado(UUID consultaId, int versao, String estado, String categoriaErro,
            Instant proximaTentativa, Instant agora) {
        return jdbc.update("""
                update sincronizacao_consulta_google
                   set estado = ?, ultimo_erro = ?, proxima_tentativa = ?, atualizada_em = ?
                 where consulta_id = ? and versao = ? and estado = 'PENDENTE'
                """, estado, categoriaErro, java.sql.Timestamp.from(proximaTentativa),
                java.sql.Timestamp.from(agora), consultaId, versao);
    }

    private Trabalho paraTrabalho(ResultSet rs, int linha) throws SQLException {
        return new Trabalho(rs.getObject("consulta_id", UUID.class), rs.getString("google_event_id"),
                Estado.valueOf(rs.getString("estado")), rs.getInt("tentativas"), rs.getInt("versao"),
                rs.getTimestamp("agendada_para").toInstant(), StatusConsulta.valueOf(rs.getString("status")),
                rs.getString("nome_paciente"), rs.getString("email_paciente"));
    }

    private static Instant instante(ResultSet rs, String coluna) throws SQLException {
        var timestamp = rs.getTimestamp(coluna);
        return timestamp == null ? null : timestamp.toInstant();
    }
}
