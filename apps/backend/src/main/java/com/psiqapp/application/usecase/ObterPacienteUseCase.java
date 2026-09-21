package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryPacientePort;
import com.psiqapp.domain.modelo.Paciente;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import java.util.UUID;

public class ObterPacienteUseCase {
    private final RepositoryPacientePort pacientes;

    public ObterPacienteUseCase(RepositoryPacientePort pacientes) {
        this.pacientes = pacientes;
    }

    public Paciente executar(UUID id) {
        return pacientes.buscarPorId(id).orElseThrow(RecursoNaoEncontradoException::new);
    }
}
