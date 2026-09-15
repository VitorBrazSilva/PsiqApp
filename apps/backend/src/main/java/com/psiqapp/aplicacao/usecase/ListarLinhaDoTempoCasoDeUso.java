package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.Pagina;
import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.aplicacao.port.RepositorioRegistroClinicoPort;
import com.psiqapp.dominio.modelo.RegistroClinico;
import com.psiqapp.dominio.validacao.RecursoNaoEncontradoException;
import java.util.UUID;

public class ListarLinhaDoTempoCasoDeUso {
    private final RepositorioPacientePort pacientes;
    private final RepositorioRegistroClinicoPort registros;

    public ListarLinhaDoTempoCasoDeUso(RepositorioPacientePort pacientes, RepositorioRegistroClinicoPort registros) {
        this.pacientes = pacientes;
        this.registros = registros;
    }

    public Pagina<RegistroClinico> executar(UUID pacienteId, Integer pagina, Integer tamanho) {
        if (pacientes.buscarPorId(pacienteId).isEmpty()) throw new RecursoNaoEncontradoException();
        int paginaNormalizada = Paginacao.pagina(pagina);
        int tamanhoNormalizado = Paginacao.tamanho(tamanho);
        Paginacao.validar(paginaNormalizada, tamanhoNormalizado);
        return registros.listarLinhaDoTempo(pacienteId, paginaNormalizada, tamanhoNormalizado);
    }
}
