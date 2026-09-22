package com.psiqapp.application.port.out;

import com.psiqapp.application.servico.AnaliseResponseValidator;
import com.psiqapp.domain.modelo.ModoAnalise;
import java.time.Duration;

public interface ProvedorAnaliseClinicaPort {
    ResponseProvider gerar(Solicitacao solicitacao) throws FalhaProviderException;

    record Solicitacao(SnapshotAnalise snapshot, ModoAnalise modo, Duration timeout, Duration orcamentoRestante) {}

    record ResponseProvider(AnaliseResponseValidator.Response resposta, String providerRequestId,
            Integer inputTokens, Integer outputTokens) {}
}
