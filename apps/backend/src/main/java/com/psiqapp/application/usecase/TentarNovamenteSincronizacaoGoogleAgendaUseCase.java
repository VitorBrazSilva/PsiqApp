package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import com.psiqapp.domain.modelo.Consulta;
import java.time.Clock;
import java.util.UUID;

public class TentarNovamenteSincronizacaoGoogleAgendaUseCase {
    private final RepositoryConsultaPort consultas;
    private final RepositorySincronizacaoConsultaPort sincronizacoes;
    private final ConexaoGoogleAgendaPort conexao;
    private final Clock relogio;

    public TentarNovamenteSincronizacaoGoogleAgendaUseCase(RepositoryConsultaPort consultas,
            RepositorySincronizacaoConsultaPort sincronizacoes, ConexaoGoogleAgendaPort conexao, Clock relogio) {
        this.consultas = consultas;
        this.sincronizacoes = sincronizacoes;
        this.conexao = conexao;
        this.relogio = relogio;
    }

    public Consulta executar(UUID consultaId) {
        var consulta = consultas.buscarPorId(consultaId).orElseThrow(RecursoNaoEncontradoException::new);
        var estado = "CONECTADA".equals(conexao.estado())
                ? RepositorySincronizacaoConsultaPort.Estado.PENDENTE
                : RepositorySincronizacaoConsultaPort.Estado.AGUARDANDO_CONEXAO;
        if (!sincronizacoes.tentarNovamente(consultaId, estado, relogio.instant())) {
            throw new RecursoNaoEncontradoException();
        }
        return consulta;
    }
}
