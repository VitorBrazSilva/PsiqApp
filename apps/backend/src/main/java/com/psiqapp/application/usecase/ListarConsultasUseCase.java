package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.domain.modelo.Consulta;
import java.time.Instant;
import java.util.UUID;

public class ListarConsultasUseCase {
    private final RepositoryConsultaPort consultas;

    public ListarConsultasUseCase(RepositoryConsultaPort consultas) {
        this.consultas = consultas;
    }

    public Pagina<Consulta> executar(Instant de, Instant ate, UUID pacienteId, Integer pagina, Integer tamanho) {
        int p = Paginacao.pagina(pagina);
        int t = Paginacao.tamanho(tamanho);
        Paginacao.validar(p, t);
        return consultas.listar(de, ate, pacienteId, p, t);
    }
}
