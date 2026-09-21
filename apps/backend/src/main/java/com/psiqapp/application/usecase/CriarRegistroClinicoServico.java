package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.ConsultaResumo;
import com.psiqapp.application.port.out.RepositoryGeracaoAnalisePort;
import com.psiqapp.application.port.out.RepositoryPacientePort;
import com.psiqapp.application.port.out.RepositoryRegistroClinicoPort;
import com.psiqapp.application.port.out.RepositorySequenciaPacientePort;
import com.psiqapp.domain.modelo.EstadoGeracaoAnalise;
import com.psiqapp.domain.modelo.GatilhoGeracaoAnalise;
import com.psiqapp.domain.modelo.GeracaoAnalise;
import com.psiqapp.domain.modelo.ModoAnalise;
import com.psiqapp.domain.modelo.RegistroClinico;
import com.psiqapp.domain.modelo.TipoRegistroClinico;
import com.psiqapp.domain.validation.ConflitoException;
import com.psiqapp.domain.validation.ErroDeValidacao;
import com.psiqapp.domain.validation.Normalizadores;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

public class CriarRegistroClinicoServico {
    record Entrada(TipoRegistroClinico tipo, UUID pacienteId, UUID parecerOriginalId, UUID consultaId,
            Instant dataHoraClinica, String texto, String humor, String medicamentos) {}

    record Resultado(RegistroClinico registro, GeracaoAnalise geracao) {}

    private final RepositoryPacientePort pacientes;
    private final ConsultaResumo consultas;
    private final RepositoryRegistroClinicoPort registros;
    private final RepositoryGeracaoAnalisePort geracoes;
    private final RepositorySequenciaPacientePort sequencias;
    private final Clock relogio;

    public CriarRegistroClinicoServico(RepositoryPacientePort pacientes, ConsultaResumo consultas,
            RepositoryRegistroClinicoPort registros, RepositoryGeracaoAnalisePort geracoes,
            RepositorySequenciaPacientePort sequencias, Clock relogio) {
        this.pacientes = pacientes;
        this.consultas = consultas;
        this.registros = registros;
        this.geracoes = geracoes;
        this.sequencias = sequencias;
        this.relogio = relogio;
    }

    Resultado criar(Entrada entrada) {
        validarPaciente(entrada.pacienteId());
        validarAssociacoes(entrada);
        var dados = validarDados(entrada);
        var reserva = sequencias.reservarParaNovoRegistroClinico(entrada.pacienteId())
                .orElseThrow(RecursoNaoEncontradoException::new);
        Instant agora = relogio.instant();
        var registro = registros.salvar(new RegistroClinico(UUID.randomUUID(), entrada.pacienteId(), entrada.tipo(),
                entrada.parecerOriginalId(), entrada.consultaId(), dados.dataHoraClinica(), agora,
                dados.texto(), dados.humor(), dados.medicamentos(), reserva.revisaoClinica()));
        var estatisticas = registros.estatisticasDoPaciente(entrada.pacienteId());
        var geracao = geracoes.salvar(new GeracaoAnalise(UUID.randomUUID(), entrada.pacienteId(),
                GatilhoGeracaoAnalise.AUTO, registro.id(), reserva.revisaoClinica(),
                reserva.sequenciaRequest(), agora, EstadoGeracaoAnalise.QUEUED,
                estatisticas.totalRegistros(), estatisticas.totalOriginais(),
                estatisticas.totalComplementos(), estatisticas.ultimoRegistroId(),
                modo(estatisticas.totalOriginais())));
        return new Resultado(registro, geracao);
    }

    private void validarPaciente(UUID pacienteId) {
        if (pacienteId == null || pacientes.buscarPorId(pacienteId).isEmpty()) {
            throw new RecursoNaoEncontradoException();
        }
    }

    private void validarAssociacoes(Entrada entrada) {
        if (entrada.tipo() == TipoRegistroClinico.ORIGINAL) {
            if (entrada.parecerOriginalId() != null) throw new ConflitoException();
            if (entrada.consultaId() != null) {
                UUID pacienteDaConsulta = consultas.pacienteDaConsulta(entrada.consultaId())
                        .orElseThrow(RecursoNaoEncontradoException::new);
                if (!pacienteDaConsulta.equals(entrada.pacienteId())) throw new ConflitoException();
            }
            return;
        }
        if (entrada.parecerOriginalId() == null) throw new RecursoNaoEncontradoException();
        registros.buscarOriginalNoPaciente(entrada.pacienteId(), entrada.parecerOriginalId())
                .orElseThrow(RecursoNaoEncontradoException::new);
        if (entrada.consultaId() != null) throw new ConflitoException();
    }

    private DadosValidados validarDados(Entrada entrada) {
        var erros = new ArrayList<ErroDeValidacao>();
        String texto = Normalizadores.textoObrigatorio(entrada.texto(), "texto", erros);
        String humor = Normalizadores.opcional(entrada.humor());
        String medicamentos = Normalizadores.opcional(entrada.medicamentos());
        Instant dataClinica = entrada.dataHoraClinica() == null ? relogio.instant() : entrada.dataHoraClinica();
        Normalizadores.validarSemErros(erros);
        return new DadosValidados(texto, humor, medicamentos, dataClinica);
    }

    private ModoAnalise modo(int totalOriginais) {
        return totalOriginais <= 1 ? ModoAnalise.SUMMARY_ONLY : ModoAnalise.LONGITUDINAL;
    }

    private record DadosValidados(String texto, String humor, String medicamentos, Instant dataHoraClinica) {}
}
