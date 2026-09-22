package com.psiqapp.application.servico;

import com.psiqapp.application.port.out.SnapshotAnalise;
import com.psiqapp.domain.modelo.*;
import com.psiqapp.domain.validation.ErroDeValidacao;
import com.psiqapp.domain.exception.ValidacaoException;
import java.util.*;
import java.util.regex.Pattern;

public class AnaliseResponseValidator {
    public static final String LIMITACAO_RESUMO =
            "HistÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rico insuficiente para avaliar evoluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o ou tendÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªncia longitudinal.";
    private final CatalogoSegurancaClinica catalogo;

    public AnaliseResponseValidator(CatalogoSegurancaClinica catalogo) {
        this.catalogo = catalogo;
    }

    public AnaliseClinica validar(UUID analiseId, UUID geracaoId, UUID pacienteId, ModoAnalise modo,
            java.time.Instant geradaEm, Response resposta, SnapshotAnalise snapshot) {
        Objects.requireNonNull(resposta, "resposta");
        var timeline = validarItens(resposta.linhaDoTempo(), SecaoAnalise.LINHA_DO_TEMPO, snapshot);
        var patterns = validarItens(resposta.padroes(), SecaoAnalise.PADROES, snapshot);
        var attention = validarItens(resposta.pontosDeAtencao(), SecaoAnalise.PONTOS_DE_ATENCAO, snapshot);
        var limitations = resposta.limitacoes() == null ? List.<String>of() : resposta.limitacoes().stream()
                .filter(Objects::nonNull).map(String::trim).filter(s -> !s.isBlank()).toList();
        validarSeguranca(timeline, patterns, attention, limitations);
        if (modo == ModoAnalise.RESUMO) {
            if (!patterns.isEmpty()) {
                erro("analise", "SUMMARY_ONLY nao permite padroes longitudinais.");
            }
            if (limitations.stream().noneMatch(l -> normalizar(l).contains(normalizar(LIMITACAO_RESUMO)))) {
                var ajustadas = new ArrayList<>(limitations);
                ajustadas.add(LIMITACAO_RESUMO);
                limitations = List.copyOf(ajustadas);
            }
        }
        return new AnaliseClinica(analiseId, geracaoId, pacienteId, geradaEm, modo, timeline, patterns,
                attention, limitations, CatalogoSegurancaClinica.VERSAO);
    }

    private List<ItemAnaliseClinica> validarItens(List<ItemResponse> itens, SecaoAnalise secao,
            SnapshotAnalise snapshot) {
        if (itens == null) {
            return List.of();
        }
        var porAlias = new HashMap<String, SnapshotAnalise.RegistroSnapshot>();
        snapshot.registros().forEach(registro -> porAlias.put(registro.alias(), registro));
        var validados = new ArrayList<ItemAnaliseClinica>();
        for (ItemResponse item : itens) {
            if (item == null || item.texto() == null || item.texto().isBlank()
                    || item.natureza() == null || item.evidencias() == null || item.evidencias().isEmpty()) {
                erro("analise", "Item de analise invalido.");
            }
            var evidencias = new ArrayList<EvidenciaAnalise>();
            for (EvidenciaResponse evidencia : item.evidencias()) {
                var registro = porAlias.get(evidencia.apelidoRegistro());
                if (registro == null) {
                    erro("evidence", "Evidencia fora do snapshot.");
                }
                CampoEvidencia campo = parseCampo(evidencia.campo());
                String fonte = switch (campo) {
                    case TEXTO -> registro.texto();
                    case HUMOR -> registro.humor();
                    case MEDICAMENTOS -> registro.medicamentos();
                };
                if (fonte == null || evidencia.citacao() == null
                        || !normalizarWhitespace(fonte).contains(normalizarWhitespace(evidencia.citacao()))) {
                    erro("quote", "Citacao literal ausente no registro clinico.");
                }
                evidencias.add(new EvidenciaAnalise(evidencia.apelidoRegistro(), registro.id(), campo, evidencia.citacao()));
            }
            validados.add(new ItemAnaliseClinica(item.texto().trim(), item.natureza(), List.copyOf(evidencias)));
        }
        return List.copyOf(validados);
    }

    private CampoEvidencia parseCampo(String campo) {
        return switch (campo == null ? "" : campo.toUpperCase(Locale.ROOT)) {
            case "TEXTO", "TEXT" -> CampoEvidencia.TEXTO;
            case "HUMOR", "MOOD" -> CampoEvidencia.HUMOR;
            case "MEDICAMENTOS", "MEDICATIONS" -> CampoEvidencia.MEDICAMENTOS;
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

    public record Response(List<ItemResponse> linhaDoTempo, List<ItemResponse> padroes,
            List<ItemResponse> pontosDeAtencao, List<String> limitacoes) {}
    public record ItemResponse(String texto, NaturezaObservacao natureza, List<EvidenciaResponse> evidencias) {}
    public record EvidenciaResponse(String apelidoRegistro, String campo, String citacao) {}
}
