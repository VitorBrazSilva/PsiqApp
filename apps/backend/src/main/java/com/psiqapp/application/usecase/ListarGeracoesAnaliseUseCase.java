package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.RepositoryAnaliseClinicaPort;
import com.psiqapp.application.port.out.RepositoryPacientePort;
import com.psiqapp.domain.modelo.GeracaoAnalise;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import java.util.UUID;

public class ListarGeracoesAnaliseUseCase {
    private final RepositoryPacientePort pacientes;
    private final RepositoryAnaliseClinicaPort analises;

    public ListarGeracoesAnaliseUseCase(RepositoryPacientePort pacientes, RepositoryAnaliseClinicaPort analises) {
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
