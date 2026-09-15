package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.RepositorioRegistroClinicoPort;
import com.psiqapp.dominio.modelo.RegistroClinico;
import com.psiqapp.dominio.validacao.RecursoNaoEncontradoException;
import java.util.UUID;

public class ObterRegistroClinicoCasoDeUso {
    private final RepositorioRegistroClinicoPort registros;

    public ObterRegistroClinicoCasoDeUso(RepositorioRegistroClinicoPort registros) {
        this.registros = registros;
    }

    public RegistroClinico executar(UUID pacienteId, UUID registroId) {
        return registros.buscarNoPaciente(pacienteId, registroId).orElseThrow(RecursoNaoEncontradoException::new);
    }
}
