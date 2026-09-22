package com.psiqapp.application.servico;

import static org.assertj.core.api.Assertions.*;

import com.psiqapp.application.port.out.SnapshotAnalise;
import com.psiqapp.domain.modelo.*;
import com.psiqapp.domain.exception.ValidacaoException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class AnaliseResponseValidatorTest {
    private final AnaliseResponseValidator validador =
            new AnaliseResponseValidator(new CatalogoSegurancaClinica());

    @Test
    void validaEvidenciaLiteralComWhitespaceENaoUsaAnaliseComoFonte() {
        UUID registroId = UUID.randomUUID();
        var snapshot = new SnapshotAnalise(UUID.randomUUID(), 1, List.of(new SnapshotAnalise.RegistroSnapshot(
                "R1", registroId, TipoRegistroClinico.PARECER, null, Instant.parse("2026-09-01T10:00:00Z"),
                "Texto clinico\nficticio com oscilacao de sono.", "Humor ficticio", null, 1)));
        var resposta = new AnaliseResponseValidator.Response(List.of(item("R1", "TEXTO", "Texto clinico ficticio")),
                List.of(), List.of(), List.of("Limite declarado."));

        var analise = validador.validar(UUID.randomUUID(), UUID.randomUUID(), snapshot.pacienteId(),
                ModoAnalise.RESUMO, Instant.parse("2026-09-15T10:00:00Z"), resposta, snapshot);

        assertThat(analise.timeline()).hasSize(1);
        assertThat(analise.timeline().getFirst().evidence().getFirst().registroId()).isEqualTo(registroId);
        assertThat(analise.limitations()).contains(AnaliseResponseValidator.LIMITACAO_RESUMO);
    }

    @Test
    void rejeitaAliasCampoCitacaoCatalogoEPadraoEmSummaryOnly() {
        var snapshot = new SnapshotAnalise(UUID.randomUUID(), 1, List.of(new SnapshotAnalise.RegistroSnapshot(
                "R1", UUID.randomUUID(), TipoRegistroClinico.PARECER, null, Instant.parse("2026-09-01T10:00:00Z"),
                "Texto clinico ficticio.", null, null, 1)));

        assertThatThrownBy(() -> validar(snapshot, List.of(item("R2", "TEXTO", "Texto clinico"))))
                .isInstanceOf(ValidacaoException.class);
        assertThatThrownBy(() -> validar(snapshot, List.of(item("R1", "DIAGNOSTICO", "Texto clinico"))))
                .isInstanceOf(ValidacaoException.class);
        assertThatThrownBy(() -> validar(snapshot, List.of(item("R1", "TEXTO", "trecho inventado"))))
                .isInstanceOf(ValidacaoException.class);
        assertThatThrownBy(() -> validar(snapshot, List.of(new AnaliseResponseValidator.ItemResponse(
                "Deve iniciar medicacao ficticia.", NaturezaObservacao.INTERPRETACAO,
                List.of(new AnaliseResponseValidator.EvidenciaResponse("R1", "TEXTO", "Texto clinico"))))))
                .isInstanceOf(ValidacaoException.class);
        var respostaComPadrao = new AnaliseResponseValidator.Response(List.of(item("R1", "TEXTO", "Texto clinico")),
                List.of(item("R1", "TEXTO", "Texto clinico")), List.of(), List.of());
        assertThatThrownBy(() -> validador.validar(UUID.randomUUID(), UUID.randomUUID(), snapshot.pacienteId(),
                ModoAnalise.RESUMO, Instant.now(), respostaComPadrao, snapshot))
                .isInstanceOf(ValidacaoException.class);
    }

    private void validar(SnapshotAnalise snapshot, List<AnaliseResponseValidator.ItemResponse> timeline) {
        validador.validar(UUID.randomUUID(), UUID.randomUUID(), snapshot.pacienteId(), ModoAnalise.LONGITUDINAL,
                Instant.now(), new AnaliseResponseValidator.Response(timeline, List.of(), List.of(), List.of()),
                snapshot);
    }

    private AnaliseResponseValidator.ItemResponse item(String alias, String field, String quote) {
        return new AnaliseResponseValidator.ItemResponse("Observacao ficticia.", NaturezaObservacao.RELATO,
                List.of(new AnaliseResponseValidator.EvidenciaResponse(alias, field, quote)));
    }
}
