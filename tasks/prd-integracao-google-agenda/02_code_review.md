# Code Review — Task 02

## Status
APROVADO

## Arquitetura

- Controllers adaptam HTTP e delegam para casos de uso; a aplicação depende de ports.
- SDK Calendar e chamadas Google ficam em `adapter/out/google`; JDBC e migrations ficam nos adapters de persistência.
- Domain não recebeu dependências de framework ou Google.
- ArchUnit passou sem alteração de fronteira.

## Persistência, transações e concorrência

- `pg_advisory_xact_lock` serializa escritores locais; a sobreposição é relida dentro da transação.
- Consulta, idempotência e intenção Google são gravadas atomicamente.
- FreeBusy e mutações de eventos ocorrem fora da transação local.
- O worker reivindica tarefas com `FOR UPDATE SKIP LOCKED`, lease durável e atualizações condicionadas à versão; mudanças mais recentes não são concluídas por um worker obsoleto.

## Erros e privacidade

- Exceções Google são mapeadas para categorias seguras e Problem Details genérico; detalhes do provider não chegam à API.
- Payload Google contém apenas nome, e-mail e horário; FreeBusy retorna intervalos e não persiste detalhes de eventos existentes.
- Falhas transitórias respeitam backoff e máximo de cinco tentativas; erro de autorização marca a conexão indisponível.
- Timeout de criação reconcilia pelo identificador estável e associação privada; o worker não modifica eventos com associação divergente.

## Problemas bloqueantes

Nenhum.

## Problemas não bloqueantes

- Uma mudança de disponibilidade feita diretamente no Google ainda pode ocorrer entre a consulta FreeBusy e a gravação no PostgreSQL. A chamada externa não pode compartilhar o lock/transação local; esta janela é documentada e aceita pela TS-003.

## Verificações

- `apps/backend/mvnw.cmd --batch-mode --no-transfer-progress clean verify` — aprovado, incluindo ArchUnit e integração PostgreSQL.
- `apps/backend/mvnw.cmd --batch-mode --no-transfer-progress -Dit.test=GoogleAgendaCalendarIT verify` — aprovado.
- `docker compose --env-file .env.example -f infra/compose.yaml config --quiet` — aprovado.
- `git diff --check` — aprovado.

## Veredito

Sem blockers técnicos. Aprovado.
