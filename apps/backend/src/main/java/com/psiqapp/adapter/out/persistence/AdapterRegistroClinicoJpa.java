package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.RepositoryRegistroClinicoPort;
import com.psiqapp.domain.modelo.RegistroClinico;
import com.psiqapp.domain.modelo.TipoRegistroClinico;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdapterRegistroClinicoJpa implements RepositoryRegistroClinicoPort {
    private final RepositoryRegistroClinicoJpaSpring repositorio;
    private final JdbcTemplate jdbc;

    AdapterRegistroClinicoJpa(RepositoryRegistroClinicoJpaSpring repositorio, JdbcTemplate jdbc) {
        this.repositorio = repositorio;
        this.jdbc = jdbc;
    }

    @Override
    public RegistroClinico salvar(RegistroClinico registro) {
        return paraDominio(repositorio.saveAndFlush(paraJpa(registro)));
    }

    @Override
    public Optional<RegistroClinico> buscarNoPaciente(UUID pacienteId, UUID registroId) {
        return repositorio.findByPacienteIdAndId(pacienteId, registroId).map(this::paraDominio);
    }

    @Override
    public Optional<RegistroClinico> buscarOriginalNoPaciente(UUID pacienteId, UUID registroId) {
        return repositorio.findByPacienteIdAndIdAndTipo(pacienteId, registroId, TipoRegistroClinico.PARECER)
                .map(this::paraDominio);
    }

    @Override
    public Pagina<RegistroClinico> listarLinhaDoTempo(UUID pacienteId, int pagina, int tamanho) {
        Long total = jdbc.queryForObject("select count(*) from registro_clinico where paciente_id = ?",
                Long.class, pacienteId);
        var itens = jdbc.query("""
                select id, paciente_id, tipo, parecer_original_id, consulta_id, data_hora_clinica, criado_em,
                       texto, humor, medicamentos, revision
                  from registro_clinico
                 where paciente_id = ?
                 order by data_hora_clinica desc, criado_em desc, id desc
                 limit ? offset ?
                """, (rs, rowNum) -> new RegistroClinico(
                        rs.getObject("id", UUID.class),
                        rs.getObject("paciente_id", UUID.class),
                        TipoRegistroClinico.valueOf(rs.getString("tipo")),
                        rs.getObject("parecer_original_id", UUID.class),
                        rs.getObject("consulta_id", UUID.class),
                        rs.getTimestamp("data_hora_clinica").toInstant(),
                        rs.getTimestamp("criado_em").toInstant(),
                        rs.getString("texto"),
                        rs.getString("humor"),
                        rs.getString("medicamentos"),
                        rs.getLong("revision")),
                pacienteId, tamanho, (long) pagina * tamanho);
        return new Pagina<>(itens, pagina, tamanho, total == null ? 0 : total);
    }

    @Override
    public EstatisticasSnapshot estatisticasDoPaciente(UUID pacienteId) {
        return estatisticas(pacienteId, null);
    }

    @Override
    public EstatisticasSnapshot estatisticasDoPacienteAteRevisao(UUID pacienteId, long revisao) {
        return estatisticas(pacienteId, revisao);
    }

    @Override
    public List<RegistroClinico> listarSnapshot(UUID pacienteId, long revisaoSnapshot) {
        return jdbc.query("""
                select id, paciente_id, tipo, parecer_original_id, consulta_id, data_hora_clinica, criado_em,
                       texto, humor, medicamentos, revision
                  from registro_clinico
                 where paciente_id = ?
                   and revision <= ?
                 order by data_hora_clinica asc, criado_em asc, id asc
                """, (rs, rowNum) -> new RegistroClinico(
                        rs.getObject("id", UUID.class),
                        rs.getObject("paciente_id", UUID.class),
                        TipoRegistroClinico.valueOf(rs.getString("tipo")),
                        rs.getObject("parecer_original_id", UUID.class),
                        rs.getObject("consulta_id", UUID.class),
                        rs.getTimestamp("data_hora_clinica").toInstant(),
                        rs.getTimestamp("criado_em").toInstant(),
                        rs.getString("texto"),
                        rs.getString("humor"),
                        rs.getString("medicamentos"),
                        rs.getLong("revision")),
                pacienteId, revisaoSnapshot);
    }

    private EstatisticasSnapshot estatisticas(UUID pacienteId, Long revisao) {
        String filtroRevisao = revisao == null ? "" : " and revision <= ?";
        Object[] parametros = revisao == null ? new Object[] { pacienteId } : new Object[] { pacienteId, revisao };
        var contagens = jdbc.queryForObject("""
                select count(*) total,
                       count(*) filter (where tipo = 'PARECER') originals,
                       count(*) filter (where tipo = 'COMPLEMENTO') complements
                  from registro_clinico
                 where paciente_id = ?""" + filtroRevisao + """
                """, (rs, rowNum) -> new int[] {
                        rs.getInt("total"), rs.getInt("originals"), rs.getInt("complements")
                }, parametros);
        UUID ultimo = jdbc.query("""
                select id
                  from registro_clinico
                 where paciente_id = ?""" + filtroRevisao + """
                 order by data_hora_clinica desc, criado_em desc, id desc
                 limit 1
                """, (rs, rowNum) -> rs.getObject("id", UUID.class), parametros)
                .stream().findFirst().orElse(null);
        return new EstatisticasSnapshot(contagens[0], contagens[1], contagens[2], ultimo);
    }

    private EntidadeRegistroClinicoJpa paraJpa(RegistroClinico registro) {
        var entidade = new EntidadeRegistroClinicoJpa();
        entidade.id = registro.id();
        entidade.pacienteId = registro.pacienteId();
        entidade.tipo = registro.tipo();
        entidade.parecerOriginalId = registro.parecerOriginalId();
        entidade.consultaId = registro.consultaId();
        entidade.dataHoraClinica = registro.dataHoraClinica();
        entidade.criadoEm = registro.criadoEm();
        entidade.text = registro.texto();
        entidade.mood = registro.humor();
        entidade.medications = registro.medicamentos();
        entidade.revision = registro.revisao();
        return entidade;
    }

    private RegistroClinico paraDominio(EntidadeRegistroClinicoJpa entidade) {
        return new RegistroClinico(entidade.id, entidade.pacienteId, entidade.tipo, entidade.parecerOriginalId,
                entidade.consultaId, entidade.dataHoraClinica, entidade.criadoEm, entidade.text,
                entidade.mood, entidade.medications, entidade.revision);
    }
}
