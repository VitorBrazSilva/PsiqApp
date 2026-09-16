package com.psiqapp.aplicacao.servico;

import static org.assertj.core.api.Assertions.*;

import com.psiqapp.aplicacao.port.SnapshotAnalise;
import com.psiqapp.dominio.modelo.*;
import com.psiqapp.dominio.validacao.ValidacaoException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ValidadorRespostaAnaliseTest {
    private final ValidadorRespostaAnalise validador =
            new ValidadorRespostaAnalise(new CatalogoSegurancaClinica());

    @Test
    void validaEvidenciaLiteralComWhitespaceENaoUsaAnaliseComoFonte() {
        UUID registroId = UUID.randomUUID();
        var snapshot = new SnapshotAnalise(UUID.randomUUID(), 1, List.of(new SnapshotAnalise.RegistroSnapshot(
                "R1", registroId, TipoRegistroClinico.ORIGINAL, null, Instant.parse("2026-09-01T10:00:00Z"),
                "Texto clinico\nficticio com oscilacao de sono.", "Humor ficticio", null, 1)));
        var resposta = new ValidadorRespostaAnalise.Resposta(List.of(item("R1", "text", "Texto clinico ficticio")),
                List.of(), List.of(), List.of("Limite declarado."));

        var analise = validador.validar(UUID.randomUUID(), UUID.randomUUID(), snapshot.pacienteId(),
                ModoAnalise.SUMMARY_ONLY, Instant.parse("2026-09-15T10:00:00Z"), resposta, snapshot);

        assertThat(analise.timeline()).hasSize(1);
        assertThat(analise.timeline().getFirst().evidence().getFirst().registroId()).isEqualTo(registroId);
        assertThat(analise.limitations()).contains(ValidadorRespostaAnalise.LIMITACAO_SUMMARY_ONLY);
    }

    @Test
    void rejeitaAliasCampoCitacaoCatalogoEPadraoEmSummaryOnly() {
        var snapshot = new SnapshotAnalise(UUID.randomUUID(), 1, List.of(new SnapshotAnalise.RegistroSnapshot(
                "R1", UUID.randomUUID(), TipoRegistroClinico.ORIGINAL, null, Instant.parse("2026-09-01T10:00:00Z"),
                "Texto clinico ficticio.", null, null, 1)));

        assertThatThrownBy(() -> validar(snapshot, List.of(item("R2", "text", "Texto clinico"))))
                .isInstanceOf(ValidacaoException.class);
        assertThatThrownBy(() -> validar(snapshot, List.of(item("R1", "diagnosis", "Texto clinico"))))
                .isInstanceOf(ValidacaoException.class);
        assertThatThrownBy(() -> validar(snapshot, List.of(item("R1", "text", "trecho inventado"))))
                .isInstanceOf(ValidacaoException.class);
        assertThatThrownBy(() -> validar(snapshot, List.of(new ValidadorRespostaAnalise.ItemResposta(
                "Deve iniciar medicacao ficticia.", NaturezaObservacao.INTERPRETATION,
                List.of(new ValidadorRespostaAnalise.EvidenciaResposta("R1", "text", "Texto clinico"))))))
                .isInstanceOf(ValidacaoException.class);
        var respostaComPadrao = new ValidadorRespostaAnalise.Resposta(List.of(item("R1", "text", "Texto clinico")),
                List.of(item("R1", "text", "Texto clinico")), List.of(), List.of());
        assertThatThrownBy(() -> validador.validar(UUID.randomUUID(), UUID.randomUUID(), snapshot.pacienteId(),
                ModoAnalise.SUMMARY_ONLY, Instant.now(), respostaComPadrao, snapshot))
                .isInstanceOf(ValidacaoException.class);
    }

    private void validar(SnapshotAnalise snapshot, List<ValidadorRespostaAnalise.ItemResposta> timeline) {
        validador.validar(UUID.randomUUID(), UUID.randomUUID(), snapshot.pacienteId(), ModoAnalise.LONGITUDINAL,
                Instant.now(), new ValidadorRespostaAnalise.Resposta(timeline, List.of(), List.of(), List.of()),
                snapshot);
    }

    private ValidadorRespostaAnalise.ItemResposta item(String alias, String field, String quote) {
        return new ValidadorRespostaAnalise.ItemResposta("Observacao ficticia.", NaturezaObservacao.REPORTED,
                List.of(new ValidadorRespostaAnalise.EvidenciaResposta(alias, field, quote)));
    }
}
