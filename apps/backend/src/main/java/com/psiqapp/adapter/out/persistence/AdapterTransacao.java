package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.TransactionRunnerPort;
import java.util.function.Supplier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdapterTransacao implements TransactionRunnerPort {
    private final TransactionTemplate transacao;

    AdapterTransacao(TransactionTemplate transacao) {
        this.transacao = transacao;
    }

    @Override
    public <T> T executar(Supplier<T> bloco) {
        return transacao.execute(status -> bloco.get());
    }
}
