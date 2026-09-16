package com.psiqapp.configuracao;

import com.psiqapp.aplicacao.port.*;
import com.psiqapp.aplicacao.servico.*;
import com.psiqapp.aplicacao.usecase.ProcessarGeracaoAnaliseCasoDeUso;
import com.psiqapp.aplicacao.usecase.ProcessarGeracaoAnaliseCasoDeUso.Config;
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
class WorkerAnaliseConfiguracao {
    @Bean
    MontadorSnapshotAnalise montadorSnapshotAnalise(RepositorioRegistroClinicoPort registros) {
        return new MontadorSnapshotAnalise(registros);
    }

    @Bean
    CatalogoSegurancaClinica catalogoSegurancaClinica() {
        return new CatalogoSegurancaClinica();
    }

    @Bean
    ValidadorRespostaAnalise validadorRespostaAnalise(CatalogoSegurancaClinica catalogo) {
        return new ValidadorRespostaAnalise(catalogo);
    }

    @Bean
    ProcessarGeracaoAnaliseCasoDeUso processarGeracaoAnaliseCasoDeUso(RepositorioGeracaoAnalisePort geracoes,
            RepositorioAnaliseClinicaPort analises, RepositorioTentativaGeracaoPort tentativas,
            MontadorSnapshotAnalise snapshots, ValidadorRespostaAnalise validador,
            ProvedorAnaliseClinicaPort provedor, TransactionRunnerPort transacao, Clock relogio,
            AnaliseWorkerPropriedades props) {
        return new ProcessarGeracaoAnaliseCasoDeUso(geracoes, analises, tentativas, snapshots, validador,
                provedor, transacao, relogio, new Config(props.callTimeout(), props.attemptBudget(), props.leaseTtl(),
                props.backoffInitial(), props.backoffFinal(), props.maxAttempts()));
    }

    @Bean
    @ConditionalOnProperty(prefix = "psiqapp.analysis.worker", name = "enabled", havingValue = "true")
    WorkerAnaliseScheduler workerAnaliseScheduler(ProcessarGeracaoAnaliseCasoDeUso processador) {
        return new WorkerAnaliseScheduler(processador);
    }
}
