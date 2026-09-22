package com.psiqapp.config;

import com.psiqapp.application.port.out.*;
import com.psiqapp.application.servico.*;
import com.psiqapp.application.usecase.ProcessarGeracaoAnaliseUseCase;
import com.psiqapp.application.usecase.ProcessarGeracaoAnaliseUseCase.Config;
import java.time.Clock;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@EnableConfigurationProperties({AnaliseWorkerPropriedades.class, OpenAiPropriedades.class})
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class WorkerAnaliseConfiguration {
    @Bean
    SnapshotAnaliseAssembler snapshotAnaliseAssembler(RepositoryRegistroClinicoPort registros) {
        return new SnapshotAnaliseAssembler(registros);
    }

    @Bean
    CatalogoSegurancaClinica catalogoSegurancaClinica() {
        return new CatalogoSegurancaClinica();
    }

    @Bean
    AnaliseResponseValidator analiseResponseValidator(CatalogoSegurancaClinica catalogo) {
        return new AnaliseResponseValidator(catalogo);
    }

    @Bean
    ProcessarGeracaoAnaliseUseCase processarGeracaoAnaliseUseCase(RepositoryGeracaoAnalisePort geracoes,
            RepositoryAnaliseClinicaPort analises, RepositoryTentativaGeracaoPort tentativas,
            SnapshotAnaliseAssembler snapshots, AnaliseResponseValidator validador,
            ProvedorAnaliseClinicaPort provedor, TransactionRunnerPort transacao, Clock relogio,
            AnaliseWorkerPropriedades props) {
        return new ProcessarGeracaoAnaliseUseCase(geracoes, analises, tentativas, snapshots, validador,
                provedor, transacao, relogio, new Config(props.callTimeout(), props.attemptBudget(), props.leaseTtl(),
                props.backoffInitial(), props.backoffFinal(), props.maxAttempts()));
    }

    @Bean
    @ConditionalOnProperty(prefix = "psiqapp.analysis.worker", name = "enabled", havingValue = "true")
    WorkerAnaliseScheduler workerAnaliseScheduler(ProcessarGeracaoAnaliseUseCase processador) {
        return new WorkerAnaliseScheduler(processador);
    }
}
