package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.Pagina;
import com.psiqapp.aplicacao.port.RepositorioConsultaPort;
import com.psiqapp.dominio.modelo.Consulta;
import java.time.Instant;
import java.util.UUID;

public class ListarConsultasCasoDeUso {
    private final RepositorioConsultaPort consultas;

    public ListarConsultasCasoDeUso(RepositorioConsultaPort consultas) {
        this.consultas = consultas;
    }

    public Pagina<Consulta> executar(Instant de, Instant ate, UUID pacienteId, Integer pagina, Integer tamanho) {
        int p = Paginacao.pagina(pagina);
        int t = Paginacao.tamanho(tamanho);
        Paginacao.validar(p, t);
        return consultas.listar(de, ate, pacienteId, p, t);
    }
}
