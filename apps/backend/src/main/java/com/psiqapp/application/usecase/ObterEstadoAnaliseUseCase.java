package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryAnaliseClinicaPort;
import com.psiqapp.application.port.out.RepositoryGeracaoAnalisePort;
import com.psiqapp.application.port.out.RepositoryPacientePort;
import com.psiqapp.domain.modelo.AnaliseClinica;
import com.psiqapp.domain.modelo.GeracaoAnalise;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import java.util.Optional;
import java.util.UUID;

public class ObterEstadoAnaliseUseCase {
    private final RepositoryPacientePort pacientes;
    private final RepositoryGeracaoAnalisePort geracoes;
    private final RepositoryAnaliseClinicaPort analises;

    public ObterEstadoAnaliseUseCase(RepositoryPacientePort pacientes, RepositoryGeracaoAnalisePort geracoes,
            RepositoryAnaliseClinicaPort analises) {
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
