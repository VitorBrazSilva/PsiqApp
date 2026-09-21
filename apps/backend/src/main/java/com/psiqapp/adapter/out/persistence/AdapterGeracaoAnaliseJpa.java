package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.RepositoryGeracaoAnalisePort;
import com.psiqapp.domain.modelo.GeracaoAnalise;
import com.psiqapp.domain.modelo.*;
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
class AdapterGeracaoAnaliseJpa implements RepositoryGeracaoAnalisePort {
    private final RepositoryGeracaoAnaliseJpaSpring repositorio;
    private final JdbcTemplate jdbc;

    AdapterGeracaoAnaliseJpa(RepositoryGeracaoAnaliseJpaSpring repositorio, JdbcTemplate jdbc) {
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
                List.of(com.psiqapp.domain.modelo.EstadoGeracaoAnalise.ENFILEIRADA,
                        com.psiqapp.domain.modelo.EstadoGeracaoAnalise.EM_EXECUCAO,
                        com.psiqapp.domain.modelo.EstadoGeracaoAnalise.AGUARDANDO_RETENTATIVA)).map(this::paraDominio);
    }

    @Override
    public Optional<GeracaoAnalise> buscarMaisRecente(UUID pacienteId) {
        return repositorio.findFirstByPacienteIdOrderByRevisaoSnapshotDescSequenciaRequestDesc(pacienteId)
                .map(this::paraDominio);
    }

    @Override
    public Optional<GeracaoReservada> reivindicarProxima(Instant agora, Instant leaseExpiraEm, UUID leaseToken,
            int maxTentativas) {
        var linhas = jdbc.query("""
                with candidata as (
                    select id
                      from geracao_analise
                     where estado in ('ENFILEIRADA', 'AGUARDANDO_RETENTATIVA')
                       and contagem_tentativas < ?
                       and (estado = 'ENFILEIRADA' or proxima_tentativa_em <= ?)
                     order by solicitada_em asc, id asc
                     for update skip locked
                     limit 1
                ), atualizada as (
                    update geracao_analise ag
                       set estado = 'EM_EXECUCAO',
                           contagem_tentativas = contagem_tentativas + 1,
                           token_reserva = ?,
                           reserva_expira_em = ?,
                           proxima_tentativa_em = null
                      from candidata
                     where ag.id = candidata.id
                     returning ag.*, ag.contagem_tentativas as attempt_number
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
                      from geracao_analise
                     where estado = 'EM_EXECUCAO'
                       and reserva_expira_em <= ?
                       and contagem_tentativas < ?
                     order by solicitada_em asc, id asc
                     for update skip locked
                     limit 1
                ), atualizada as (
                    update geracao_analise ag
                       set contagem_tentativas = contagem_tentativas + 1,
                           token_reserva = ?,
                           reserva_expira_em = ?
                      from candidata
                     where ag.id = candidata.id
                     returning ag.*, ag.contagem_tentativas as attempt_number
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
                update geracao_analise
                   set estado = 'CONCLUIDA',
                       concluida_em = ?,
                       codigo_falha = null
                 where id = ?
                   and estado = 'EM_EXECUCAO'
                   and token_reserva = ?
                   and reserva_expira_em > ?
                """, Timestamp.from(agora), geracaoId, leaseToken, Timestamp.from(agora)) == 1;
    }

    @Override
    public boolean concluirComFalha(UUID geracaoId, UUID leaseToken, ResultadoFalha falha, Instant agora) {
        if (falha.terminal()) {
            return jdbc.update("""
                    update geracao_analise
                       set estado = 'FALHA',
                           concluida_em = ?,
                           codigo_falha = ?
                     where id = ?
                       and estado = 'EM_EXECUCAO'
                       and token_reserva = ?
                       and reserva_expira_em > ?
                    """, Timestamp.from(agora), falha.codigoFalha(), geracaoId, leaseToken,
                    Timestamp.from(agora)) == 1;
        }
        return jdbc.update("""
                update geracao_analise
                   set estado = 'AGUARDANDO_RETENTATIVA',
                       proxima_tentativa_em = ?,
                       codigo_falha = ?
                 where id = ?
                   and estado = 'EM_EXECUCAO'
                   and token_reserva = ?
                   and reserva_expira_em > ?
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
        entidade.sequenciaRequest = geracao.sequenciaRequest();
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
                entidade.registroDisparadorId, entidade.revisaoSnapshot, entidade.sequenciaRequest,
                entidade.solicitadaEm, entidade.state, entidade.totalRegistros, entidade.totalOriginais,
                entidade.totalComplementos, entidade.ultimoRegistroClinicoId, entidade.mode);
    }

    private GeracaoAnalise lerGeracao(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new GeracaoAnalise(rs.getObject("id", UUID.class), rs.getObject("paciente_id", UUID.class),
                GatilhoGeracaoAnalise.valueOf(rs.getString("gatilho")),
                rs.getObject("registro_disparador_id", UUID.class), rs.getLong("revisao_snapshot"),
                rs.getLong("sequencia_requisicao"), rs.getTimestamp("solicitada_em").toInstant(),
                EstadoGeracaoAnalise.valueOf(rs.getString("estado")), rs.getInt("total_registros"),
                rs.getInt("total_pareceres"), rs.getInt("total_complementos"),
                rs.getObject("ultimo_registro_clinico_id", UUID.class), ModoAnalise.valueOf(rs.getString("modo")));
    }
}
