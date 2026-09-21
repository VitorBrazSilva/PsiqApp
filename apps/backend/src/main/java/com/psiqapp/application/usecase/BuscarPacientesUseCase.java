package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.RepositoryPacientePort;
import com.psiqapp.domain.modelo.Paciente;
import com.psiqapp.domain.validation.Normalizadores;

public class BuscarPacientesUseCase {
    private final RepositoryPacientePort pacientes;

    public BuscarPacientesUseCase(RepositoryPacientePort pacientes) {
        this.pacientes = pacientes;
    }

    public Pagina<Paciente> executar(String termo, Integer pagina, Integer tamanho) {
        int p = Paginacao.pagina(pagina);
        int t = Paginacao.tamanho(tamanho);
        Paginacao.validar(p, t);
        return pacientes.buscarPorNome(Normalizadores.nomeBusca(termo), p, t);
    }
}
