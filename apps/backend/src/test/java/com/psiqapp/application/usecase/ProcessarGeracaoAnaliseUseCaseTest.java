package com.psiqapp.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;

import com.psiqapp.application.port.out.*;
import com.psiqapp.application.servico.*;
import com.psiqapp.domain.modelo.*;
import java.time.*;
import java.util.*;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;

class ProcessarGeracaoAnaliseUseCaseTest {
    private final UUID pacienteId = UUID.randomUUID();
    private final UUID geracaoId = UUID.randomUUID();
    private final UUID registroId = UUID.randomUUID();
    private final Instant agora = Instant.parse("2026-09-15T12:00:00Z");

    @Test
    void erroTransitorioAgendaRetrySemPublicarAnalise() {
        var fixture = fixture(s -> { throw new FalhaProviderException("TIMEOUT", true, null); });

        var resultado = fixture.usecase.executarUma();

        assertThat(resultado).isEqualTo(ProcessarGeracaoAnaliseUseCase.Resultado.RETRY_AGENDADO);
        assertThat(fixture.geracoes.estado).isEqualTo(EstadoGeracaoAnalise.RETRY_WAIT);
        assertThat(fixture.geracoes.failureCode).isEqualTo("TIMEOUT");
        assertThat(fixture.geracoes.nextAttemptAt).isAfter(agora);
        assertThat(fixture.analises.salvas).isEmpty();
        assertThat(fixture.tentativas.salvas).singleElement()
                .extracting(TentativaGeracao::resultado).isEqualTo("RETRY_WAIT");
    }

    @Test
    void erroPermanenteMarcaFalhaTerminal() {
        var fixture = fixture(s -> { throw new FalhaProviderException("INVALID_CREDENTIAL", false, null); });

        var resultado = fixture.usecase.executarUma();

        assertThat(resultado).isEqualTo(ProcessarGeracaoAnaliseUseCase.Resultado.FALHA_TERMINAL);
        assertThat(fixture.geracoes.estado).isEqualTo(EstadoGeracaoAnalise.FAILED);
        assertThat(fixture.geracoes.failureCode).isEqualTo("INVALID_CREDENTIAL");
        assertThat(fixture.analises.salvas).isEmpty();
    }

    @Test
    void respostaInvalidaNaoPublicaParcial() {
        var fixture = fixture(s -> new ProvedorAnaliseClinicaPort.ResponseProvider(
                new AnaliseResponseValidator.Response(List.of(
                        new AnaliseResponseValidator.ItemResponse("Item sem evidencia.",
                                NaturezaObservacao.RELATO, List.of())),
                        List.of(), List.of(), List.of()),
                "fake", null, null));

        var resultado = fixture.usecase.executarUma();

        assertThat(resultado).isEqualTo(ProcessarGeracaoAnaliseUseCase.Resultado.FALHA_TERMINAL);
        assertThat(fixture.geracoes.estado).isEqualTo(EstadoGeracaoAnalise.FAILED);
        assertThat(fixture.geracoes.failureCode).isEqualTo("INVALID_RESPONSE_ANALISE");
        assertThat(fixture.analises.salvas).isEmpty();
    }

    private Fixture fixture(ProvedorAnaliseClinicaPort provedor) {
        var registro = new RegistroClinico(registroId, pacienteId, TipoRegistroClinico.PARECER, null, null,
                agora.minusSeconds(60), agora.minusSeconds(30), "Registro clinico ficticio.", null, null, 1);
        var registros = new RegistrosFake(registro);
        var geracoes = new GeracoesFake(new GeracaoAnalise(geracaoId, pacienteId, GatilhoGeracaoAnalise.AUTO,
                registroId, 1, 1, agora, EstadoGeracaoAnalise.QUEUED, 1, 1, 0, registroId,
                ModoAnalise.RESUMO, null));
        var analises = new AnalisesFake();
        var tentativas = new TentativasFake();
        var usecase = new ProcessarGeracaoAnaliseUseCase(geracoes, analises, tentativas,
                new SnapshotAnaliseAssembler(registros), new AnaliseResponseValidator(new CatalogoSegurancaClinica()),
                provedor, Supplier::get, Clock.fixed(agora, ZoneOffset.UTC),
                new ProcessarGeracaoAnaliseUseCase.Config(Duration.ofSeconds(120), Duration.ofSeconds(180),
                        Duration.ofSeconds(240), Duration.ofSeconds(5), Duration.ofSeconds(20), 3));
        return new Fixture(usecase, geracoes, analises, tentativas);
    }

    private record Fixture(ProcessarGeracaoAnaliseUseCase usecase, GeracoesFake geracoes,
            AnalisesFake analises, TentativasFake tentativas) {}

    private static class GeracoesFake implements RepositoryGeracaoAnalisePort {
        private final GeracaoAnalise geracao;
        EstadoGeracaoAnalise estado = EstadoGeracaoAnalise.QUEUED;
        String failureCode;
        Instant nextAttemptAt;
        UUID token;

        GeracoesFake(GeracaoAnalise geracao) {
            this.geracao = geracao;
        }

        public GeracaoAnalise salvar(GeracaoAnalise geracao) { return geracao; }
        public Optional<GeracaoAnalise> buscarPorRegistroDisparador(UUID registroId) { return Optional.empty(); }
        public Optional<GeracaoAnalise> buscarPorIdNoPaciente(UUID pacienteId, UUID geracaoId) { return Optional.empty(); }
        public Optional<GeracaoAnalise> buscarAtiva(UUID pacienteId) { return Optional.empty(); }
        public Optional<GeracaoAnalise> buscarMaisRecente(UUID pacienteId) { return Optional.empty(); }
        public Optional<GeracaoReservada> reivindicarProxima(Instant agora, Instant leaseExpiraEm, UUID leaseToken,
                int maxTentativas) {
            this.token = leaseToken;
            this.estado = EstadoGeracaoAnalise.RUNNING;
            return Optional.of(new GeracaoReservada(geracao, leaseToken, leaseExpiraEm, 1));
        }
        public boolean concluirComSucesso(UUID geracaoId, UUID leaseToken, Instant agora) {
            estado = EstadoGeracaoAnalise.COMPLETED;
            return token.equals(leaseToken);
        }
        public boolean concluirComFalha(UUID geracaoId, UUID leaseToken, ResultadoFalha falha, Instant agora) {
            if (!token.equals(leaseToken)) return false;
            estado = falha.terminal() ? EstadoGeracaoAnalise.FAILED : EstadoGeracaoAnalise.RETRY_WAIT;
            failureCode = falha.codigoFalha();
            nextAttemptAt = falha.proximaTentativaEm();
            return true;
        }
    }

    private static class RegistrosFake implements RepositoryRegistroClinicoPort {
        private final RegistroClinico registro;
        RegistrosFake(RegistroClinico registro) { this.registro = registro; }
        public RegistroClinico salvar(RegistroClinico registro) { return registro; }
        public Optional<RegistroClinico> buscarNoPaciente(UUID pacienteId, UUID registroId) { return Optional.of(registro); }
        public Optional<RegistroClinico> buscarOriginalNoPaciente(UUID pacienteId, UUID registroId) { return Optional.of(registro); }
        public Pagina<RegistroClinico> listarLinhaDoTempo(UUID pacienteId, int pagina, int tamanho) {
            return new Pagina<>(List.of(registro), pagina, tamanho, 1);
        }
        public EstatisticasSnapshot estatisticasDoPaciente(UUID pacienteId) {
            return new EstatisticasSnapshot(1, 1, 0, registro.id());
        }
        public EstatisticasSnapshot estatisticasDoPacienteAteRevisao(UUID pacienteId, long revisao) {
            return estatisticasDoPaciente(pacienteId);
        }
        public List<RegistroClinico> listarSnapshot(UUID pacienteId, long revisaoSnapshot) { return List.of(registro); }
    }

    private static class AnalisesFake implements RepositoryAnaliseClinicaPort {
        final List<AnaliseClinica> salvas = new ArrayList<>();
        public AnaliseClinica salvar(AnaliseClinica analise) { salvas.add(analise); return analise; }
        public Optional<AnaliseClinica> buscarAtual(UUID pacienteId) { return Optional.empty(); }
        public Optional<AnaliseClinica> buscarNoPaciente(UUID pacienteId, UUID analiseId) { return Optional.empty(); }
        public Pagina<GeracaoAnalise> listarGeracoes(UUID pacienteId, int pagina, int tamanho) {
            return new Pagina<>(List.of(), pagina, tamanho, 0);
        }
    }

    private static class TentativasFake implements RepositoryTentativaGeracaoPort {
        final List<TentativaGeracao> salvas = new ArrayList<>();
        public TentativaGeracao salvar(TentativaGeracao tentativa) { salvas.add(tentativa); return tentativa; }
    }
}
