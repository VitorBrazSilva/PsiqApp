package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.RepositorioAnaliseClinicaPort;
import com.psiqapp.dominio.modelo.AnaliseClinica;
import com.psiqapp.dominio.validacao.RecursoNaoEncontradoException;
import java.util.UUID;

public class ObterAnaliseCasoDeUso {
    private final RepositorioAnaliseClinicaPort analises;

    public ObterAnaliseCasoDeUso(RepositorioAnaliseClinicaPort analises) {
        this.analises = analises;
    }

    public AnaliseClinica executar(UUID pacienteId, UUID analiseId) {
        return analises.buscarNoPaciente(pacienteId, analiseId).orElseThrow(RecursoNaoEncontradoException::new);
    }
}
