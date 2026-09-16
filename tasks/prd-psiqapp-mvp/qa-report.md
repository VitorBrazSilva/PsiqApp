# QA Report - PsiqApp MVP

## Status
REPROVADO

## Matriz de rastreabilidade
| Requisito/AC | Verificacao | Resultado | Evidencia |
|---|---|---|---|
| RF-001 a RF-006 | E2E cadastro, busca e agenda | NAO VALIDADO | Backend indisponivel; `npm run e2e` falhou por `ECONNREFUSED`. |
| RF-007 a RF-010 | E2E parecer, complemento e timeline | NAO VALIDADO | Backend indisponivel. |
| RF-011 a RF-019 | E2E analise, evidencias, falha e retry | NAO VALIDADO | Backend indisponivel; nenhum provider real utilizado. |
| RF-020 / isolamento | Dois pacientes com registros distintos | NAO VALIDADO | Fixture criada, mas setup API falhou com HTTP 502. |
| RNF-004 / dados ficticios | Aviso persistente no frontend | PARCIAL | Assercao validada no navegador, mas fluxos completos nao foram concluidos. |
| RNF-008 / volume inicial | Massa ficticia representativa | NAO VALIDADO | Backend nao compilou no ambiente local. |

## Verificacoes executadas

- `docker compose --env-file .env.example -f infra/compose.yaml config --quiet` - APROVADO.
- `cd apps/frontend && npm run typecheck` - APROVADO.
- `cd apps/frontend && npm run lint` - APROVADO.
- `cd apps/frontend && npm test -- --run` - APROVADO, 5 arquivos e 35 testes.
- `cd apps/frontend && npm run build` - APROVADO.
- `cd apps/frontend && npm run e2e` - REPROVADO, 4 cenarios; backend retornou `ECONNREFUSED`.
- `cd apps/backend && ./mvnw.cmd verify` - REPROVADO antes dos testes, por JDK 8 incompatível com release 21.

## Requisitos nao funcionais

Checks frontend e validacao sintatica do Compose passaram. Integracao PostgreSQL, tempos de fluxo e volume nao foram evidenciados.

## Seguranca / privacidade

Fixtures usam somente dados ficticios. Nenhum provider externo foi chamado. A verificacao de logs do backend nao foi possivel porque o backend nao iniciou; portanto nao ha aprovacao desta area.

## Integracoes e falhas

A suite inclui cenarios de cadastro, prontuario, complemento, evidencia, isolamento e estado pendente. Os cenarios de falha/timeout/schema do provider permanecem sem evidencia E2E devido ao bloqueio do backend.

## Bugs encontrados

- BUG-11-001 e BUG-11-002 em `bugs.md`, ambos bloqueantes para a aprovacao integrada.

## Riscos residuais

QA integrado, seguranca clinica operacional, isolamento em runtime e worker com PostgreSQL continuam sem demonstracao neste ambiente.

## Veredito

Reprovado. Repetir os checks em ambiente com JDK 21, backend iniciado e PostgreSQL/Testcontainers disponivel.
