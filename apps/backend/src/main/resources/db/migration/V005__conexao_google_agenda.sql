CREATE TABLE conexao_google_agenda (
    id UUID PRIMARY KEY,
    estado VARCHAR(24) NOT NULL CHECK (estado IN ('CONECTADA', 'DESCONECTADA', 'INDISPONIVEL')),
    refresh_token_iv VARCHAR(24),
    refresh_token_cifrado VARCHAR(4096),
    atualizada_em TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_conexao_google_agenda_credencial CHECK (
        (estado = 'CONECTADA' AND refresh_token_iv IS NOT NULL AND refresh_token_cifrado IS NOT NULL)
        OR (estado <> 'CONECTADA' AND refresh_token_iv IS NULL AND refresh_token_cifrado IS NULL)
    )
);
