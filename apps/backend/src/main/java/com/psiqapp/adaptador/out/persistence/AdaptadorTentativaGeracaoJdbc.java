package com.psiqapp.adaptador.out.persistence;

import com.psiqapp.aplicacao.port.RepositorioTentativaGeracaoPort;
import com.psiqapp.dominio.modelo.TentativaGeracao;
import java.sql.Timestamp;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdaptadorTentativaGeracaoJdbc implements RepositorioTentativaGeracaoPort {
    private final JdbcTemplate jdbc;

    AdaptadorTentativaGeracaoJdbc(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public TentativaGeracao salvar(TentativaGeracao tentativa) {
        jdbc.update("""
                insert into analysis_attempt
                (id, generation_id, attempt_number, started_at, finished_at, outcome, error_code,
                 duration_ms, provider_request_id, input_tokens, output_tokens)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, tentativa.id(), tentativa.geracaoId(), tentativa.numero(),
                Timestamp.from(tentativa.iniciadaEm()),
                tentativa.finalizadaEm() == null ? null : Timestamp.from(tentativa.finalizadaEm()),
                tentativa.resultado(), tentativa.codigoErro(), tentativa.duracaoMs(),
                tentativa.providerRequestId(), tentativa.inputTokens(), tentativa.outputTokens());
        return tentativa;
    }
}
