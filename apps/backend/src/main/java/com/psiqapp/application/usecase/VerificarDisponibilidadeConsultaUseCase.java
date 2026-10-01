package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

public class VerificarDisponibilidadeConsultaUseCase {
    private static final Duration DURACAO_CONSULTA = Duration.ofHours(1);

    public enum Estado { DISPONIVEL, OCUPADO, INDISPONIVEL }

    public record Resultado(Estado estado, Instant verificadoEm, boolean conexaoAtiva) {}

    private final RepositoryConsultaPort consultas;
    private final ConexaoGoogleAgendaPort conexao;
    private final GoogleAgendaCalendarioPort calendario;
    private final GoogleAgendaConfiguracaoPort configuracao;
    private final Clock relogio;

    public VerificarDisponibilidadeConsultaUseCase(RepositoryConsultaPort consultas,
            ConexaoGoogleAgendaPort conexao, GoogleAgendaCalendarioPort calendario,
            GoogleAgendaConfiguracaoPort configuracao, Clock relogio) {
        this.consultas = consultas;
        this.conexao = conexao;
        this.calendario = calendario;
        this.configuracao = configuracao;
        this.relogio = relogio;
    }

    public Resultado executar(Instant inicio) {
        if (inicio == null) throw new IllegalArgumentException("O início da consulta é obrigatório.");
        Instant fim = inicio.plus(DURACAO_CONSULTA);
        if (consultas.existeAgendadaSobreposta(inicio, fim)) return resultado(Estado.OCUPADO, false);

        String estadoConexao = conexao.estado();
        if ("INDISPONIVEL".equals(estadoConexao)) return resultado(Estado.INDISPONIVEL, false);
        if (!"CONECTADA".equals(estadoConexao)) return resultado(Estado.DISPONIVEL, false);
        if (!configuracao.configurado()) return resultado(Estado.INDISPONIVEL, false);

        var credencial = conexao.obter();
        if (credencial.isEmpty()) {
            conexao.marcarIndisponivel(relogio.instant());
            return resultado(Estado.INDISPONIVEL, false);
        }
        try {
            boolean ocupada = calendario.consultarOcupacao(credencial.get().refreshToken(), inicio, fim).stream()
                    .anyMatch(intervalo -> intervalo.inicio().isBefore(fim) && intervalo.fim().isAfter(inicio));
            return resultado(ocupada ? Estado.OCUPADO : Estado.DISPONIVEL, true);
        } catch (FalhaGoogleAgendaException falha) {
            if (falha.tipo() == FalhaGoogleAgendaException.Tipo.AUTORIZACAO) {
                conexao.marcarIndisponivel(relogio.instant());
            }
            return resultado(Estado.INDISPONIVEL, false);
        }
    }

    private Resultado resultado(Estado estado, boolean conexaoAtiva) {
        return new Resultado(estado, relogio.instant(), conexaoAtiva);
    }
}
