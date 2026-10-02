package com.psiqapp.application.servico;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort.Intervalo;
import com.psiqapp.application.usecase.FalhaGoogleAgendaException;
import com.psiqapp.application.usecase.GoogleAgendaIndisponivelException;
import java.time.Clock;
import java.time.Instant;
import java.util.List;

/** Consulta a ocupação externa somente quando existe conexão utilizável. */
public class ConsultarOcupacaoGoogleAgendaServico {
    public record Resultado(boolean conexaoAtiva, List<Intervalo> intervalos) {}

    private final ConexaoGoogleAgendaPort conexao;
    private final GoogleAgendaCalendarioPort calendario;
    private final GoogleAgendaConfiguracaoPort configuracao;
    private final Clock relogio;

    public ConsultarOcupacaoGoogleAgendaServico(ConexaoGoogleAgendaPort conexao,
            GoogleAgendaCalendarioPort calendario, GoogleAgendaConfiguracaoPort configuracao, Clock relogio) {
        this.conexao = conexao;
        this.calendario = calendario;
        this.configuracao = configuracao;
        this.relogio = relogio;
    }

    public Resultado consultar(Instant inicio, Instant fim) {
        String estado = estadoConexao();
        if ("INDISPONIVEL".equals(estado)) throw new GoogleAgendaIndisponivelException();
        if ("DESCONECTADA".equals(estado) || "NAO_CONFIGURADA".equals(estado)
                || "NAO_CONECTADA".equals(estado)) return new Resultado(false, List.of());
        if (!"CONECTADA".equals(estado) || !configuracaoDisponivel()) {
            throw new GoogleAgendaIndisponivelException();
        }
        final java.util.Optional<ConexaoGoogleAgendaPort.Conexao> credencial;
        try {
            credencial = conexao.obter();
        } catch (RuntimeException falha) {
            throw new GoogleAgendaIndisponivelException();
        }
        if (credencial.isEmpty()) {
            marcarIndisponivelSeguro();
            throw new GoogleAgendaIndisponivelException();
        }
        final List<Intervalo> intervalos;
        try {
            intervalos = calendario.consultarOcupacao(credencial.get().refreshToken(), inicio, fim);
        } catch (FalhaGoogleAgendaException falha) {
            if (falha.tipo() == FalhaGoogleAgendaException.Tipo.AUTORIZACAO) {
                marcarIndisponivelSeguro();
            }
            throw new GoogleAgendaIndisponivelException();
        } catch (RuntimeException falha) {
            throw new GoogleAgendaIndisponivelException();
        }
        if (!"CONECTADA".equals(estadoConexao()) || !respostaValida(intervalos)) {
            throw new GoogleAgendaIndisponivelException();
        }
        return new Resultado(true, List.copyOf(intervalos));
    }

    private boolean respostaValida(List<Intervalo> intervalos) {
        if (intervalos == null) return false;
        return intervalos.stream().allMatch(intervalo -> intervalo != null && intervalo.inicio() != null
                && intervalo.fim() != null && intervalo.inicio().isBefore(intervalo.fim()));
    }

    private String estadoConexao() {
        try {
            return conexao.estado();
        } catch (RuntimeException falha) {
            throw new GoogleAgendaIndisponivelException();
        }
    }

    private boolean configuracaoDisponivel() {
        try {
            return configuracao.configurado();
        } catch (RuntimeException falha) {
            throw new GoogleAgendaIndisponivelException();
        }
    }

    private void marcarIndisponivelSeguro() {
        try {
            conexao.marcarIndisponivel(relogio.instant());
        } catch (RuntimeException falhaPersistencia) {
            // A indisponibilidade permanece segura sem propagar detalhes da infraestrutura.
        }
    }
}
