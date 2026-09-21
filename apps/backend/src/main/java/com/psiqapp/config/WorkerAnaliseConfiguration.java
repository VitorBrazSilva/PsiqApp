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
    MontadorSnapshotAnalise montadorSnapshotAnalise(RepositoryRegistroClinicoPort registros) {
        return new MontadorSnapshotAnalise(registros);
    }

    @Bean
    CatalogoSegurancaClinica catalogoSegurancaClinica() {
        return new CatalogoSegurancaClinica();
    }

    @Bean
    ValidadorResponseAnalise validadorResponseAnalise(CatalogoSegurancaClinica catalogo) {
        return new ValidadorResponseAnalise(catalogo);
    }

    @Bean
    ProcessarGeracaoAnaliseUseCase processarGeracaoAnaliseUseCase(RepositoryGeracaoAnalisePort geracoes,
            RepositoryAnaliseClinicaPort analises, RepositoryTentativaGeracaoPort tentativas,
            MontadorSnapshotAnalise snapshots, ValidadorResponseAnalise validador,
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
