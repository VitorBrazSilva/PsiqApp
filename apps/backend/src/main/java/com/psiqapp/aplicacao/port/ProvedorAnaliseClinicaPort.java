package com.psiqapp.aplicacao.port;

import com.psiqapp.aplicacao.servico.ValidadorRespostaAnalise;
import com.psiqapp.dominio.modelo.ModoAnalise;
import java.time.Duration;

public interface ProvedorAnaliseClinicaPort {
    RespostaProvider gerar(Solicitacao solicitacao) throws FalhaProviderException;

    record Solicitacao(SnapshotAnalise snapshot, ModoAnalise modo, Duration timeout, Duration orcamentoRestante) {}

    record RespostaProvider(ValidadorRespostaAnalise.Resposta resposta, String providerRequestId,
            Integer inputTokens, Integer outputTokens) {}
}
