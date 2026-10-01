package com.psiqapp.config;

import com.psiqapp.application.usecase.ProcessarSincronizacaoGoogleAgendaUseCase;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.scheduling.annotation.Scheduled;

class GoogleAgendaWorkerScheduler {
    private final ProcessarSincronizacaoGoogleAgendaUseCase processador;
    private final AtomicBoolean executando = new AtomicBoolean();

    GoogleAgendaWorkerScheduler(ProcessarSincronizacaoGoogleAgendaUseCase processador) {
        this.processador = processador;
    }

    @Scheduled(fixedDelayString = "${psiqapp.google-agenda.worker.poll-interval:5s}")
    void processar() {
        if (!executando.compareAndSet(false, true)) return;
        try {
            processador.processarLote();
        } finally {
            executando.set(false);
        }
    }
}
