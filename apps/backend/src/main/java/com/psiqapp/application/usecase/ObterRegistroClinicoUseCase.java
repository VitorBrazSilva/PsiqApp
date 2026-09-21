package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryRegistroClinicoPort;
import com.psiqapp.domain.modelo.RegistroClinico;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import java.util.UUID;

public class ObterRegistroClinicoUseCase {
    private final RepositoryRegistroClinicoPort registros;

    public ObterRegistroClinicoUseCase(RepositoryRegistroClinicoPort registros) {
        this.registros = registros;
    }

    public RegistroClinico executar(UUID pacienteId, UUID registroId) {
        return registros.buscarNoPaciente(pacienteId, registroId).orElseThrow(RecursoNaoEncontradoException::new);
    }
}
