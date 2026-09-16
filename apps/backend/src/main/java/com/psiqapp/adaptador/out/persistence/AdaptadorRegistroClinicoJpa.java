package com.psiqapp.adaptador.out.persistence;

import com.psiqapp.aplicacao.port.Pagina;
import com.psiqapp.aplicacao.port.RepositorioRegistroClinicoPort;
import com.psiqapp.dominio.modelo.RegistroClinico;
import com.psiqapp.dominio.modelo.TipoRegistroClinico;
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
class AdaptadorRegistroClinicoJpa implements RepositorioRegistroClinicoPort {
    private final RepositorioRegistroClinicoJpaSpring repositorio;
    private final JdbcTemplate jdbc;

    AdaptadorRegistroClinicoJpa(RepositorioRegistroClinicoJpaSpring repositorio, JdbcTemplate jdbc) {
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
        return repositorio.findByPacienteIdAndIdAndTipo(pacienteId, registroId, TipoRegistroClinico.ORIGINAL)
                .map(this::paraDominio);
    }

    @Override
    public Pagina<RegistroClinico> listarLinhaDoTempo(UUID pacienteId, int pagina, int tamanho) {
        Long total = jdbc.queryForObject("select count(*) from clinical_record where patient_id = ?",
                Long.class, pacienteId);
        var itens = jdbc.query("""
                select id, patient_id, type, original_id, appointment_id, clinical_datetime, created_at,
                       text, mood, medications, revision
                  from clinical_record
                 where patient_id = ?
                 order by clinical_datetime desc, created_at desc, id desc
                 limit ? offset ?
                """, (rs, rowNum) -> new RegistroClinico(
                        rs.getObject("id", UUID.class),
                        rs.getObject("patient_id", UUID.class),
                        TipoRegistroClinico.valueOf(rs.getString("type")),
                        rs.getObject("original_id", UUID.class),
                        rs.getObject("appointment_id", UUID.class),
                        rs.getTimestamp("clinical_datetime").toInstant(),
                        rs.getTimestamp("created_at").toInstant(),
                        rs.getString("text"),
                        rs.getString("mood"),
                        rs.getString("medications"),
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
                select id, patient_id, type, original_id, appointment_id, clinical_datetime, created_at,
                       text, mood, medications, revision
                  from clinical_record
                 where patient_id = ?
                   and revision <= ?
                 order by clinical_datetime asc, created_at asc, id asc
                """, (rs, rowNum) -> new RegistroClinico(
                        rs.getObject("id", UUID.class),
                        rs.getObject("patient_id", UUID.class),
                        TipoRegistroClinico.valueOf(rs.getString("type")),
                        rs.getObject("original_id", UUID.class),
                        rs.getObject("appointment_id", UUID.class),
                        rs.getTimestamp("clinical_datetime").toInstant(),
                        rs.getTimestamp("created_at").toInstant(),
                        rs.getString("text"),
                        rs.getString("mood"),
                        rs.getString("medications"),
                        rs.getLong("revision")),
                pacienteId, revisaoSnapshot);
    }

    private EstatisticasSnapshot estatisticas(UUID pacienteId, Long revisao) {
        String filtroRevisao = revisao == null ? "" : " and revision <= ?";
        Object[] parametros = revisao == null ? new Object[] { pacienteId } : new Object[] { pacienteId, revisao };
        var contagens = jdbc.queryForObject("""
                select count(*) total,
                       count(*) filter (where type = 'ORIGINAL') originals,
                       count(*) filter (where type = 'COMPLEMENT') complements
                  from clinical_record
                 where patient_id = ?""" + filtroRevisao + """
                """, (rs, rowNum) -> new int[] {
                        rs.getInt("total"), rs.getInt("originals"), rs.getInt("complements")
                }, parametros);
        UUID ultimo = jdbc.query("""
                select id
                  from clinical_record
                 where patient_id = ?""" + filtroRevisao + """
                 order by clinical_datetime desc, created_at desc, id desc
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
