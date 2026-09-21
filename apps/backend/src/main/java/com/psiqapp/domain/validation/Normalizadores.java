package com.psiqapp.domain.validation;

import java.text.Normalizer;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import com.psiqapp.domain.exception.ValidacaoException;
import java.util.regex.Pattern;

public final class Normalizadores {
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final ZoneId SAO_PAULO = ZoneId.of("America/Sao_Paulo");

    private Normalizadores() {}

    public static String textoObrigatorio(String valor, String campo, List<ErroDeValidacao> erros) {
        String normalizado = valor == null ? "" : valor.trim();
        if (normalizado.isBlank()) {
            erros.add(new ErroDeValidacao(campo, "Campo obrigatorio."));
        }
        return normalizado;
    }

    public static String opcional(String valor) {
        if (valor == null) return null;
        String normalizado = valor.trim();
        return normalizado.isBlank() ? null : normalizado;
    }

    public static String cpf(String valor, List<ErroDeValidacao> erros) {
        String digitos = valor == null ? "" : valor.replaceAll("\\D", "");
        if (digitos.length() != 11 || digitos.chars().distinct().count() == 1 || !cpfValido(digitos)) {
            erros.add(new ErroDeValidacao("cpf", "CPF invalido."));
        }
        return digitos;
    }

    public static String email(String valor, List<ErroDeValidacao> erros) {
        String normalizado = textoObrigatorio(valor, "email", erros);
        if (!normalizado.isBlank() && !EMAIL.matcher(normalizado).matches()) {
            erros.add(new ErroDeValidacao("email", "E-mail invalido."));
        }
        return normalizado;
    }

    public static String telefone(String valor, List<ErroDeValidacao> erros) {
        String entrada = valor == null ? "" : valor.trim();
        String digitos = entrada.replaceAll("\\D", "");
        if (digitos.startsWith("55") && digitos.length() > 11) {
            digitos = digitos.substring(2);
        }
        if (digitos.length() != 10 && digitos.length() != 11) {
            erros.add(new ErroDeValidacao("telefone", "Telefone invalido."));
        }
        return "+55" + digitos;
    }

    public static LocalDate nascimento(LocalDate data, Clock relogio, List<ErroDeValidacao> erros) {
        if (data == null) {
            erros.add(new ErroDeValidacao("dataNascimento", "Campo obrigatorio."));
            return null;
        }
        if (data.isAfter(LocalDate.now(relogio.withZone(SAO_PAULO)))) {
            erros.add(new ErroDeValidacao("dataNascimento", "Data de nascimento invalida."));
        }
        return data;
    }

    public static String nomeBusca(String valor) {
        String semAcentos = Normalizer.normalize(valor == null ? "" : valor.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return semAcentos.toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    public static void validarSemErros(List<ErroDeValidacao> erros) {
        if (!erros.isEmpty()) throw new ValidacaoException(new ArrayList<>(erros));
    }

    private static boolean cpfValido(String cpf) {
        return digito(cpf, 9) == cpf.charAt(9) - '0' && digito(cpf, 10) == cpf.charAt(10) - '0';
    }

    private static int digito(String cpf, int tamanho) {
        int soma = 0;
        for (int i = 0; i < tamanho; i++) {
            soma += (cpf.charAt(i) - '0') * (tamanho + 1 - i);
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
