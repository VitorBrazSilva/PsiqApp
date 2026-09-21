package com.psiqapp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.application.port.out.RepositoryAnaliseClinicaPort;
import com.psiqapp.application.port.out.RepositoryGeracaoAnalisePort;
import com.psiqapp.application.port.out.RepositoryIdempotenciaPort;
import com.psiqapp.application.port.out.RepositoryPacientePort;
import com.psiqapp.application.port.out.RepositoryRegistroClinicoPort;
import com.psiqapp.application.port.out.RepositorySequenciaPacientePort;
import com.psiqapp.application.port.out.TransactionRunnerPort;
import com.psiqapp.application.usecase.*;
import java.time.Clock;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class CasosDeUsoConfiguration {
    @Bean
    IdempotenciaServico idempotenciaServico(RepositoryIdempotenciaPort repositorio, ObjectMapper json) {
        return new IdempotenciaServico(repositorio, json);
    }

    @Bean
    CriarPacienteUseCase criarPacienteUseCase(RepositoryPacientePort pacientes,
            IdempotenciaServico idempotencia, TransactionRunnerPort transacao, Clock relogio) {
        return new CriarPacienteUseCase(pacientes, idempotencia, transacao, relogio);
    }

    @Bean
    BuscarPacientesUseCase buscarPacientesUseCase(RepositoryPacientePort pacientes) {
        return new BuscarPacientesUseCase(pacientes);
    }

    @Bean
    ObterPacienteUseCase obterPacienteUseCase(RepositoryPacientePort pacientes) {
        return new ObterPacienteUseCase(pacientes);
    }

    @Bean
    CriarConsultaUseCase criarConsultaUseCase(RepositoryPacientePort pacientes,
            RepositoryConsultaPort consultas, IdempotenciaServico idempotencia, TransactionRunnerPort transacao,
            Clock relogio) {
        return new CriarConsultaUseCase(pacientes, consultas, idempotencia, transacao, relogio);
    }

    @Bean
    ListarConsultasUseCase listarConsultasUseCase(RepositoryConsultaPort consultas) {
        return new ListarConsultasUseCase(consultas);
    }

    @Bean
    AtualizarStatusConsultaUseCase atualizarStatusConsultaUseCase(RepositoryConsultaPort consultas,
            TransactionRunnerPort transacao, Clock relogio) {
        return new AtualizarStatusConsultaUseCase(consultas, transacao, relogio);
    }

    @Bean
    CriarRegistroClinicoServico criarRegistroClinicoServico(RepositoryPacientePort pacientes,
            RepositoryConsultaPort consultas, RepositoryRegistroClinicoPort registros,
            RepositoryGeracaoAnalisePort geracoes, RepositorySequenciaPacientePort sequencias,
            Clock relogio) {
        return new CriarRegistroClinicoServico(pacientes, consultas, registros, geracoes, sequencias, relogio);
    }

    @Bean
    CriarParecerUseCase criarParecerUseCase(CriarRegistroClinicoServico criador,
            IdempotenciaServico idempotencia, RepositoryRegistroClinicoPort registros,
            RepositoryGeracaoAnalisePort geracoes, TransactionRunnerPort transacao) {
        return new CriarParecerUseCase(criador, idempotencia, registros, geracoes, transacao);
    }

    @Bean
    CriarComplementoUseCase criarComplementoUseCase(CriarRegistroClinicoServico criador,
            IdempotenciaServico idempotencia, RepositoryRegistroClinicoPort registros,
            RepositoryGeracaoAnalisePort geracoes, TransactionRunnerPort transacao) {
        return new CriarComplementoUseCase(criador, idempotencia, registros, geracoes, transacao);
    }

    @Bean
    ListarLinhaDoTempoUseCase listarLinhaDoTempoUseCase(RepositoryPacientePort pacientes,
            RepositoryRegistroClinicoPort registros) {
        return new ListarLinhaDoTempoUseCase(pacientes, registros);
    }

    @Bean
    ObterRegistroClinicoUseCase obterRegistroClinicoUseCase(RepositoryRegistroClinicoPort registros) {
        return new ObterRegistroClinicoUseCase(registros);
    }

    @Bean
    ObterEstadoAnaliseUseCase obterEstadoAnaliseUseCase(RepositoryPacientePort pacientes,
            RepositoryGeracaoAnalisePort geracoes, RepositoryAnaliseClinicaPort analises) {
        return new ObterEstadoAnaliseUseCase(pacientes, geracoes, analises);
    }

    @Bean
    ListarGeracoesAnaliseUseCase listarGeracoesAnaliseUseCase(RepositoryPacientePort pacientes,
            RepositoryAnaliseClinicaPort analises) {
        return new ListarGeracoesAnaliseUseCase(pacientes, analises);
    }

    @Bean
    ObterAnaliseUseCase obterAnaliseUseCase(RepositoryAnaliseClinicaPort analises) {
        return new ObterAnaliseUseCase(analises);
    }

    @Bean
    SolicitarRegeneracaoAnaliseUseCase solicitarRegeneracaoAnaliseUseCase(RepositoryPacientePort pacientes,
            RepositoryRegistroClinicoPort registros, RepositoryGeracaoAnalisePort geracoes,
            RepositorySequenciaPacientePort sequencias, IdempotenciaServico idempotencia,
            TransactionRunnerPort transacao, Clock relogio) {
        return new SolicitarRegeneracaoAnaliseUseCase(pacientes, registros, geracoes, sequencias,
                idempotencia, transacao, relogio);
    }
}
