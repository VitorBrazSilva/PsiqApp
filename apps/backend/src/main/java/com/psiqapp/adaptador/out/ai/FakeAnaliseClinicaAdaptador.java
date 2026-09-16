package com.psiqapp.adaptador.out.ai;

import com.psiqapp.aplicacao.port.ProvedorAnaliseClinicaPort;
import com.psiqapp.aplicacao.servico.ValidadorRespostaAnalise;
import com.psiqapp.dominio.modelo.NaturezaObservacao;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
@ConditionalOnProperty(prefix = "psiqapp.analysis.provider", name = "type", havingValue = "fake", matchIfMissing = true)
class FakeAnaliseClinicaAdaptador implements ProvedorAnaliseClinicaPort {
    @Override
    public RespostaProvider gerar(Solicitacao solicitacao) {
        var primeiro = solicitacao.snapshot().registros().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Snapshot sem registros clinicos."));
        var item = new ValidadorRespostaAnalise.ItemResposta(
                "Resumo baseado em registro clinico ficticio do snapshot.",
                NaturezaObservacao.REPORTED,
                List.of(new ValidadorRespostaAnalise.EvidenciaResposta(primeiro.alias(), "text", primeiro.texto())));
        var limitations = solicitacao.modo().name().equals("SUMMARY_ONLY")
                ? List.of(ValidadorRespostaAnalise.LIMITACAO_SUMMARY_ONLY)
                : List.of("Analise limitada aos registros clinicos ficticios informados.");
        return new RespostaProvider(new ValidadorRespostaAnalise.Resposta(
                List.of(item), List.of(), List.of(), limitations), "fake-provider", null, null);
    }
}
