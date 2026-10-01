package com.psiqapp.application.port.out;

import com.psiqapp.domain.modelo.StatusConsulta;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Persistência da intenção e do estado recuperável de cada evento de consulta. */
public interface RepositorySincronizacaoConsultaPort {
    void criar(UUID consultaId, String idEvento, Estado estado, Instant agora);
    boolean solicitar(UUID consultaId, Estado estado, Instant agora);
    Optional<Situacao> buscar(UUID consultaId);
    Map<UUID, Situacao> listar(List<UUID> consultaIds);
    List<Trabalho> reivindicarVencidas(Instant agora, Instant expiraEm, int limite);
    boolean concluir(UUID consultaId, int versao, Instant agora);
    boolean aguardarConexao(UUID consultaId, int versao, Instant agora);
    boolean reagendar(UUID consultaId, int versao, String categoriaErro, Instant proximaTentativa, Instant agora);
    boolean falhar(UUID consultaId, int versao, String categoriaErro, Instant agora);
    boolean tentarNovamente(UUID consultaId, Estado estado, Instant agora);

    enum Estado { AGUARDANDO_CONEXAO, PENDENTE, SINCRONIZADA, FALHA }

    record Situacao(Estado estado, Instant ultimaTentativa) {}

    record Trabalho(UUID consultaId, String idEvento, Estado estado, int tentativas, int versao,
            Instant agendadaPara, StatusConsulta status, String nomePaciente, String emailPaciente) {}
}
