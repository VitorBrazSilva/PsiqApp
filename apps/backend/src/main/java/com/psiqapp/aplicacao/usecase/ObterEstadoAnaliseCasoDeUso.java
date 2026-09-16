package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.RepositorioAnaliseClinicaPort;
import com.psiqapp.aplicacao.port.RepositorioGeracaoAnalisePort;
import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.dominio.modelo.AnaliseClinica;
import com.psiqapp.dominio.modelo.GeracaoAnalise;
import com.psiqapp.dominio.validacao.RecursoNaoEncontradoException;
import java.util.Optional;
import java.util.UUID;

public class ObterEstadoAnaliseCasoDeUso {
    private final RepositorioPacientePort pacientes;
    private final RepositorioGeracaoAnalisePort geracoes;
    private final RepositorioAnaliseClinicaPort analises;

    public ObterEstadoAnaliseCasoDeUso(RepositorioPacientePort pacientes, RepositorioGeracaoAnalisePort geracoes,
            RepositorioAnaliseClinicaPort analises) {
        this.pacientes = pacientes;
        this.geracoes = geracoes;
        this.analises = analises;
    }

    public Resultado executar(UUID pacienteId) {
        if (pacientes.buscarPorId(pacienteId).isEmpty()) throw new RecursoNaoEncontradoException();
        Optional<AnaliseClinica> atual = analises.buscarAtual(pacienteId);
        Optional<GeracaoAnalise> ativa = geracoes.buscarAtiva(pacienteId);
        Optional<GeracaoAnalise> ultima = geracoes.buscarMaisRecente(pacienteId);
        boolean podeRegenerar = ativa.isEmpty() && ultima.map(GeracaoAnalise::totalOriginais).orElse(0) > 0;
        String motivo = podeRegenerar ? null : ativa.isPresent() ? "GENERATION_ACTIVE" : "NO_ORIGINAL_RECORD";
        return new Resultado(atual.orElse(null), ultima.orElse(null), ativa.orElse(null), podeRegenerar, motivo);
    }

    public record Resultado(AnaliseClinica analiseAtual, GeracaoAnalise ultimaGeracao,
            GeracaoAnalise geracaoAtiva, boolean podeRegenerar, String motivo) {}
}
