package com.psiqapp.config;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class GoogleAgendaPropriedadesTest {
    private final String chave = Base64.getEncoder().encodeToString(new byte[32]);

    @Test void configuraSomenteQuandoCredenciaisDestinosECifraSaoValidos() {
        assertThat(new GoogleAgendaPropriedades("id", "secret",
                "https://api.example/api/v1/integracoes/google-agenda/callback", "https://app.example/agenda", chave).configurado()).isTrue();
        assertThat(new GoogleAgendaPropriedades("id", "secret",
                "https://api.example/callback", "https://app.example/agenda", chave).configurado()).isFalse();
        assertThat(new GoogleAgendaPropriedades("id", "secret",
                "https://api.example/api/v1/integracoes/google-agenda/callback", "https://attacker.example/", chave).configurado()).isFalse();
        assertThat(new GoogleAgendaPropriedades("id", "secret",
                "https://api.example/api/v1/integracoes/google-agenda/callback", "https://app.example/agenda?next=https://attacker.example", chave).configurado()).isFalse();
        assertThat(new GoogleAgendaPropriedades("id", "secret",
                "http://api.example/api/v1/integracoes/google-agenda/callback", "http://app.example/agenda", chave).configurado()).isFalse();
    }

    @Test void ausenteOuChaveComTamanhoInvalidoNaoQuebraConfiguracao() {
        assertThat(new GoogleAgendaPropriedades("", "", "", "", "").configurado()).isFalse();
        assertThat(new GoogleAgendaPropriedades("id", "secret",
                "http://127.0.0.1:8080/api/v1/integracoes/google-agenda/callback", "http://127.0.0.1:5173/agenda", "abc").cifraConfigurada()).isFalse();
    }
}
