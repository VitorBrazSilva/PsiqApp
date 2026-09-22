package com.psiqapp.config;

import com.psiqapp.application.usecase.ProcessarGeracaoAnaliseUseCase;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;

class WorkerAnaliseScheduler {
    private static final Logger log = LoggerFactory.getLogger(WorkerAnaliseScheduler.class);
    private final ProcessarGeracaoAnaliseUseCase processador;
    private final AtomicBoolean executando = new AtomicBoolean(false);

    WorkerAnaliseScheduler(ProcessarGeracaoAnaliseUseCase processador) {
        this.processador = processador;
    }

    @Scheduled(fixedDelayString = "${psiqapp.analise.worker.poll-interval:2s}")
    void processar() {
        if (!executando.compareAndSet(false, true)) {
            return;
        }
        try {
            var resultado = processador.executarUma();
            if (resultado != ProcessarGeracaoAnaliseUseCase.Resultado.NENHUMA_GERACAO) {
                log.info("analysis worker cycle result={}", resultado);
            }
        } finally {
            executando.set(false);
        }
    }
}
