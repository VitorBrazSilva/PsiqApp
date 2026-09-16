package com.psiqapp.adaptador.out.persistence;

import com.psiqapp.aplicacao.port.RepositorioGeracaoAnalisePort;
import com.psiqapp.dominio.modelo.GeracaoAnalise;
import com.psiqapp.dominio.modelo.*;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdaptadorGeracaoAnaliseJpa implements RepositorioGeracaoAnalisePort {
    private final RepositorioGeracaoAnaliseJpaSpring repositorio;
    private final JdbcTemplate jdbc;

    AdaptadorGeracaoAnaliseJpa(RepositorioGeracaoAnaliseJpaSpring repositorio, JdbcTemplate jdbc) {
        this.repositorio = repositorio;
        this.jdbc = jdbc;
    }

    @Override
    public GeracaoAnalise salvar(GeracaoAnalise geracao) {
        return paraDominio(repositorio.saveAndFlush(paraJpa(geracao)));
    }

    @Override
    public Optional<GeracaoAnalise> buscarPorRegistroDisparador(UUID registroId) {
        return repositorio.findByRegistroDisparadorId(registroId).map(this::paraDominio);
    }

    @Override
    public Optional<GeracaoAnalise> buscarPorIdNoPaciente(UUID pacienteId, UUID geracaoId) {
        return repositorio.findByPacienteIdAndId(pacienteId, geracaoId).map(this::paraDominio);
    }

    @Override
    public Optional<GeracaoAnalise> buscarAtiva(UUID pacienteId) {
        return repositorio.findFirstByPacienteIdAndStateInOrderBySolicitadaEmDescIdDesc(pacienteId,
                List.of(com.psiqapp.dominio.modelo.EstadoGeracaoAnalise.QUEUED,
                        com.psiqapp.dominio.modelo.EstadoGeracaoAnalise.RUNNING,
                        com.psiqapp.dominio.modelo.EstadoGeracaoAnalise.RETRY_WAIT)).map(this::paraDominio);
    }

    @Override
    public Optional<GeracaoAnalise> buscarMaisRecente(UUID pacienteId) {
        return repositorio.findFirstByPacienteIdOrderByRevisaoSnapshotDescSequenciaRequisicaoDesc(pacienteId)
                .map(this::paraDominio);
    }

    @Override
    public Optional<GeracaoReservada> reivindicarProxima(Instant agora, Instant leaseExpiraEm, UUID leaseToken,
            int maxTentativas) {
        var linhas = jdbc.query("""
                with candidata as (
                    select id
                      from analysis_generation
                     where state in ('QUEUED', 'RETRY_WAIT')
                       and attempt_count < ?
                       and (state = 'QUEUED' or next_attempt_at <= ?)
                     order by requested_at asc, id asc
                     for update skip locked
                     limit 1
                ), atualizada as (
                    update analysis_generation ag
                       set state = 'RUNNING',
                           attempt_count = attempt_count + 1,
                           lease_token = ?,
                           lease_expires_at = ?,
                           next_attempt_at = null
                      from candidata
                     where ag.id = candidata.id
                     returning ag.*, ag.attempt_count as attempt_number
                )
                select * from atualizada
                """, (rs, rowNum) -> new GeracaoReservada(lerGeracao(rs), leaseToken, leaseExpiraEm,
                        rs.getInt("attempt_number")),
                maxTentativas, Timestamp.from(agora), leaseToken, Timestamp.from(leaseExpiraEm));
        if (!linhas.isEmpty()) {
            return Optional.of(linhas.getFirst());
        }
        return recuperarLeaseExpirado(agora, leaseExpiraEm, leaseToken, maxTentativas);
    }

    private Optional<GeracaoReservada> recuperarLeaseExpirado(Instant agora, Instant leaseExpiraEm, UUID leaseToken,
            int maxTentativas) {
        var linhas = jdbc.query("""
                with candidata as (
                    select id
                      from analysis_generation
                     where state = 'RUNNING'
                       and lease_expires_at <= ?
                       and attempt_count < ?
                     order by requested_at asc, id asc
                     for update skip locked
                     limit 1
                ), atualizada as (
                    update analysis_generation ag
                       set attempt_count = attempt_count + 1,
                           lease_token = ?,
                           lease_expires_at = ?
                      from candidata
                     where ag.id = candidata.id
                     returning ag.*, ag.attempt_count as attempt_number
                )
                select * from atualizada
                """, (rs, rowNum) -> new GeracaoReservada(lerGeracao(rs), leaseToken, leaseExpiraEm,
                        rs.getInt("attempt_number")),
                Timestamp.from(agora), maxTentativas, leaseToken, Timestamp.from(leaseExpiraEm));
        return linhas.stream().findFirst();
    }

    @Override
    public boolean concluirComSucesso(UUID geracaoId, UUID leaseToken, Instant agora) {
        return jdbc.update("""
                update analysis_generation
                   set state = 'COMPLETED',
                       completed_at = ?,
                       failure_code = null
                 where id = ?
                   and state = 'RUNNING'
                   and lease_token = ?
                   and lease_expires_at > ?
                """, Timestamp.from(agora), geracaoId, leaseToken, Timestamp.from(agora)) == 1;
    }

    @Override
    public boolean concluirComFalha(UUID geracaoId, UUID leaseToken, ResultadoFalha falha, Instant agora) {
        if (falha.terminal()) {
            return jdbc.update("""
                    update analysis_generation
                       set state = 'FAILED',
                           completed_at = ?,
                           failure_code = ?
                     where id = ?
                       and state = 'RUNNING'
                       and lease_token = ?
                       and lease_expires_at > ?
                    """, Timestamp.from(agora), falha.codigoFalha(), geracaoId, leaseToken,
                    Timestamp.from(agora)) == 1;
        }
        return jdbc.update("""
                update analysis_generation
                   set state = 'RETRY_WAIT',
                       next_attempt_at = ?,
                       failure_code = ?
                 where id = ?
                   and state = 'RUNNING'
                   and lease_token = ?
                   and lease_expires_at > ?
                """, Timestamp.from(falha.proximaTentativaEm()), falha.codigoFalha(), geracaoId, leaseToken,
                Timestamp.from(agora)) == 1;
    }

    private EntidadeGeracaoAnaliseJpa paraJpa(GeracaoAnalise geracao) {
        var entidade = new EntidadeGeracaoAnaliseJpa();
        entidade.id = geracao.id();
        entidade.pacienteId = geracao.pacienteId();
        entidade.gatilho = geracao.gatilho();
        entidade.registroDisparadorId = geracao.registroDisparadorId();
        entidade.revisaoSnapshot = geracao.revisaoSnapshot();
        entidade.sequenciaRequisicao = geracao.sequenciaRequisicao();
        entidade.solicitadaEm = geracao.solicitadaEm();
        entidade.state = geracao.estado();
        entidade.totalRegistros = geracao.totalRegistros();
        entidade.totalOriginais = geracao.totalOriginais();
        entidade.totalComplementos = geracao.totalComplementos();
        entidade.ultimoRegistroClinicoId = geracao.ultimoRegistroClinicoId();
        entidade.tentativas = 0;
        entidade.mode = geracao.modo();
        return entidade;
    }

    private GeracaoAnalise paraDominio(EntidadeGeracaoAnaliseJpa entidade) {
        return new GeracaoAnalise(entidade.id, entidade.pacienteId, entidade.gatilho,
                entidade.registroDisparadorId, entidade.revisaoSnapshot, entidade.sequenciaRequisicao,
                entidade.solicitadaEm, entidade.state, entidade.totalRegistros, entidade.totalOriginais,
                entidade.totalComplementos, entidade.ultimoRegistroClinicoId, entidade.mode);
    }

    private GeracaoAnalise lerGeracao(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new GeracaoAnalise(rs.getObject("id", UUID.class), rs.getObject("patient_id", UUID.class),
                GatilhoGeracaoAnalise.valueOf(rs.getString("trigger")),
                rs.getObject("trigger_record_id", UUID.class), rs.getLong("snapshot_revision"),
                rs.getLong("request_sequence"), rs.getTimestamp("requested_at").toInstant(),
                EstadoGeracaoAnalise.valueOf(rs.getString("state")), rs.getInt("total_records"),
                rs.getInt("original_records"), rs.getInt("complement_records"),
                rs.getObject("last_clinical_record_id", UUID.class), ModoAnalise.valueOf(rs.getString("mode")));
    }
}
