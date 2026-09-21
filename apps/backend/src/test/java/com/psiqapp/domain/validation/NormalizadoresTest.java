package com.psiqapp.domain.validation;

import com.psiqapp.domain.exception.ValidacaoException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import org.junit.jupiter.api.Test;

class NormalizadoresTest {
    private final Clock relogio = Clock.fixed(Instant.parse("2026-09-11T12:00:00Z"), ZoneOffset.UTC);

    @Test
    void validaCpfEmailTelefoneNascimentoEOpicionais() {
        var erros = new ArrayList<ErroDeValidacao>();
        assertThat(Normalizadores.cpf("529.982.247-25", erros)).isEqualTo("52998224725");
        assertThat(Normalizadores.email(" pessoa@example.test ", erros)).isEqualTo("pessoa@example.test");
        assertThat(Normalizadores.telefone("(11) 98765-4321", erros)).isEqualTo("+5511987654321");
        assertThat(Normalizadores.nascimento(LocalDate.of(1990, 1, 1), relogio, erros))
                .isEqualTo(LocalDate.of(1990, 1, 1));
        assertThat(Normalizadores.opcional("   ")).isNull();
        Normalizadores.validarSemErros(erros);
    }

    @Test
    void rejeitaCamposInvalidosSemDependerDeConsultaExterna() {
        var erros = new ArrayList<ErroDeValidacao>();
        Normalizadores.cpf("111.111.111-11", erros);
        Normalizadores.email("invalido", erros);
        Normalizadores.telefone("123", erros);
        Normalizadores.nascimento(LocalDate.of(2027, 1, 1), relogio, erros);
        assertThatThrownBy(() -> Normalizadores.validarSemErros(erros))
                .isInstanceOf(ValidacaoException.class);
        assertThat(erros).extracting(ErroDeValidacao::campo)
                .contains("cpf", "email", "telefone", "dataNascimento");
    }

    @Test
    void normalizaNomeParaBuscaSemAcentosOuCaixa() {
        assertThat(Normalizadores.nomeBusca("  João Ávila  ")).isEqualTo("joao avila");
    }
}
