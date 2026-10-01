package com.psiqapp.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import com.psiqapp.config.GoogleAgendaPropriedades;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class CifraTokenGoogleAgendaTest {
    private final String chave = Base64.getEncoder().encodeToString(new byte[32]);

    @Test void cifraEDecifraRefreshTokenSemPersistirTextoAberto() {
        var cifra = new CifraTokenGoogleAgenda(propriedades(chave));
        var dados = cifra.cifrar("refresh-token-falso");
        assertThat(dados.valor()).doesNotContain("refresh-token-falso");
        assertThat(dados.iv()).hasSize(16);
        assertThat(cifra.decifrar(dados)).isEqualTo("refresh-token-falso");
    }

    @Test void ivEUnicoEmCadaGravacao() {
        var cifra = new CifraTokenGoogleAgenda(propriedades(chave));
        assertThat(cifra.cifrar("token").iv()).isNotEqualTo(cifra.cifrar("token").iv());
    }

    @Test void chaveIncorretaRejeitaDecifragemSemRevelarToken() {
        var dados = new CifraTokenGoogleAgenda(propriedades(chave)).cifrar("refresh-token-falso");
        assertThatThrownBy(() -> new CifraTokenGoogleAgenda(propriedades(Base64.getEncoder().encodeToString(new byte[32]).replace("A", "B"))).decifrar(dados))
                .isInstanceOf(IllegalStateException.class).hasMessage("Credencial Google protegida indisponível.")
                .hasMessageNotContaining("refresh-token-falso");
    }

    private GoogleAgendaPropriedades propriedades(String chave) {
        return new GoogleAgendaPropriedades("", "", "", "", chave);
    }
}
