# Task 7.0 - backend-analysis-worker

## Objetivo

Implementar o processamento assíncrono persistente das gerações de análise clínica, com fila PostgreSQL, lease, retry, provider OpenAI atrás de port e finalização transacional.

## Rastreabilidade

- PRD: RF-010, RF-011, RF-012, RF-013, RF-014, RF-015, RF-016, RF-017, RF-018, RF-019; RNF-002, RNF-003, RNF-005, RNF-006, RNF-007
- TechSpec: TS-011, TS-012, TS-014, TS-015, TS-016, TS-017, TS-018, TS-019, TS-020, TS-021, TS-022, TS-023, TS-034, TS-035, TS-037
- Critérios de aceite: AC-RF010-01 a AC-RF019-10, no que depende de processamento assíncrono, provider, retry e publicação final

## Dependências

- 1.0 infra-bootstrap
- 2.0 backend-bootstrap
- 5.0 backend-clinical-records
- 6.0 backend-analysis-core

## Escopo

- Worker único com polling de 2s, uma geração por vez, reserva persistida, token, TTL e reivindicação por `FOR UPDATE SKIP LOCKED`.
- Estados operacionais `QUEUED`, `RUNNING`, `RETRY_WAIT`, `COMPLETED` e `FAILED`.
- Retry controlado com até 3 tentativas, backoff, jitter, respeito a `Retry-After` e contagem ao adquirir reserva.
- Port `ProvedorAnaliseClinicaPort` e adapter `OpenAiAnaliseClinicaAdaptador`.
- Integração com SDK oficial Java da OpenAI, Responses API e Structured Outputs com JSON Schema.
- Timeouts e limites configuráveis por env, incluindo timeout da chamada, orçamento da tentativa e TTL da reserva.
- Uso das validações do core antes de publicar a análise.
- Finalização atômica: análise, evidências, auditoria e estado `COMPLETED` somente com reserva válida.
- Tratamento de resultado tardio, reserva expirada, falhas transitórias e falhas definitivas.

## Fora do escopo da task

- Modelo persistente, DTOs e validações centrais já entregues no `backend-analysis-core`, exceto ajustes pequenos exigidos pela integração.
- Tela de análise no frontend.
- Testes reais contra OpenAI ou dependência de rede externa.
- Segunda chamada de revisão semântica, RAG, embeddings ou resumo incremental.

## Subtarefas

- [ ] 7.1 Criar `ProcessarGeracaoAnaliseCasoDeUso` usando snapshot, provider, validação e finalização do core.
- [ ] 7.2 Implementar reivindicação de geração elegível por `requestedAt ASC`, `id ASC` com `FOR UPDATE SKIP LOCKED`.
- [ ] 7.3 Implementar reserva com token, `reservationExpiresAt`, orçamento de tentativa e rejeição de resultado tardio.
- [ ] 7.4 Implementar retry/backoff para timeout, conexão, 429 e 5xx; encerrar sem retry para contexto excedido, credencial inválida, schema inválido ou conteúdo inseguro.
- [ ] 7.5 Criar scheduler/poller do worker com configuração para habilitar/desabilitar no ambiente local/testes.
- [ ] 7.6 Criar `ProvedorAnaliseClinicaPort`, fake provider determinístico e adapter OpenAI configurável por env.
- [ ] 7.7 Desativar retries automáticos internos do SDK e registrar request ID/tokens quando disponíveis.
- [ ] 7.8 Persistir tentativa, duração, código de resultado e auditoria permitida.
- [ ] 7.9 Garantir que chamada externa à IA nunca ocorre dentro de transação ou lock do paciente.

## Critérios de sucesso

- Salvar prontuário e processar análise são processos desacoplados.
- Falha, timeout ou resposta inválida não alteram prontuário nem análise válida anterior.
- Uma resposta tardia sem reserva válida não publica análise.
- Reservas expiradas podem ser recuperadas sem deixar jobs presos.
- `RETRY_WAIT` libera o worker para outra geração elegível.
- Nenhum teste automatizado depende de rede externa.
- Logs e auditoria não guardam prontuário completo, resposta rejeitada completa ou secrets.

## Testes obrigatórios

- [ ] Integração com Testcontainers para `SKIP LOCKED`, reserva, expiração, retry, rollback de finalização e concorrência entre workers simulados.
- [ ] Testes com fake provider para timeout, erro transitório, erro permanente, resposta truncada, schema inválido e resposta insegura.
- [ ] Testes de que chamada externa ocorre fora da transação.
- [ ] Testes de resultado tardio e token de reserva inválido.
- [ ] Testes de orçamento de tentativa, TTL e limite de 3 tentativas.
- [ ] Testes de isolamento por paciente no contexto enviado ao provider fake.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/backend/src/main/java/com/psiqapp/aplicacao/port/out/ProvedorAnaliseClinicaPort.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/usecase/ProcessarGeracaoAnaliseCasoDeUso.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/out/ai/OpenAiAnaliseClinicaAdaptador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/out/ai/FakeAnaliseClinicaAdaptador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/out/persistence/RepositorioFilaGeracaoAnaliseJpaAdaptador.java`
- `apps/backend/src/main/java/com/psiqapp/configuracao/WorkerAnaliseConfiguracao.java`
- `apps/backend/src/main/java/com/psiqapp/configuracao/OpenAiConfiguracao.java`

