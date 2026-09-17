# QA Report - PsiqApp MVP

## Status
REPROVADO

## Matriz de rastreabilidade
| Requisito/AC | Verificacao | Resultado | Evidencia |
|---|---|---|---|
| RF-001 a RF-006 | E2E cadastro, busca e agenda | PARCIAL | Cadastro, busca e criacao de consulta passaram; transicoes de status ainda sem E2E. |
| RF-007 a RF-010 | E2E parecer, complemento e timeline | APROVADO | Parecer, complemento, timeline e evidencia passaram no navegador. |
| RF-011 a RF-019 | E2E analise, evidencias, falha e retry | PARCIAL | Analise fake SUMMARY_ONLY e limites seguros passaram; falha/timeout/retry ainda sem E2E. |
| RF-020 / isolamento | Dois pacientes com registros distintos | APROVADO | Isolamento de registros passou no navegador. |
| RNF-004 / dados ficticios | Aviso persistente no frontend | APROVADO | Assercao passou no navegador durante a suite E2E. |
| RNF-008 / volume inicial | Massa ficticia representativa | NAO VALIDADO | Ainda falta executar o cenario de volume representativo. |

## Verificacoes executadas

- `docker compose --env-file .env.example -f infra/compose.yaml config --quiet` - APROVADO.
- `cd apps/frontend && npm run typecheck` - APROVADO.
- `cd apps/frontend && npm run lint` - APROVADO.
- `cd apps/frontend && npm test -- --run` - APROVADO, 5 arquivos e 35 testes.
- `cd apps/frontend && npm run build` - APROVADO.
- `cd apps/frontend && npm run e2e` - APROVADO, 5 cenarios.
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

## Atualizacao da rodada integrada - 2026-09-16

- Ambiente Compose com PostgreSQL, backend e frontend saudaveis.
- `mvnw verify`: aprovado, com 22 testes unitarios/contexto e 23 testes de integracao.
- `npm run e2e`: aprovado, com 5 cenarios.
- O bloqueio anterior de JDK 8/backend indisponivel nao se reproduziu.
- Permanecem sem evidencia E2E dedicada: falha/timeout/retry de IA, volume representativo e varredura operacional de logs.

## Veredito

Reprovado. Repetir os checks em ambiente com JDK 21, backend iniciado e PostgreSQL/Testcontainers disponivel.
