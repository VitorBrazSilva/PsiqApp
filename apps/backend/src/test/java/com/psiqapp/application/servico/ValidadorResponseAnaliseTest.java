package com.psiqapp.application.servico;

import static org.assertj.core.api.Assertions.*;

import com.psiqapp.application.port.out.SnapshotAnalise;
import com.psiqapp.domain.modelo.*;
import com.psiqapp.domain.exception.ValidacaoException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ValidadorResponseAnaliseTest {
    private final ValidadorResponseAnalise validador =
            new ValidadorResponseAnalise(new CatalogoSegurancaClinica());

    @Test
    void validaEvidenciaLiteralComWhitespaceENaoUsaAnaliseComoFonte() {
        UUID registroId = UUID.randomUUID();
        var snapshot = new SnapshotAnalise(UUID.randomUUID(), 1, List.of(new SnapshotAnalise.RegistroSnapshot(
                "R1", registroId, TipoRegistroClinico.ORIGINAL, null, Instant.parse("2026-09-01T10:00:00Z"),
                "Texto clinico\nficticio com oscilacao de sono.", "Humor ficticio", null, 1)));
        var resposta = new ValidadorResponseAnalise.Response(List.of(item("R1", "text", "Texto clinico ficticio")),
                List.of(), List.of(), List.of("Limite declarado."));

        var analise = validador.validar(UUID.randomUUID(), UUID.randomUUID(), snapshot.pacienteId(),
                ModoAnalise.SUMMARY_ONLY, Instant.parse("2026-09-15T10:00:00Z"), resposta, snapshot);

        assertThat(analise.timeline()).hasSize(1);
        assertThat(analise.timeline().getFirst().evidence().getFirst().registroId()).isEqualTo(registroId);
        assertThat(analise.limitations()).contains(ValidadorResponseAnalise.LIMITACAO_SUMMARY_ONLY);
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
        assertThatThrownBy(() -> validar(snapshot, List.of(new ValidadorResponseAnalise.ItemResponse(
                "Deve iniciar medicacao ficticia.", NaturezaObservacao.INTERPRETATION,
                List.of(new ValidadorResponseAnalise.EvidenciaResponse("R1", "text", "Texto clinico"))))))
                .isInstanceOf(ValidacaoException.class);
        var respostaComPadrao = new ValidadorResponseAnalise.Response(List.of(item("R1", "text", "Texto clinico")),
                List.of(item("R1", "text", "Texto clinico")), List.of(), List.of());
        assertThatThrownBy(() -> validador.validar(UUID.randomUUID(), UUID.randomUUID(), snapshot.pacienteId(),
                ModoAnalise.SUMMARY_ONLY, Instant.now(), respostaComPadrao, snapshot))
                .isInstanceOf(ValidacaoException.class);
    }

    private void validar(SnapshotAnalise snapshot, List<ValidadorResponseAnalise.ItemResponse> timeline) {
        validador.validar(UUID.randomUUID(), UUID.randomUUID(), snapshot.pacienteId(), ModoAnalise.LONGITUDINAL,
                Instant.now(), new ValidadorResponseAnalise.Response(timeline, List.of(), List.of(), List.of()),
                snapshot);
    }

    private ValidadorResponseAnalise.ItemResponse item(String alias, String field, String quote) {
        return new ValidadorResponseAnalise.ItemResponse("Observacao ficticia.", NaturezaObservacao.REPORTED,
                List.of(new ValidadorResponseAnalise.EvidenciaResponse(alias, field, quote)));
    }
}
