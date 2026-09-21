package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryConsultaPort;
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

    public AtualizarStatusConsultaUseCase(RepositoryConsultaPort consultas, TransactionRunnerPort transacao, Clock relogio) {
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
