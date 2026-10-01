CREATE TABLE sincronizacao_consulta_google (
    consulta_id UUID PRIMARY KEY REFERENCES consulta(id) ON DELETE RESTRICT,
    google_event_id VARCHAR(64) NOT NULL UNIQUE,
    estado VARCHAR(24) NOT NULL CHECK (estado IN ('AGUARDANDO_CONEXAO', 'PENDENTE', 'SINCRONIZADA', 'FALHA')),
    tentativas INTEGER NOT NULL DEFAULT 0 CHECK (tentativas BETWEEN 0 AND 5),
    proxima_tentativa TIMESTAMPTZ NOT NULL,
    ultima_tentativa TIMESTAMPTZ,
    ultimo_erro VARCHAR(40),
    versao INTEGER NOT NULL DEFAULT 0,
    atualizada_em TIMESTAMPTZ NOT NULL
);

CREATE INDEX ix_sincronizacao_consulta_google_vencidas
    ON sincronizacao_consulta_google (proxima_tentativa, consulta_id)
    WHERE estado IN ('AGUARDANDO_CONEXAO', 'PENDENTE');

CREATE INDEX ix_consulta_agendada_para_agendada
    ON consulta (agendada_para)
    WHERE status = 'AGENDADA';
