package com.psiqapp.configuracao;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psiqapp.aplicacao.port.RepositorioConsultaPort;
import com.psiqapp.aplicacao.port.RepositorioAnaliseClinicaPort;
import com.psiqapp.aplicacao.port.RepositorioGeracaoAnalisePort;
import com.psiqapp.aplicacao.port.RepositorioIdempotenciaPort;
import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.aplicacao.port.RepositorioRegistroClinicoPort;
import com.psiqapp.aplicacao.port.RepositorioSequenciaPacientePort;
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

    @Bean
    CriarRegistroClinicoServico criarRegistroClinicoServico(RepositorioPacientePort pacientes,
            RepositorioConsultaPort consultas, RepositorioRegistroClinicoPort registros,
            RepositorioGeracaoAnalisePort geracoes, RepositorioSequenciaPacientePort sequencias,
            Clock relogio) {
        return new CriarRegistroClinicoServico(pacientes, consultas, registros, geracoes, sequencias, relogio);
    }

    @Bean
    CriarParecerCasoDeUso criarParecerCasoDeUso(CriarRegistroClinicoServico criador,
            IdempotenciaServico idempotencia, RepositorioRegistroClinicoPort registros,
            RepositorioGeracaoAnalisePort geracoes, TransactionRunnerPort transacao) {
        return new CriarParecerCasoDeUso(criador, idempotencia, registros, geracoes, transacao);
    }

    @Bean
    CriarComplementoCasoDeUso criarComplementoCasoDeUso(CriarRegistroClinicoServico criador,
            IdempotenciaServico idempotencia, RepositorioRegistroClinicoPort registros,
            RepositorioGeracaoAnalisePort geracoes, TransactionRunnerPort transacao) {
        return new CriarComplementoCasoDeUso(criador, idempotencia, registros, geracoes, transacao);
    }

    @Bean
    ListarLinhaDoTempoCasoDeUso listarLinhaDoTempoCasoDeUso(RepositorioPacientePort pacientes,
            RepositorioRegistroClinicoPort registros) {
        return new ListarLinhaDoTempoCasoDeUso(pacientes, registros);
    }

    @Bean
    ObterRegistroClinicoCasoDeUso obterRegistroClinicoCasoDeUso(RepositorioRegistroClinicoPort registros) {
        return new ObterRegistroClinicoCasoDeUso(registros);
    }

    @Bean
    ObterEstadoAnaliseCasoDeUso obterEstadoAnaliseCasoDeUso(RepositorioPacientePort pacientes,
            RepositorioGeracaoAnalisePort geracoes, RepositorioAnaliseClinicaPort analises) {
        return new ObterEstadoAnaliseCasoDeUso(pacientes, geracoes, analises);
    }

    @Bean
    ListarGeracoesAnaliseCasoDeUso listarGeracoesAnaliseCasoDeUso(RepositorioPacientePort pacientes,
            RepositorioAnaliseClinicaPort analises) {
        return new ListarGeracoesAnaliseCasoDeUso(pacientes, analises);
    }

    @Bean
    ObterAnaliseCasoDeUso obterAnaliseCasoDeUso(RepositorioAnaliseClinicaPort analises) {
        return new ObterAnaliseCasoDeUso(analises);
    }

    @Bean
    SolicitarRegeneracaoAnaliseCasoDeUso solicitarRegeneracaoAnaliseCasoDeUso(RepositorioPacientePort pacientes,
            RepositorioRegistroClinicoPort registros, RepositorioGeracaoAnalisePort geracoes,
            RepositorioSequenciaPacientePort sequencias, IdempotenciaServico idempotencia,
            TransactionRunnerPort transacao, Clock relogio) {
        return new SolicitarRegeneracaoAnaliseCasoDeUso(pacientes, registros, geracoes, sequencias,
                idempotencia, transacao, relogio);
    }
}
