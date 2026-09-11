package com.psiqapp.configuracao;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psiqapp.aplicacao.port.RepositorioConsultaPort;
import com.psiqapp.aplicacao.port.RepositorioIdempotenciaPort;
import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.aplicacao.port.TransactionRunnerPort;
import com.psiqapp.aplicacao.usecase.*;
import java.time.Clock;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class CasosDeUsoConfiguracao {
    @Bean
    IdempotenciaServico idempotenciaServico(RepositorioIdempotenciaPort repositorio, ObjectMapper json) {
        return new IdempotenciaServico(repositorio, json);
    }

    @Bean
    CriarPacienteCasoDeUso criarPacienteCasoDeUso(RepositorioPacientePort pacientes,
            IdempotenciaServico idempotencia, TransactionRunnerPort transacao, Clock relogio) {
        return new CriarPacienteCasoDeUso(pacientes, idempotencia, transacao, relogio);
    }

    @Bean
    BuscarPacientesCasoDeUso buscarPacientesCasoDeUso(RepositorioPacientePort pacientes) {
        return new BuscarPacientesCasoDeUso(pacientes);
    }

    @Bean
    ObterPacienteCasoDeUso obterPacienteCasoDeUso(RepositorioPacientePort pacientes) {
        return new ObterPacienteCasoDeUso(pacientes);
    }

    @Bean
    CriarConsultaCasoDeUso criarConsultaCasoDeUso(RepositorioPacientePort pacientes,
            RepositorioConsultaPort consultas, IdempotenciaServico idempotencia, TransactionRunnerPort transacao,
            Clock relogio) {
        return new CriarConsultaCasoDeUso(pacientes, consultas, idempotencia, transacao, relogio);
    }

    @Bean
    ListarConsultasCasoDeUso listarConsultasCasoDeUso(RepositorioConsultaPort consultas) {
        return new ListarConsultasCasoDeUso(consultas);
    }

    @Bean
    AtualizarStatusConsultaCasoDeUso atualizarStatusConsultaCasoDeUso(RepositorioConsultaPort consultas,
            TransactionRunnerPort transacao, Clock relogio) {
        return new AtualizarStatusConsultaCasoDeUso(consultas, transacao, relogio);
    }
}
