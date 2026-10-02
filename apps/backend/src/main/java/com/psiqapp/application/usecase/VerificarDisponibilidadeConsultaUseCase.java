package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.application.servico.ConsultarOcupacaoGoogleAgendaServico;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

public class VerificarDisponibilidadeConsultaUseCase {
    public enum Estado { DISPONIVEL, OCUPADO, INDISPONIVEL }

    public record Resultado(Estado estado, Instant verificadoEm, boolean conexaoAtiva) {}

    private final RepositoryConsultaPort consultas;
    private final ConsultarOcupacaoGoogleAgendaServico google;
    private final Clock relogio;

    public VerificarDisponibilidadeConsultaUseCase(RepositoryConsultaPort consultas,
            ConsultarOcupacaoGoogleAgendaServico google, Clock relogio) {
        this.consultas = consultas;
        this.google = google;
        this.relogio = relogio;
    }

    public Resultado executar(Instant inicio) {
        if (inicio == null) throw new IllegalArgumentException("O início da consulta é obrigatório.");
        Instant fim = inicio.plusSeconds(com.psiqapp.domain.modelo.DisponibilidadeAgenda.DURACAO_SEGUNDOS);
        if (consultas.existeAgendadaSobreposta(inicio, fim)) return resultado(Estado.OCUPADO, false);
        try {
            var ocupacao = google.consultar(inicio, fim);
            boolean ocupada = ocupacao.intervalos().stream()
                    .anyMatch(intervalo -> intervalo.inicio().isBefore(fim) && intervalo.fim().isAfter(inicio));
            return resultado(ocupada ? Estado.OCUPADO : Estado.DISPONIVEL, ocupacao.conexaoAtiva());
        } catch (GoogleAgendaIndisponivelException falha) {
            return resultado(Estado.INDISPONIVEL, false);
        }
    }

    private Resultado resultado(Estado estado, boolean conexaoAtiva) {
        return new Resultado(estado, relogio.instant(), conexaoAtiva);
    }
}
