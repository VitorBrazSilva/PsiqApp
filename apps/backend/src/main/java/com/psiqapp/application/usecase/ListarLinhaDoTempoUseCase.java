package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.RepositoryPacientePort;
import com.psiqapp.application.port.out.RepositoryRegistroClinicoPort;
import com.psiqapp.domain.modelo.RegistroClinico;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import java.util.UUID;

public class ListarLinhaDoTempoUseCase {
    private final RepositoryPacientePort pacientes;
    private final RepositoryRegistroClinicoPort registros;

    public ListarLinhaDoTempoUseCase(RepositoryPacientePort pacientes, RepositoryRegistroClinicoPort registros) {
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
