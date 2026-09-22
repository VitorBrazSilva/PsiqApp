# QA Report — Refatoração arquitetural e nomenclaturas

## Status
APROVADO

## Matriz de rastreabilidade
| Requisito/AC | Verificação | Resultado | Evidência |
|---|---|---|---|
| RF-001..RF-005, RF-008 / AC clínicos e de persistência | Testes unitários e integração backend, incluindo PostgreSQL/Testcontainers | PASS | `mvnw verify`: 22 unitários + 23 integração, 0 falhas |
| RF-006 / AC-RF006-01..05 | `ClinicalRecordsIT`, `AnalysisCoreIT`, `AnalysisWorkerIT` | PASS | append-only, snapshot, isolamento, IA assíncrona, retry/falhas e evidências |
| RF-007 / AC-RF007-01..04 | Contratos HTTP, teste de bootstrap, arquitetura, frontend e E2E | PASS | rotas/campos finais, rotas antigas 404, fronteiras e fluxos atualizados |
| RF-008 / AC-RF008-01..04 | frontend, Compose e E2E | PASS | typecheck, lint, 35 testes, build, Compose e 5 E2E |
| RNF-001..006 | qualidade, segurança, privacidade e observabilidade | PASS | `ArquiteturaTest`, `LogsSegurosTest`, `HttpErrorHandlerTest`, integrações |

## Verificações executadas
- `apps/backend/.\mvnw.cmd --batch-mode --no-transfer-progress verify` — PASS; 45 testes totais, 0 falhas, incluindo Testcontainers PostgreSQL.
- `apps/frontend/npm run typecheck` — PASS.
- `apps/frontend/npm run lint` — PASS.
- `apps/frontend/npm test -- --run` — PASS; 5 arquivos, 35 testes.
- `apps/frontend/npm run build` — PASS.
- `apps/frontend/npm run e2e` — PASS; 5 testes Chromium.
- `docker compose --env-file .env.example -f infra/compose.yaml config --quiet` — PASS.
- O E2E validou cadastro/busca/abertura, consulta, parecer/complemento/evidência, isolamento entre pacientes, aviso de dados fictícios e histórico insuficiente.

## Requisitos não funcionais
Arquitetura, compilação, lint, build, integração, E2E, configuração e observabilidade passaram. Não foi executado teste de carga/performance dedicado; não há RNF mensurável desse tipo exigido para o gate atual.

## Segurança / privacidade
PASS com dados fictícios e provider fake. Testes cobrem logs seguros, Problem Details, isolamento de paciente, limites de evidência e ausência de chamada real ao provider.

## Integrações e falhas
PASS. Testes cobrem banco PostgreSQL via Testcontainers, migrations, contratos HTTP, idempotência/conflitos, falhas de IA, retry/worker e rotas antigas retornando 404.

## Bugs encontrados
Nenhum bug bloqueante ou não bloqueante reproduzido. Warnings do Mockito sobre agente dinâmico e do Node sobre `NO_COLOR` não alteram o resultado dos testes.

## Riscos residuais
- A validação E2E foi executada contra o servidor Vite e mocks/fixtures do fluxo, sem ambiente externo real.
- A execução com dados reais e provider externo permanece fora do escopo, conforme PRD e Rules.

## Veredito
QA aprovado. Não há critério de aceite obrigatório sem evidência nem falha obrigatória aberta.
