package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.RepositoryTentativaGeracaoPort;
import com.psiqapp.domain.modelo.TentativaGeracao;
import java.sql.Timestamp;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdapterTentativaGeracaoJdbc implements RepositoryTentativaGeracaoPort {
    private final JdbcTemplate jdbc;

    AdapterTentativaGeracaoJdbc(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public TentativaGeracao salvar(TentativaGeracao tentativa) {
        jdbc.update("""
                insert into tentativa_geracao_analise
                (id, geracao_id, numero_tentativa, iniciada_em, finalizada_em, resultado, codigo_erro,
                 duracao_ms, requisicao_provedor_id, tokens_entrada, tokens_saida)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, tentativa.id(), tentativa.geracaoId(), tentativa.numero(),
                Timestamp.from(tentativa.iniciadaEm()),
                tentativa.finalizadaEm() == null ? null : Timestamp.from(tentativa.finalizadaEm()),
                tentativa.resultado(), tentativa.codigoErro(), tentativa.duracaoMs(),
                tentativa.providerRequestId(), tentativa.inputTokens(), tentativa.outputTokens());
        return tentativa;
    }
}
