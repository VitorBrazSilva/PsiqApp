package com.psiqapp.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import com.psiqapp.application.port.out.GoogleAgendaCalendarioPort;
import com.psiqapp.application.port.out.GoogleAgendaConfiguracaoPort;
import com.psiqapp.application.port.out.RepositoryConsultaPort;
import com.psiqapp.application.servico.ConsultarOcupacaoGoogleAgendaServico;
import com.psiqapp.domain.exception.ValidacaoException;
import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class ConsultarDisponibilidadeMensalUseCaseTest {
    private static final Instant AGORA = Instant.parse("2026-10-02T12:00:00Z");
    private final RepositoryConsultaPort consultas = mock(RepositoryConsultaPort.class);
    private final ConexaoGoogleAgendaPort conexao = mock(ConexaoGoogleAgendaPort.class);
    private final GoogleAgendaCalendarioPort calendario = mock(GoogleAgendaCalendarioPort.class);
    private final GoogleAgendaConfiguracaoPort configuracao = mock(GoogleAgendaConfiguracaoPort.class);
    private final ConsultarDisponibilidadeMensalUseCase caso = new ConsultarDisponibilidadeMensalUseCase(
            consultas, new ConsultarOcupacaoGoogleAgendaServico(conexao, calendario, configuracao,
                    Clock.fixed(AGORA, ZoneOffset.UTC)), Clock.fixed(AGORA, ZoneOffset.UTC));

    @Test
    void buscaUsaUmaLeituraLocalEUmaConsultaGoogleParaMesCompleto() {
        when(conexao.estado()).thenReturn("CONECTADA");
        when(configuracao.configurado()).thenReturn(true);
        when(conexao.obter()).thenReturn(java.util.Optional.of(
                new ConexaoGoogleAgendaPort.Conexao("token-ficticio", AGORA)));
        when(calendario.consultarOcupacao(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(List.of());
        when(consultas.listarIniciosAgendadosSobrepostos(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any())).thenReturn(List.of(Instant.parse("2026-10-05T13:00:00Z")));

        var resultado = caso.executar(YearMonth.of(2026, 10));

        assertThat(resultado.mes()).isEqualTo(YearMonth.of(2026, 10));
        assertThat(resultado.dias()).isNotEmpty();
        verify(consultas).listarIniciosAgendadosSobrepostos(Instant.parse("2026-10-01T03:00:00Z"),
                Instant.parse("2026-11-01T04:00:00Z"));
        verify(calendario).consultarOcupacao("token-ficticio", Instant.parse("2026-10-01T03:00:00Z"),
                Instant.parse("2026-11-01T04:00:00Z"));
    }

    @Test
    void falhaGoogleAtivaPropagaIndisponibilidadeSemRetornoParcial() {
        when(conexao.estado()).thenReturn("CONECTADA");
        when(configuracao.configurado()).thenReturn(true);
        when(conexao.obter()).thenReturn(java.util.Optional.of(
                new ConexaoGoogleAgendaPort.Conexao("token-ficticio", AGORA)));
        when(calendario.consultarOcupacao(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenThrow(new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.TRANSITORIA));

        assertThatThrownBy(() -> caso.executar(YearMonth.of(2026, 10)))
                .isInstanceOf(GoogleAgendaIndisponivelException.class);
    }

    @Test
    void rejeitaMesAnteriorAoAtualAntesDeConsultarFontes() {
        assertThatThrownBy(() -> caso.executar(YearMonth.of(2026, 9)))
                .isInstanceOf(ValidacaoException.class);
        org.mockito.Mockito.verifyNoInteractions(consultas, conexao, calendario);
    }

    @Test
    void mesOmitidoUsaClockDoServidorEConexaoAusenteMantemBuscaLocal() {
        when(conexao.estado()).thenReturn("NAO_CONFIGURADA");
        when(consultas.listarIniciosAgendadosSobrepostos(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any())).thenReturn(List.of());

        var resultado = caso.executar(null);

        assertThat(resultado.mes()).isEqualTo(YearMonth.of(2026, 10));
        assertThat(resultado.dias()).isNotEmpty();
        verify(consultas).listarIniciosAgendadosSobrepostos(Instant.parse("2026-10-01T03:00:00Z"),
                Instant.parse("2026-11-01T04:00:00Z"));
        verify(calendario, never()).consultarOcupacao(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void conexaoQueMudaDuranteConsultaGoogleInvalidaLeituraMensal() {
        when(conexao.estado()).thenReturn("CONECTADA", "DESCONECTADA");
        when(configuracao.configurado()).thenReturn(true);
        when(conexao.obter()).thenReturn(java.util.Optional.of(
                new ConexaoGoogleAgendaPort.Conexao("token-ficticio", AGORA)));
        when(calendario.consultarOcupacao(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(List.of());

        assertThatThrownBy(() -> caso.executar(YearMonth.of(2026, 10)))
                .isInstanceOf(GoogleAgendaIndisponivelException.class);
    }

    @Test
    void falhaAoMarcarConexaoComoIndisponivelNaoVazaErroDePersistencia() {
        when(conexao.estado()).thenReturn("CONECTADA");
        when(configuracao.configurado()).thenReturn(true);
        when(conexao.obter()).thenReturn(java.util.Optional.of(
                new ConexaoGoogleAgendaPort.Conexao("token-ficticio", AGORA)));
        when(calendario.consultarOcupacao(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenThrow(new FalhaGoogleAgendaException(FalhaGoogleAgendaException.Tipo.AUTORIZACAO));
        org.mockito.Mockito.doThrow(new IllegalStateException("falha de persistência"))
                .when(conexao).marcarIndisponivel(AGORA);

        assertThatThrownBy(() -> caso.executar(YearMonth.of(2026, 10)))
                .isInstanceOf(GoogleAgendaIndisponivelException.class)
                .hasMessage("Não foi possível verificar a agenda Google.");
    }
}
