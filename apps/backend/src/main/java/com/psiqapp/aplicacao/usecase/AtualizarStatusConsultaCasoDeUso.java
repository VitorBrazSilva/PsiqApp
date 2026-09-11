package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.RepositorioConsultaPort;
import com.psiqapp.aplicacao.port.TransactionRunnerPort;
import com.psiqapp.dominio.modelo.Consulta;
import com.psiqapp.dominio.modelo.StatusConsulta;
import com.psiqapp.dominio.validacao.ConflitoException;
import com.psiqapp.dominio.validacao.ErroDeValidacao;
import com.psiqapp.dominio.validacao.Normalizadores;
import com.psiqapp.dominio.validacao.RecursoNaoEncontradoException;
import java.time.Clock;
import java.util.ArrayList;
import java.util.UUID;

public class AtualizarStatusConsultaCasoDeUso {
    private final RepositorioConsultaPort consultas;
    private final TransactionRunnerPort transacao;
    private final Clock relogio;

    public AtualizarStatusConsultaCasoDeUso(RepositorioConsultaPort consultas, TransactionRunnerPort transacao, Clock relogio) {
        this.consultas = consultas;
        this.transacao = transacao;
        this.relogio = relogio;
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
            return consultas.buscarPorId(id).orElseThrow(RecursoNaoEncontradoException::new);
        });
    }
}
