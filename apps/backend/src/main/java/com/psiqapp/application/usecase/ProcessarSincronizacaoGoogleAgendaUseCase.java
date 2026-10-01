package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort.Estado;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort.Trabalho;
import com.psiqapp.domain.modelo.StatusConsulta;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

public class ProcessarSincronizacaoGoogleAgendaUseCase {
    private static final int TAMANHO_LOTE = 20;
    private static final Duration RESERVA = Duration.ofMinutes(2);
    private static final int MAXIMO_TENTATIVAS = 5;

    private final RepositorySincronizacaoConsultaPort sincronizacoes;
    private final ConexaoGoogleAgendaPort conexao;
    private final GoogleAgendaCalendarioPort calendario;
    private final GoogleAgendaConfiguracaoPort configuracao;
    private final Clock relogio;

    public ProcessarSincronizacaoGoogleAgendaUseCase(RepositorySincronizacaoConsultaPort sincronizacoes,
            ConexaoGoogleAgendaPort conexao, GoogleAgendaCalendarioPort calendario,
            GoogleAgendaConfiguracaoPort configuracao, Clock relogio) {
        this.sincronizacoes = sincronizacoes;
        this.conexao = conexao;
        this.calendario = calendario;
        this.configuracao = configuracao;
        this.relogio = relogio;
    }

    public int processarLote() {
        if (!"CONECTADA".equals(conexao.estado()) || !configuracao.configurado()) return 0;
        var credencial = conexao.obter();
        if (credencial.isEmpty()) {
            conexao.marcarIndisponivel(relogio.instant());
            return 0;
        }
        Instant agora = relogio.instant();
        var trabalhos = sincronizacoes.reivindicarVencidas(agora, agora.plus(RESERVA), TAMANHO_LOTE);
        for (var trabalho : trabalhos) processar(trabalho, credencial.get().refreshToken());
        return trabalhos.size();
    }

    private void processar(Trabalho trabalho, String refreshToken) {
        try {
            if (!"CONECTADA".equals(conexao.estado())) {
                sincronizacoes.aguardarConexao(trabalho.consultaId(), trabalho.versao(), relogio.instant());
                return;
            }
            Optional<String> consultaVinculada = calendario.consultaAssociada(refreshToken, trabalho.idEvento());
            String consultaEsperada = trabalho.consultaId().toString();
            if (consultaVinculada.isPresent() && !consultaEsperada.equals(consultaVinculada.get())) {
                throw new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.PERMANENTE);
            }

            if (trabalho.status() == StatusConsulta.CANCELADA) {
                if (consultaVinculada.isPresent()) calendario.removerEvento(refreshToken, trabalho.idEvento());
            } else {
                var evento = new GoogleAgendaCalendarioPort.EventoConsulta(trabalho.consultaId(),
                        trabalho.nomePaciente(), trabalho.emailPaciente(), trabalho.agendadaPara(),
                        trabalho.agendadaPara().plus(Duration.ofHours(1)), trabalho.status());
                if (consultaVinculada.isPresent()) {
                    calendario.atualizarEvento(refreshToken, trabalho.idEvento(), evento);
                } else {
                    criarOuReconciliar(refreshToken, trabalho, evento);
                }
            }
            sincronizacoes.concluir(trabalho.consultaId(), trabalho.versao(), relogio.instant());
        } catch (FalhaGoogleAgendaException falha) {
            tratarFalha(trabalho, falha);
        }
    }

    private void criarOuReconciliar(String refreshToken, Trabalho trabalho,
            GoogleAgendaCalendarioPort.EventoConsulta evento) {
        try {
            calendario.criarEvento(refreshToken, trabalho.idEvento(), evento);
        } catch (FalhaGoogleAgendaException falha) {
            if (falha.tipo() != FalhaGoogleAgendaException.Tipo.TRANSITORIA) throw falha;
            Optional<String> reconciliada = calendario.consultaAssociada(refreshToken, trabalho.idEvento());
            if (reconciliada.isEmpty() || !trabalho.consultaId().toString().equals(reconciliada.get())) throw falha;
            calendario.atualizarEvento(refreshToken, trabalho.idEvento(), evento);
        }
    }

    private void tratarFalha(Trabalho trabalho, FalhaGoogleAgendaException falha) {
        Instant agora = relogio.instant();
        String categoria = falha.tipo().name();
        if (falha.tipo() == FalhaGoogleAgendaException.Tipo.AUTORIZACAO) {
            conexao.marcarIndisponivel(agora);
            sincronizacoes.falhar(trabalho.consultaId(), trabalho.versao(), categoria, agora);
            return;
        }
        if (falha.tipo() == FalhaGoogleAgendaException.Tipo.TRANSITORIA
                && trabalho.tentativas() < MAXIMO_TENTATIVAS) {
            long segundos = 15L << (trabalho.tentativas() - 1);
            sincronizacoes.reagendar(trabalho.consultaId(), trabalho.versao(), categoria,
                    agora.plusSeconds(segundos), agora);
            return;
        }
        sincronizacoes.falhar(trabalho.consultaId(), trabalho.versao(), categoria, agora);
    }
}
