# Manutenção documental — Task 02

## Decisão

- `docs/BUSINESS.md`: atualizado com as regras atuais de disponibilidade, sincronização, eventos mínimos, legado e limite da interface pendente.
- `docs/TECHNICAL.md`: atualizado com Calendar API, ports/adapters, transações, tabelas V005/V006, índices, contratos HTTP, worker, retries, privacidade e testes.
- `README.md`: atualizado com configuração/execução do worker e alcance atual do backend; task 3.0 da interface identificada como pendente.
- `.env.example` e `infra/compose.yaml`: documentam/repassam as duas opções do worker com valores padrão, sem secrets reais.

## Revisão

A documentação foi comparada com o código final, migration V006, contratos HTTP, testes, Task 02 e os reviews aprovados. Ela descreve apenas disponibilidade e sincronização no backend; não afirma que a interface React ou testes contra Google real estão prontos. Consultas legadas permanecem sem backfill e retornam `NAO_APLICAVEL`.

## Status

Concluída após task-reviewer e code-reviewer e antes do commit, conforme `sdd-workflow/execute_task.md`.
