package com.psiqapp.aplicacao.servico;

import com.psiqapp.aplicacao.port.SnapshotAnalise;
import com.psiqapp.dominio.modelo.*;
import com.psiqapp.dominio.validacao.ErroDeValidacao;
import com.psiqapp.dominio.validacao.ValidacaoException;
import java.util.*;
import java.util.regex.Pattern;

public class ValidadorRespostaAnalise {
    public static final String LIMITACAO_SUMMARY_ONLY =
            "Histórico insuficiente para avaliar evolução ou tendência longitudinal.";
    private final CatalogoSegurancaClinica catalogo;

    public ValidadorRespostaAnalise(CatalogoSegurancaClinica catalogo) {
        this.catalogo = catalogo;
    }

    public AnaliseClinica validar(UUID analiseId, UUID geracaoId, UUID pacienteId, ModoAnalise modo,
            java.time.Instant geradaEm, Resposta resposta, SnapshotAnalise snapshot) {
        Objects.requireNonNull(resposta, "resposta");
        var timeline = validarItens(resposta.timeline(), SecaoAnalise.TIMELINE, snapshot);
        var patterns = validarItens(resposta.patterns(), SecaoAnalise.PATTERNS, snapshot);
        var attention = validarItens(resposta.attentionPoints(), SecaoAnalise.ATTENTION_POINTS, snapshot);
        var limitations = resposta.limitations() == null ? List.<String>of() : resposta.limitations().stream()
                .filter(Objects::nonNull).map(String::trim).filter(s -> !s.isBlank()).toList();
        validarSeguranca(timeline, patterns, attention, limitations);
        if (modo == ModoAnalise.SUMMARY_ONLY) {
            if (!patterns.isEmpty()) {
                erro("analise", "SUMMARY_ONLY nao permite padroes longitudinais.");
            }
            if (limitations.stream().noneMatch(l -> normalizar(l).contains(normalizar(LIMITACAO_SUMMARY_ONLY)))) {
                var ajustadas = new ArrayList<>(limitations);
                ajustadas.add(LIMITACAO_SUMMARY_ONLY);
                limitations = List.copyOf(ajustadas);
            }
        }
        return new AnaliseClinica(analiseId, geracaoId, pacienteId, geradaEm, modo, timeline, patterns,
                attention, limitations, CatalogoSegurancaClinica.VERSAO);
    }

    private List<ItemAnaliseClinica> validarItens(List<ItemResposta> itens, SecaoAnalise secao,
            SnapshotAnalise snapshot) {
        if (itens == null) {
            return List.of();
        }
        var porAlias = new HashMap<String, SnapshotAnalise.RegistroSnapshot>();
        snapshot.registros().forEach(registro -> porAlias.put(registro.alias(), registro));
        var validados = new ArrayList<ItemAnaliseClinica>();
        for (ItemResposta item : itens) {
            if (item == null || item.text() == null || item.text().isBlank()
                    || item.nature() == null || item.evidence() == null || item.evidence().isEmpty()) {
                erro("analise", "Item de analise invalido.");
            }
            var evidencias = new ArrayList<EvidenciaAnalise>();
            for (EvidenciaResposta evidencia : item.evidence()) {
                var registro = porAlias.get(evidencia.recordAlias());
                if (registro == null) {
                    erro("evidence", "Evidencia fora do snapshot.");
                }
                CampoEvidencia campo = parseCampo(evidencia.field());
                String fonte = switch (campo) {
                    case TEXT -> registro.texto();
                    case MOOD -> registro.humor();
                    case MEDICATIONS -> registro.medicamentos();
                };
                if (fonte == null || evidencia.quote() == null
                        || !normalizarWhitespace(fonte).contains(normalizarWhitespace(evidencia.quote()))) {
                    erro("quote", "Citacao literal ausente no registro clinico.");
                }
                evidencias.add(new EvidenciaAnalise(evidencia.recordAlias(), registro.id(), campo, evidencia.quote()));
            }
            validados.add(new ItemAnaliseClinica(item.text().trim(), item.nature(), List.copyOf(evidencias)));
        }
        return List.copyOf(validados);
    }

    private CampoEvidencia parseCampo(String campo) {
        return switch (campo == null ? "" : campo) {
            case "text" -> CampoEvidencia.TEXT;
            case "mood" -> CampoEvidencia.MOOD;
            case "medications" -> CampoEvidencia.MEDICATIONS;
            default -> throw new ValidacaoException(List.of(new ErroDeValidacao("field", "Campo de evidencia invalido.")));
        };
    }

    private void validarSeguranca(List<ItemAnaliseClinica> timeline, List<ItemAnaliseClinica> patterns,
            List<ItemAnaliseClinica> attention, List<String> limitations) {
        var textos = new ArrayList<String>();
        timeline.forEach(i -> textos.add(i.text()));
        patterns.forEach(i -> textos.add(i.text()));
        attention.forEach(i -> textos.add(i.text()));
        textos.addAll(limitations);
        if (textos.stream().anyMatch(catalogo::contemSinalizacaoProibida)) {
            erro("analise", "Analise contem sinalizacao clinica proibida.");
        }
    }

    private void erro(String campo, String mensagem) {
        throw new ValidacaoException(List.of(new ErroDeValidacao(campo, mensagem)));
    }

    private String normalizarWhitespace(String texto) {
        return Pattern.compile("\\s+").matcher(texto.trim()).replaceAll(" ");
    }

    private String normalizar(String texto) {
        return normalizarWhitespace(texto).toLowerCase(Locale.ROOT);
    }

    public record Resposta(List<ItemResposta> timeline, List<ItemResposta> patterns,
            List<ItemResposta> attentionPoints, List<String> limitations) {}
    public record ItemResposta(String text, NaturezaObservacao nature, List<EvidenciaResposta> evidence) {}
    public record EvidenciaResposta(String recordAlias, String field, String quote) {}
}
