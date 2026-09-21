package com.psiqapp.application.usecase;

import com.psiqapp.domain.modelo.GeracaoAnalise;
import com.psiqapp.domain.modelo.RegistroClinico;
import com.psiqapp.domain.modelo.TipoRegistroClinico;
import com.psiqapp.domain.validation.ConflitoException;
import com.psiqapp.application.port.out.RepositoryGeracaoAnalisePort;
import com.psiqapp.application.port.out.RepositoryRegistroClinicoPort;
import com.psiqapp.application.port.out.TransactionRunnerPort;
import java.time.Instant;
import java.util.UUID;

public class CriarParecerUseCase {
    public record Comando(UUID pacienteId, String texto, String humor, String medicamentos,
            Instant dataHoraClinica, UUID consultaId, UUID chaveIdempotencia) {}
    public record Resultado(RegistroClinico registro, GeracaoAnalise geracao) {}

    private static final String OPERACAO = "CRIAR_PARECER";
    private final CriarRegistroClinicoServico criador;
    private final IdempotenciaServico idempotencia;
    private final RepositoryRegistroClinicoPort registros;
    private final RepositoryGeracaoAnalisePort geracoes;
    private final TransactionRunnerPort transacao;

    public CriarParecerUseCase(CriarRegistroClinicoServico criador, IdempotenciaServico idempotencia,
            RepositoryRegistroClinicoPort registros, RepositoryGeracaoAnalisePort geracoes,
            TransactionRunnerPort transacao) {
        this.criador = criador;
        this.idempotencia = idempotencia;
        this.registros = registros;
        this.geracoes = geracoes;
        this.transacao = transacao;
    }

    public Resultado executar(Comando comando) {
        return idempotencia.serializar(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(),
                () -> transacao.executar(() -> {
            var existente = idempotencia.existente(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(), comando);
            if (existente.isPresent()) {
                var registroId = existente.get().recursoId();
                var registro = registros.buscarNoPaciente(comando.pacienteId(), registroId)
                        .orElseThrow(ConflitoException::new);
                var geracao = geracoes.buscarPorRegistroDisparador(registroId).orElseThrow(ConflitoException::new);
                return new Resultado(registro, geracao);
            }
            var resultado = criador.criar(new CriarRegistroClinicoServico.Entrada(TipoRegistroClinico.ORIGINAL,
                    comando.pacienteId(), null, comando.consultaId(), comando.dataHoraClinica(),
                    comando.texto(), comando.humor(), comando.medicamentos()));
            idempotencia.registrar(OPERACAO, comando.pacienteId(), comando.chaveIdempotencia(), comando,
                    "REGISTRO_CLINICO", resultado.registro().id(), 201);
            return new Resultado(resultado.registro(), resultado.geracao());
        }));
    }

}
