package com.psiqapp.adapter.out.ai;

import com.psiqapp.application.port.out.ProvedorAnaliseClinicaPort;
import com.psiqapp.application.servico.AnaliseResponseValidator;
import com.psiqapp.domain.modelo.NaturezaObservacao;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
@ConditionalOnProperty(prefix = "psiqapp.analysis.provider", name = "type", havingValue = "fake", matchIfMissing = true)
class FakeAnaliseClinicaAdapter implements ProvedorAnaliseClinicaPort {
    @Override
    public ResponseProvider gerar(Solicitacao solicitacao) {
        var primeiro = solicitacao.snapshot().registros().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Snapshot sem registros clinicos."));
        var item = new AnaliseResponseValidator.ItemResponse(
                "Resumo baseado em registro clinico ficticio do snapshot.",
                NaturezaObservacao.RELATO,
                List.of(new AnaliseResponseValidator.EvidenciaResponse(primeiro.alias(), "TEXTO", primeiro.texto())));
        var limitations = solicitacao.modo().name().equals("RESUMO")
                ? List.of(AnaliseResponseValidator.LIMITACAO_RESUMO)
                : List.of("Analise limitada aos registros clinicos ficticios informados.");
        return new ResponseProvider(new AnaliseResponseValidator.Response(
                List.of(item), List.of(), List.of(), limitations), "fake-provider", null, null);
    }
}
