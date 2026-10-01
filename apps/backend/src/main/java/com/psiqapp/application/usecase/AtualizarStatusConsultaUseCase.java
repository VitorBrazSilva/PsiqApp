package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.TransactionRunnerPort;
import com.psiqapp.domain.modelo.Consulta;
import com.psiqapp.domain.modelo.StatusConsulta;
import com.psiqapp.domain.validation.ConflitoException;
import com.psiqapp.domain.validation.ErroDeValidacao;
import com.psiqapp.domain.validation.Normalizadores;
import com.psiqapp.domain.exception.RecursoNaoEncontradoException;
import java.time.Clock;
import java.util.ArrayList;
import java.util.UUID;

public class AtualizarStatusConsultaUseCase {
    private final RepositoryConsultaPort consultas;
    private final TransactionRunnerPort transacao;
    private final Clock relogio;
    private final RepositorySincronizacaoConsultaPort sincronizacoes;
    private final ConexaoGoogleAgendaPort conexao;

    public AtualizarStatusConsultaUseCase(RepositoryConsultaPort consultas, TransactionRunnerPort transacao,
            Clock relogio, RepositorySincronizacaoConsultaPort sincronizacoes, ConexaoGoogleAgendaPort conexao) {
        this.consultas = consultas;
        this.transacao = transacao;
        this.relogio = relogio;
        this.sincronizacoes = sincronizacoes;
        this.conexao = conexao;
    }

    public Consulta executar(UUID id, StatusConsulta novoStatus) {
        return transacao.executar(() -> {
            var erros = new ArrayList<ErroDeValidacao>();
            if (novoStatus == null || novoStatus == StatusConsulta.AGENDADA) {
                erros.add(new ErroDeValidacao("status", "Status invalido."));
            }
            Normalizadores.validarSemErros(erros);
            Consulta atual = consultas.buscarPorId(id).orElseThrow(RecursoNaoEncontradoException::new);
            if (atual.status().finalizado()) throw new ConflitoException();
            boolean atualizada = consultas.atualizarStatusSeAgendada(id, novoStatus, relogio.instant());
            if (!atualizada) throw new ConflitoException();
            Consulta resultado = consultas.buscarPorId(id).orElseThrow(RecursoNaoEncontradoException::new);
            String estadoConexao = conexao.estado();
            var estado = "CONECTADA".equals(estadoConexao)
                    ? RepositorySincronizacaoConsultaPort.Estado.PENDENTE
                    : RepositorySincronizacaoConsultaPort.Estado.AGUARDANDO_CONEXAO;
            sincronizacoes.solicitar(id, estado, relogio.instant());
            return resultado;
        });
    }
}
