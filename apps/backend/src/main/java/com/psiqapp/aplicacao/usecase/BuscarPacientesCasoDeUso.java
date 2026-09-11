package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.Pagina;
import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.dominio.modelo.Paciente;
import com.psiqapp.dominio.validacao.Normalizadores;

public class BuscarPacientesCasoDeUso {
    private final RepositorioPacientePort pacientes;

    public BuscarPacientesCasoDeUso(RepositorioPacientePort pacientes) {
        this.pacientes = pacientes;
    }

    public Pagina<Paciente> executar(String termo, Integer pagina, Integer tamanho) {
        int p = Paginacao.pagina(pagina);
        int t = Paginacao.tamanho(tamanho);
        Paginacao.validar(p, t);
        return pacientes.buscarPorNome(Normalizadores.nomeBusca(termo), p, t);
    }
}
