# Task 6.0 - backend-analysis-core

## Objetivo

Implementar o núcleo persistente de análise clínica: modelo de geração/análise/evidência/tentativa, snapshot, validações determinísticas, auditoria e contratos backend de consulta/regeneração, sem executar chamadas ao provider externo.

## Rastreabilidade

- PRD: RF-010, RF-011, RF-012, RF-013, RF-014, RF-015, RF-016, RF-017, RF-018, RF-019, RF-020; RNF-002, RNF-003, RNF-005, RNF-006
- TechSpec: TS-007, TS-010, TS-011, TS-012, TS-014, TS-015, TS-016, TS-017, TS-018, TS-019, TS-020, TS-021, TS-022, TS-023, TS-024, TS-025, TS-026, TS-027, TS-037, TS-038
- Critérios de aceite: AC-RF010-01 a AC-RF019-10; AC-RF020-03 a AC-RF020-05, no que depende de modelo, persistência, contrato e validação determinística

## Dependências

- 1.0 infra-bootstrap
- 2.0 backend-bootstrap
- 5.0 backend-clinical-records

## Escopo

- Domínio `GeracaoAnalise`, `AnaliseClinica`, `EvidenciaAnalise`, `TentativaGeracao` e enums relacionados.
- Migrations de análise, evidência e tentativa, incluindo proteção append-only para análises concluídas e evidências.
- Regras de snapshot por `revisaoClinica`, `requestSequence`, análise atual e desempate por snapshot/solicitação.
- Cálculo de modo `SUMMARY_ONLY` e `LONGITUDINAL`, incluindo zero originais sem geração publicável e `patterns` vazio em resumo.
- Contratos e DTOs para consulta de estado, histórico, análise atual e regeneração manual.
- Validação determinística de schema, evidências, campos permitidos, citações literais normalizadas por whitespace e catálogo de segurança.
- Auditoria técnica de geração/tentativas sem persistir resposta clínica rejeitada completa, prompt com prontuário ou secrets.
- Fakes/fixtures de ports internos do core para testes de casos de uso sem rede externa, sem confundir com o `FakeAnaliseClinicaAdaptador` da task 07, pertencente ao provider.

## Fora do escopo da task

- Worker com polling, lease, `FOR UPDATE SKIP LOCKED`, retry/backoff e execução assíncrona real.
- Adapter real OpenAI e chamadas ao provider externo.
- Tela de análise no frontend.
- Segunda chamada de revisão semântica, RAG, embeddings ou resumo incremental.

## Subtarefas

- [ ] 6.1 Criar domínio `GeracaoAnalise`, `AnaliseClinica`, `EvidenciaAnalise`, `TentativaGeracao`, estados e motivos de falha.
- [ ] 6.2 Criar migrations para análise, evidência, tentativa, auditoria e triggers append-only aplicáveis.
- [ ] 6.3 Implementar regra de análise atual por maior `snapshotRevision` e, em empate, maior `requestSequence`.
- [ ] 6.4 Criar `MontadorSnapshotAnalise` com aliases temporários, minimização de dados e isolamento por paciente.
- [ ] 6.5 Criar `ValidadorRespostaAnalise`, `CatalogoSegurancaClinica` e validação de evidências.
- [ ] 6.6 Criar casos de uso de consulta: estado da geração, análise atual, histórico de gerações e evidências.
- [ ] 6.7 Criar `SolicitarRegeneracaoAnaliseCasoDeUso` com idempotência, bloqueio de regeneração quando houver geração ativa e incremento de `requestSequence`.
- [ ] 6.8 Implementar endpoints backend de consulta de análise, histórico, evidências e regeneração manual.
- [ ] 6.9 Implementar auditoria de metadados permitidos por geração/tentativa.

## Critérios de sucesso

- O backend possui modelo persistente completo para análises sem depender do worker real.
- Geração antiga concluída por último não substitui análise mais atual por snapshot.
- Evidência inválida, de outro paciente, de campo não permitido ou sem citação literal é rejeitada.
- `SUMMARY_ONLY` nunca apresenta falsa tendência com um único parecer original.
- Regeneração manual cria nova geração auditável e idempotente, sem duplicar por duplo clique.
- Logs e auditoria preservam apenas metadados permitidos.

## Testes obrigatórios

- [ ] Unitários de modos zero, um e dois ou mais pareceres originais.
- [ ] Unitários de validação de schema, evidências, citações e catálogo de segurança clínica.
- [ ] Integração com Testcontainers para migrations, triggers append-only, análise atual e desempate por snapshot/requestSequence.
- [ ] Testes de concorrência para regeneração manual e requestSequence.
- [ ] Testes de idempotência da regeneração manual.
- [ ] Testes de que análises anteriores não são usadas como fonte clínica.
- [ ] Testes de isolamento por paciente em snapshot, evidências e análise atual.
- [ ] Testes HTTP de consulta de estado, histórico, evidências e regeneração manual.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/backend/src/main/java/com/psiqapp/dominio/modelo/GeracaoAnalise.java`
- `apps/backend/src/main/java/com/psiqapp/dominio/modelo/AnaliseClinica.java`
- `apps/backend/src/main/java/com/psiqapp/dominio/modelo/EvidenciaAnalise.java`
- `apps/backend/src/main/java/com/psiqapp/dominio/modelo/TentativaGeracao.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/usecase/SolicitarRegeneracaoAnaliseCasoDeUso.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/usecase/ObterAnaliseAtualCasoDeUso.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/servico/MontadorSnapshotAnalise.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/servico/ValidadorRespostaAnalise.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/servico/CatalogoSegurancaClinica.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/AnaliseControlador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/out/persistence/RepositorioGeracaoAnaliseJpaAdaptador.java`
- `apps/backend/src/main/resources/db/migration/V003__analises_evidencias_auditoria.sql`
