package com.psiqapp.aplicacao.servico;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

public class CatalogoSegurancaClinica {
    public static final String VERSAO = "clinical-safety-v1";

    private static final List<String> PADROES_PROIBIDOS = List.of(
            "diagnostico fechado",
            "prescrever",
            "prescricao",
            "iniciar medicacao",
            "suspender medicacao",
            "trocar medicacao",
            "alterar dose",
            "aumentar dose",
            "reduzir dose",
            "recomenda conduta",
            "deve iniciar",
            "deve suspender");

    public boolean contemSinalizacaoProibida(String texto) {
        if (texto == null) {
            return false;
        }
        String normalizado = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
        return PADROES_PROIBIDOS.stream().anyMatch(normalizado::contains);
    }
}
