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
                insert into analise_clinica
                (id, geracao_id, paciente_id, gerada_em, modo, conteudo_validado, versao_regras_seguranca, criada_em)
                values (?, ?, ?, ?, ?, ?::jsonb, ?, ?)
                """, analise.id(), analise.geracaoId(), analise.pacienteId(), Timestamp.from(analise.geradaEm()),
                analise.modo().name(), jsonb(analise), analise.versaoRegrasSeguranca(), Timestamp.from(analise.geradaEm()));
        inserirEvidencias(analise.id(), analise.pacienteId(), analise.geradaEm(), SecaoAnalise.LINHA_DO_TEMPO, analise.timeline());
        inserirEvidencias(analise.id(), analise.pacienteId(), analise.geradaEm(), SecaoAnalise.PADROES, analise.patterns());
        inserirEvidencias(analise.id(), analise.pacienteId(), analise.geradaEm(), SecaoAnalise.PONTOS_DE_ATENCAO, analise.attentionPoints());
        return analise;
    }

    @Override
    public Optional<AnaliseClinica> buscarAtual(UUID pacienteId) {
        return jdbc.query("""
                select ca.id, ca.geracao_id, ca.paciente_id, ca.gerada_em, ca.modo,
                       ca.conteudo_validado::text payload, ca.versao_regras_seguranca
                  from analise_clinica ca
                  join geracao_analise ag on ag.id = ca.geracao_id
                 where ca.paciente_id = ?
                 order by ag.revisao_snapshot desc, ag.sequencia_requisicao desc
                 limit 1
                """, (rs, rowNum) -> lerAnalise(
                        rs.getObject("id", UUID.class),
                        rs.getObject("geracao_id", UUID.class),
                        rs.getObject("paciente_id", UUID.class),
                        rs.getTimestamp("gerada_em").toInstant(),
                        ModoAnalise.valueOf(rs.getString("modo")),
                        rs.getString("payload"),
                        rs.getString("versao_regras_seguranca")), pacienteId).stream().findFirst();
    }

    @Override
    public Optional<AnaliseClinica> buscarNoPaciente(UUID pacienteId, UUID analiseId) {
        return jdbc.query("""
                select id, geracao_id, paciente_id, gerada_em, modo,
                       conteudo_validado::text payload, versao_regras_seguranca
                  from analise_clinica
                 where paciente_id = ?
                   and id = ?
                """, (rs, rowNum) -> lerAnalise(
                        rs.getObject("id", UUID.class),
                        rs.getObject("geracao_id", UUID.class),
                        rs.getObject("paciente_id", UUID.class),
                        rs.getTimestamp("gerada_em").toInstant(),
                        ModoAnalise.valueOf(rs.getString("modo")),
                        rs.getString("payload"),
                        rs.getString("versao_regras_seguranca")), pacienteId, analiseId).stream().findFirst();
    }

    @Override
    public Pagina<GeracaoAnalise> listarGeracoes(UUID pacienteId, int pagina, int tamanho) {
        Long total = jdbc.queryForObject("select count(*) from geracao_analise where paciente_id = ?",
                Long.class, pacienteId);
        var itens = jdbc.query("""
                select id, paciente_id, gatilho, registro_disparador_id, revisao_snapshot, sequencia_requisicao,
                       solicitada_em, estado, total_registros, total_pareceres, total_complementos,
                       ultimo_registro_clinico_id, modo
                  from geracao_analise
                 where paciente_id = ?
                 order by revisao_snapshot desc, sequencia_requisicao desc, id desc
                 limit ? offset ?
                """, (rs, rowNum) -> new GeracaoAnalise(
                        rs.getObject("id", UUID.class),
                        rs.getObject("paciente_id", UUID.class),
                        GatilhoGeracaoAnalise.valueOf(rs.getString("gatilho")),
                        rs.getObject("registro_disparador_id", UUID.class),
                        rs.getLong("revisao_snapshot"),
                        rs.getLong("sequencia_requisicao"),
                        rs.getTimestamp("solicitada_em").toInstant(),
                        EstadoGeracaoAnalise.valueOf(rs.getString("estado")),
                        rs.getInt("total_registros"),
                        rs.getInt("total_pareceres"),
                        rs.getInt("total_complementos"),
                        rs.getObject("ultimo_registro_clinico_id", UUID.class),
                        ModoAnalise.valueOf(rs.getString("modo"))),
                pacienteId, tamanho, (long) pagina * tamanho);
        return new Pagina<>(itens, pagina, tamanho, total == null ? 0 : total);
    }

    private void inserirEvidencias(UUID analiseId, UUID pacienteId, Instant criadaEm, SecaoAnalise secao,
            List<ItemAnaliseClinica> itens) {
        for (int i = 0; i < itens.size(); i++) {
            for (EvidenciaAnalise evidencia : itens.get(i).evidence()) {
                jdbc.update("""
                        insert into evidencia_analise
                        (id, analise_id, paciente_id, secao, indice_item, registro_id, campo, citacao, criada_em)
                        values (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, UUID.randomUUID(), analiseId, pacienteId, secao.name(), i, evidencia.registroId(),
                        evidencia.field().name(), evidencia.quote(), Timestamp.from(criadaEm));
            }
        }
    }

    private String jsonb(AnaliseClinica analise) {
        try {
            var payload = Map.of(
                    "linhaDoTempo", analise.timeline(),
                    "padroes", analise.patterns(),
                    "pontosDeAtencao", analise.attentionPoints(),
                    "limitacoes", analise.limitations());
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
                    lerItens(node.get("linhaDoTempo")), lerItens(node.get("padroes")),
                    lerItens(node.get("pontosDeAtencao")), lerTextos(node.get("limitacoes")), versao);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Falha ao ler analise validada.", e);
        }
    }

    private List<ItemAnaliseClinica> lerItens(com.fasterxml.jackson.databind.JsonNode node) {
        if (node == null || !node.isArray()) return List.of();
        var itens = new ArrayList<ItemAnaliseClinica>();
        for (var item : node) {
            var evidencias = new ArrayList<EvidenciaAnalise>();
            var evidence = item.get("evidencias");
            if (evidence != null && evidence.isArray()) {
                for (var ev : evidence) {
                    evidencias.add(new EvidenciaAnalise(ev.path("apelidoRegistro").asText(null),
                            UUID.fromString(ev.path("registroId").asText()),
                            CampoEvidencia.valueOf(ev.path("campo").asText()), ev.path("citacao").asText()));
                }
            }
            itens.add(new ItemAnaliseClinica(item.path("texto").asText(),
                    NaturezaObservacao.valueOf(item.path("natureza").asText()), List.copyOf(evidencias)));
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
