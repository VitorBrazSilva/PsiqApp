package com.psiqapp.adapter.out.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.RepositoryAnaliseClinicaPort;
import com.psiqapp.domain.modelo.*;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdapterAnaliseClinicaJdbc implements RepositoryAnaliseClinicaPort {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    AdapterAnaliseClinicaJdbc(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    @Override
    public AnaliseClinica salvar(AnaliseClinica analise) {
        jdbc.update("""
                insert into clinical_analysis
                (id, generation_id, patient_id, generated_at, mode, validated_payload, safety_rules_version, created_at)
                values (?, ?, ?, ?, ?, ?::jsonb, ?, ?)
                """, analise.id(), analise.geracaoId(), analise.pacienteId(), Timestamp.from(analise.geradaEm()),
                analise.modo().name(), jsonb(analise), analise.versaoRegrasSeguranca(), Timestamp.from(analise.geradaEm()));
        inserirEvidencias(analise.id(), analise.pacienteId(), analise.geradaEm(), SecaoAnalise.TIMELINE, analise.timeline());
        inserirEvidencias(analise.id(), analise.pacienteId(), analise.geradaEm(), SecaoAnalise.PATTERNS, analise.patterns());
        inserirEvidencias(analise.id(), analise.pacienteId(), analise.geradaEm(), SecaoAnalise.ATTENTION_POINTS, analise.attentionPoints());
        return analise;
    }

    @Override
    public Optional<AnaliseClinica> buscarAtual(UUID pacienteId) {
        return jdbc.query("""
                select ca.id, ca.generation_id, ca.patient_id, ca.generated_at, ca.mode,
                       ca.validated_payload::text payload, ca.safety_rules_version
                  from clinical_analysis ca
                  join analysis_generation ag on ag.id = ca.generation_id
                 where ca.patient_id = ?
                 order by ag.snapshot_revision desc, ag.request_sequence desc
                 limit 1
                """, (rs, rowNum) -> lerAnalise(
                        rs.getObject("id", UUID.class),
                        rs.getObject("generation_id", UUID.class),
                        rs.getObject("patient_id", UUID.class),
                        rs.getTimestamp("generated_at").toInstant(),
                        ModoAnalise.valueOf(rs.getString("mode")),
                        rs.getString("payload"),
                        rs.getString("safety_rules_version")), pacienteId).stream().findFirst();
    }

    @Override
    public Optional<AnaliseClinica> buscarNoPaciente(UUID pacienteId, UUID analiseId) {
        return jdbc.query("""
                select id, generation_id, patient_id, generated_at, mode,
                       validated_payload::text payload, safety_rules_version
                  from clinical_analysis
                 where patient_id = ?
                   and id = ?
                """, (rs, rowNum) -> lerAnalise(
                        rs.getObject("id", UUID.class),
                        rs.getObject("generation_id", UUID.class),
                        rs.getObject("patient_id", UUID.class),
                        rs.getTimestamp("generated_at").toInstant(),
                        ModoAnalise.valueOf(rs.getString("mode")),
                        rs.getString("payload"),
                        rs.getString("safety_rules_version")), pacienteId, analiseId).stream().findFirst();
    }

    @Override
    public Pagina<GeracaoAnalise> listarGeracoes(UUID pacienteId, int pagina, int tamanho) {
        Long total = jdbc.queryForObject("select count(*) from analysis_generation where patient_id = ?",
                Long.class, pacienteId);
        var itens = jdbc.query("""
                select id, patient_id, trigger, trigger_record_id, snapshot_revision, request_sequence,
                       requested_at, state, total_records, original_records, complement_records,
                       last_clinical_record_id, mode
                  from analysis_generation
                 where patient_id = ?
                 order by snapshot_revision desc, request_sequence desc, id desc
                 limit ? offset ?
                """, (rs, rowNum) -> new GeracaoAnalise(
                        rs.getObject("id", UUID.class),
                        rs.getObject("patient_id", UUID.class),
                        GatilhoGeracaoAnalise.valueOf(rs.getString("trigger")),
                        rs.getObject("trigger_record_id", UUID.class),
                        rs.getLong("snapshot_revision"),
                        rs.getLong("request_sequence"),
                        rs.getTimestamp("requested_at").toInstant(),
                        EstadoGeracaoAnalise.valueOf(rs.getString("state")),
                        rs.getInt("total_records"),
                        rs.getInt("original_records"),
                        rs.getInt("complement_records"),
                        rs.getObject("last_clinical_record_id", UUID.class),
                        ModoAnalise.valueOf(rs.getString("mode"))),
                pacienteId, tamanho, (long) pagina * tamanho);
        return new Pagina<>(itens, pagina, tamanho, total == null ? 0 : total);
    }

    private void inserirEvidencias(UUID analiseId, UUID pacienteId, Instant criadaEm, SecaoAnalise secao,
            List<ItemAnaliseClinica> itens) {
        for (int i = 0; i < itens.size(); i++) {
            for (EvidenciaAnalise evidencia : itens.get(i).evidence()) {
                jdbc.update("""
                        insert into analysis_evidence
                        (id, analysis_id, patient_id, section, item_index, record_id, field, quote, created_at)
                        values (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, UUID.randomUUID(), analiseId, pacienteId, secao.name(), i, evidencia.registroId(),
                        evidencia.field().name(), evidencia.quote(), Timestamp.from(criadaEm));
            }
        }
    }

    private String jsonb(AnaliseClinica analise) {
        try {
            var payload = Map.of(
                    "timeline", analise.timeline(),
                    "patterns", analise.patterns(),
                    "attentionPoints", analise.attentionPoints(),
                    "limitations", analise.limitations());
            return json.writeValueAsString(payload);
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao serializar analise validada.", e);
        }
    }

    private AnaliseClinica lerAnalise(UUID id, UUID geracaoId, UUID pacienteId, Instant geradaEm, ModoAnalise modo,
            String payload, String versao) {
        try {
            var node = json.readTree(payload);
            return new AnaliseClinica(id, geracaoId, pacienteId, geradaEm, modo,
                    lerItens(node.get("timeline")), lerItens(node.get("patterns")),
                    lerItens(node.get("attentionPoints")), lerTextos(node.get("limitations")), versao);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Falha ao ler analise validada.", e);
        }
    }

    private List<ItemAnaliseClinica> lerItens(com.fasterxml.jackson.databind.JsonNode node) {
        if (node == null || !node.isArray()) return List.of();
        var itens = new ArrayList<ItemAnaliseClinica>();
        for (var item : node) {
            var evidencias = new ArrayList<EvidenciaAnalise>();
            var evidence = item.get("evidence");
            if (evidence != null && evidence.isArray()) {
                for (var ev : evidence) {
                    evidencias.add(new EvidenciaAnalise(ev.path("recordAlias").asText(null),
                            UUID.fromString(ev.path("registroId").asText()),
                            CampoEvidencia.valueOf(ev.path("field").asText()), ev.path("quote").asText()));
                }
            }
            itens.add(new ItemAnaliseClinica(item.path("text").asText(),
                    NaturezaObservacao.valueOf(item.path("nature").asText()), List.copyOf(evidencias)));
        }
        return List.copyOf(itens);
    }

    private List<String> lerTextos(com.fasterxml.jackson.databind.JsonNode node) {
        if (node == null || !node.isArray()) return List.of();
        var textos = new ArrayList<String>();
        for (var item : node) textos.add(item.asText());
        return List.copyOf(textos);
    }
}
