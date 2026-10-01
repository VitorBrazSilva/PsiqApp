package com.psiqapp.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class VerificarDisponibilidadeConsultaUseCaseTest {
    private static final Instant INICIO = Instant.parse("2026-10-01T13:00:00Z");
    private final RepositoryConsultaPort consultas = mock(RepositoryConsultaPort.class);
    private final ConexaoGoogleAgendaPort conexao = mock(ConexaoGoogleAgendaPort.class);
    private final GoogleAgendaCalendarioPort calendario = mock(GoogleAgendaCalendarioPort.class);
    private final GoogleAgendaConfiguracaoPort configuracao = mock(GoogleAgendaConfiguracaoPort.class);
    private final Clock relogio = Clock.fixed(INICIO, ZoneOffset.UTC);
    private final VerificarDisponibilidadeConsultaUseCase caso = new VerificarDisponibilidadeConsultaUseCase(
            consultas, conexao, calendario, configuracao, relogio);

    @BeforeEach
    void preparar() {
        when(consultas.existeAgendadaSobreposta(INICIO, INICIO.plusSeconds(3_600))).thenReturn(false);
    }

    @Test
    void consultaLocalAgendadaBloqueiaSemAcessarGoogle() {
        when(consultas.existeAgendadaSobreposta(INICIO, INICIO.plusSeconds(3_600))).thenReturn(true);

        var resultado = caso.executar(INICIO);

        assertThat(resultado.estado()).isEqualTo(VerificarDisponibilidadeConsultaUseCase.Estado.OCUPADO);
        verify(conexao, never()).estado();
        verify(calendario, never()).consultarOcupacao(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void contaGoogleDesconectadaMantemVerificacaoLocal() {
        when(conexao.estado()).thenReturn("DESCONECTADA");

        var resultado = caso.executar(INICIO);

        assertThat(resultado.estado()).isEqualTo(VerificarDisponibilidadeConsultaUseCase.Estado.DISPONIVEL);
        assertThat(resultado.conexaoAtiva()).isFalse();
        verify(calendario, never()).consultarOcupacao(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void intervalosGoogleUsamInstantesComInicioInclusivoEFimExclusivo() {
        when(conexao.estado()).thenReturn("CONECTADA");
        when(configuracao.configurado()).thenReturn(true);
        when(conexao.obter()).thenReturn(Optional.of(new ConexaoGoogleAgendaPort.Conexao("token-ficticio", INICIO)));
        when(calendario.consultarOcupacao("token-ficticio", INICIO, INICIO.plusSeconds(3_600))).thenReturn(List.of(
                new GoogleAgendaCalendarioPort.Intervalo(INICIO.minusSeconds(3_600), INICIO),
                new GoogleAgendaCalendarioPort.Intervalo(INICIO.plusSeconds(3_600), INICIO.plusSeconds(7_200))));

        var resultado = caso.executar(INICIO);

        assertThat(resultado.estado()).isEqualTo(VerificarDisponibilidadeConsultaUseCase.Estado.DISPONIVEL);
        assertThat(resultado.conexaoAtiva()).isTrue();
    }

    @Test
    void indisponibilidadeGoogleNaoViraConflitoERevogacaoInvalidaConexao() {
        when(conexao.estado()).thenReturn("CONECTADA");
        when(configuracao.configurado()).thenReturn(true);
        when(conexao.obter()).thenReturn(Optional.of(new ConexaoGoogleAgendaPort.Conexao("token-ficticio", INICIO)));
        when(calendario.consultarOcupacao("token-ficticio", INICIO, INICIO.plusSeconds(3_600)))
                .thenThrow(new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.AUTORIZACAO));

        var resultado = caso.executar(INICIO);

        assertThat(resultado.estado()).isEqualTo(VerificarDisponibilidadeConsultaUseCase.Estado.INDISPONIVEL);
        verify(conexao).marcarIndisponivel(INICIO);
    }
}
