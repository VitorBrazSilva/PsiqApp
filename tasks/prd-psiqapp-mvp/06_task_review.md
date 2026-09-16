# Review - Task 06

## Status
APROVADO

Revisao executada em 2026-09-15 segundo `sdd-workflow/execute_task.md`, sobre a branch `task/06-backend-analysis-core`.

## Rastreabilidade
| Origem | ID | Status | Evidencia |
|---|---|---|---|
| PRD | RF-010 | Atendido no escopo | `AnalysisCoreIT` cobre estado de geracao ativa e historico; geracao automatica continua persistida sem processamento externo. |
| PRD | RF-011 | Atendido | `SolicitarRegeneracaoAnaliseCasoDeUso` cria geracao manual `QUEUED`, bloqueia quando ha geracao ativa e usa idempotencia. |
| PRD | RF-012/RF-013 | Atendido no core | `MontadorSnapshotAnalise` monta snapshot somente de `clinical_record` do paciente ate a revisao, sem analises anteriores como fonte. |
| PRD | RF-014/RF-015/RF-016 | Atendido no core | `ValidadorRespostaAnaliseTest` cobre zero/um/dois por modo, evidencias, citacao literal, campos permitidos e `SUMMARY_ONLY` sem patterns. |
| PRD | RF-017/RF-018/RF-019 | Atendido no core | Migration V003 cria `clinical_analysis`, `analysis_evidence` e `analysis_attempt`; analise atual usa maior snapshot/sequence; falhas permanecem em `analysis_generation`. |
| PRD | RF-020-03 a RF-020-05 | Atendido | Snapshot, analises e evidencias sao filtrados/relacionados por paciente; FKs compostas impedem associacao cruzada. |
| PRD | RNF-002/RNF-003/RNF-005/RNF-006 | Atendido | Sem chamadas externas; auditoria persistente; catalogo conservador de seguranca; Problem Details sem conteudo clinico sensivel. |
| TechSpec | TS-007, TS-010, TS-011 | Atendido no escopo | Modelo persistente de geracao/snapshot e consulta; worker/lease/retry real permanecem fora da task. |
| TechSpec | TS-015 a TS-020 | Atendido no core | Validacao deterministica de payload/evidencia/seguranca e auditoria de tentativa sem resposta rejeitada completa. |
| TechSpec | TS-021 a TS-027 | Atendido | Constraints/FKs, transacao para regeneracao, REST/JSON, Problem Details, paginacao e `Instant`/`Clock`. |
| TechSpec | TS-037/TS-038 | Atendido | Migration V003 e endpoints `/analysis-state`, `/analysis-generations` e `/analyses/{id}`. |

## Arquivos revisados

- `apps/backend/src/main/java/com/psiqapp/dominio/modelo/*Analise*`, `TentativaGeracao`, enums de evidencia/secao/natureza.
- `apps/backend/src/main/java/com/psiqapp/aplicacao/servico/*Analise*`, `CatalogoSegurancaClinica`.
- `apps/backend/src/main/java/com/psiqapp/aplicacao/usecase/*Analise*`.
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/*Analise*`.
- `apps/backend/src/main/java/com/psiqapp/adaptador/out/persistence/*Analise*` e ports alterados.
- `apps/backend/src/main/resources/db/migration/V003__analises_evidencias_auditoria.sql`.
- `apps/backend/src/test/java/com/psiqapp/AnalysisCoreIT.java` e `ValidadorRespostaAnaliseTest.java`.

## Problemas bloqueantes

Nenhum.

## Problemas nao bloqueantes

- A persistencia de tentativa ainda e estrutural/auditavel por tabela, sem caso de uso dedicado para gravar tentativas; isso pertence ao worker real da Task 07.
- A validacao semantica permanece deterministica e conservadora, como especificado; nao substitui revisao clinica adversarial futura.

## Testes e verificacoes executadas

- `./mvnw.cmd test -DskipITs`: aprovado, 19 testes unitarios.
- `./mvnw.cmd verify`: aprovado, 19 testes unitarios e 16 testes de integracao com Testcontainers PostgreSQL 18.6.

## Pontos positivos

- A Task 06 nao introduz chamadas externas, worker real, lease, polling, retry/backoff ou adapter OpenAI.
- Snapshot usa registros clinicos originais/complementos e nao usa analises anteriores.
- Evidencias sao normalizadas e persistidas separadamente para rastreabilidade.
- Regeneracao manual e idempotente e bloqueada quando ha geracao ativa.

## Veredito

Task 06 aprovada no escopo especificado. Nao ha blockers pendentes.
