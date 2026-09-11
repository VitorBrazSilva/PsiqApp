package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.dominio.modelo.Paciente;
import com.psiqapp.dominio.validacao.RecursoNaoEncontradoException;
import java.util.UUID;

public class ObterPacienteCasoDeUso {
    private final RepositorioPacientePort pacientes;

    public ObterPacienteCasoDeUso(RepositorioPacientePort pacientes) {
        this.pacientes = pacientes;
    }

    public Paciente executar(UUID id) {
        return pacientes.buscarPorId(id).orElseThrow(RecursoNaoEncontradoException::new);
    }
}
