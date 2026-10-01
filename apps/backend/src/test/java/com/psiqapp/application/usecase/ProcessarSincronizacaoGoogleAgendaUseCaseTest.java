package com.psiqapp.application.usecase;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort.Estado;
import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort.Trabalho;
import com.psiqapp.domain.modelo.StatusConsulta;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProcessarSincronizacaoGoogleAgendaUseCaseTest {
    private static final Instant AGORA = Instant.parse("2026-10-01T13:00:00Z");
    private static final UUID CONSULTA = UUID.fromString("1c6c7f14-0922-4ee0-a92d-fadf23eb0831");
    private static final String ID_EVENTO = CONSULTA.toString().replace("-", "");
    private final RepositorySincronizacaoConsultaPort sincronizacoes = mock(RepositorySincronizacaoConsultaPort.class);
    private final ConexaoGoogleAgendaPort conexao = mock(ConexaoGoogleAgendaPort.class);
    private final GoogleAgendaCalendarioPort calendario = mock(GoogleAgendaCalendarioPort.class);
    private final GoogleAgendaConfiguracaoPort configuracao = mock(GoogleAgendaConfiguracaoPort.class);
    private final ProcessarSincronizacaoGoogleAgendaUseCase caso = new ProcessarSincronizacaoGoogleAgendaUseCase(
            sincronizacoes, conexao, calendario, configuracao, Clock.fixed(AGORA, ZoneOffset.UTC));

    @BeforeEach
    void preparar() {
        when(conexao.estado()).thenReturn("CONECTADA");
        when(configuracao.configurado()).thenReturn(true);
        when(conexao.obter()).thenReturn(Optional.of(new ConexaoGoogleAgendaPort.Conexao("token-ficticio", AGORA)));
        when(sincronizacoes.reivindicarVencidas(any(), any(), eq(20))).thenReturn(List.of(trabalho(1, StatusConsulta.AGENDADA)));
    }

    @Test
    void timeoutAmbiguoReconciliaEventoPeloIdentificadorEstavelSemDuplicar() {
        when(calendario.consultaAssociada("token-ficticio", ID_EVENTO))
                .thenReturn(Optional.empty(), Optional.of(CONSULTA.toString()));
        doThrow(new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.TRANSITORIA))
                .when(calendario).criarEvento(eq("token-ficticio"), eq(ID_EVENTO), any());

        caso.processarLote();

        verify(calendario).criarEvento(eq("token-ficticio"), eq(ID_EVENTO), any());
        verify(calendario).atualizarEvento(eq("token-ficticio"), eq(ID_EVENTO), any());
        verify(sincronizacoes).concluir(CONSULTA, 7, AGORA);
        verify(sincronizacoes, never()).reagendar(any(), org.mockito.ArgumentMatchers.anyInt(), any(), any(), any());
    }

    @Test
    void quintaFalhaTransitoriaEncerraRetryAutomatico() {
        when(calendario.consultaAssociada("token-ficticio", ID_EVENTO)).thenReturn(Optional.empty());
        doThrow(new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.TRANSITORIA))
                .when(calendario).criarEvento(eq("token-ficticio"), eq(ID_EVENTO), any());
        when(sincronizacoes.reivindicarVencidas(any(), any(), eq(20))).thenReturn(List.of(trabalho(5, StatusConsulta.AGENDADA)));

        caso.processarLote();

        verify(sincronizacoes).falhar(CONSULTA, 7, "TRANSITORIA", AGORA);
        verify(sincronizacoes, never()).reagendar(any(), org.mockito.ArgumentMatchers.anyInt(), any(), any(), any());
    }

    @Test
    void consultaCanceladaSemEventoEConcluidaSemCriarOuRemoverEvento() {
        when(sincronizacoes.reivindicarVencidas(any(), any(), eq(20)))
                .thenReturn(List.of(trabalho(1, StatusConsulta.CANCELADA)));
        when(calendario.consultaAssociada("token-ficticio", ID_EVENTO)).thenReturn(Optional.empty());

        caso.processarLote();

        verify(calendario, never()).criarEvento(any(), any(), any());
        verify(calendario, never()).removerEvento(any(), any());
        verify(sincronizacoes).concluir(CONSULTA, 7, AGORA);
    }

    @Test
    void falhaDeAutorizacaoMarcaConexaoIndisponivel() {
        when(calendario.consultaAssociada("token-ficticio", ID_EVENTO))
                .thenThrow(new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.AUTORIZACAO));

        caso.processarLote();

        verify(conexao).marcarIndisponivel(AGORA);
        verify(sincronizacoes).falhar(CONSULTA, 7, "AUTORIZACAO", AGORA);
    }

    private Trabalho trabalho(int tentativas, StatusConsulta status) {
        return new Trabalho(CONSULTA, ID_EVENTO, Estado.PENDENTE, tentativas, 7, AGORA,
                status, "Paciente Fictício", "paciente@example.test");
    }
}
