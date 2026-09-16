package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.Pagina;
import com.psiqapp.aplicacao.port.RepositorioAnaliseClinicaPort;
import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.dominio.modelo.GeracaoAnalise;
import com.psiqapp.dominio.validacao.RecursoNaoEncontradoException;
import java.util.UUID;

public class ListarGeracoesAnaliseCasoDeUso {
    private final RepositorioPacientePort pacientes;
    private final RepositorioAnaliseClinicaPort analises;

    public ListarGeracoesAnaliseCasoDeUso(RepositorioPacientePort pacientes, RepositorioAnaliseClinicaPort analises) {
        this.pacientes = pacientes;
        this.analises = analises;
    }

    public Pagina<GeracaoAnalise> executar(UUID pacienteId, Integer pagina, Integer tamanho) {
        if (pacientes.buscarPorId(pacienteId).isEmpty()) throw new RecursoNaoEncontradoException();
        int paginaNormalizada = Paginacao.pagina(pagina);
        int tamanhoNormalizado = Paginacao.tamanho(tamanho);
        Paginacao.validar(paginaNormalizada, tamanhoNormalizado);
        return analises.listarGeracoes(pacienteId, paginaNormalizada, tamanhoNormalizado);
    }
}
