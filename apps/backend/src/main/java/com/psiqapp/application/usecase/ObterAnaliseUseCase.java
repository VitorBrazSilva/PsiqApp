package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryAnaliseClinicaPort;
import com.psiqapp.domain.modelo.AnaliseClinica;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import java.util.UUID;

public class ObterAnaliseUseCase {
    private final RepositoryAnaliseClinicaPort analises;

    public ObterAnaliseUseCase(RepositoryAnaliseClinicaPort analises) {
        this.analises = analises;
    }

    public AnaliseClinica executar(UUID pacienteId, UUID analiseId) {
        return analises.buscarNoPaciente(pacienteId, analiseId).orElseThrow(RecursoNaoEncontradoException::new);
    }
}
