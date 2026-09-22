# Task 4.0 — Aplicação e worker de análise

## Objetivo

Aplicar a nomenclatura final e separar responsabilidades confirmadamente distintas nos serviços de aplicação, snapshot, validação, persistência derivada, provider e worker, preservando as regras clínicas e o processamento assíncrono.

## Rastreabilidade

- PRD: RF-001, RF-003, RF-005, RF-006, RF-008, RNF-001, RNF-003, RNF-006
- TechSpec: TS-007, TS-008, TS-009, TS-010
- Critérios de aceite: AC-RF001-01, AC-RF002-01, AC-RF005-01 a AC-RF005-04, AC-RF006-01 a AC-RF006-05, AC-RF008-02, AC-RF008-04

## Dependências

Tasks 2.0 e 3.0.

## Escopo

- Atualizar modelos internos e mappers do contrato canônico de análise após a migration e os enums finais.
- Separar `CriarRegistroClinicoServico` em fluxos coesos de parecer e complemento, compartilhando somente validação/orquestração comprovadamente comum.
- Avaliar e executar a separação de adapters de registro, snapshot/estatísticas, análise persistida e evidência persistida conforme a decisão da matriz e os testes de fronteira.
- Renomear e organizar componentes de snapshot e validação para os papéis finais, como `SnapshotAnaliseAssembler` e `AnaliseResponseValidator`.
- Atualizar provider fake, adapter OpenAI e portas para o contrato interno português, sem dependência do SDK no domínio.
- Manter o worker fora da transação clínica, com retry, backoff, lease, resultado tardio, validação de resposta, auditoria e publicação append-only.
- Manter as regras de segurança: evidência do mesmo paciente e snapshot, ausência de diagnóstico fechado, prescrição, invenção ou uso de análise anterior como fonte.

## Fora do escopo da task

- Alterar rotas públicas, DTOs HTTP, query params ou nomes de campos de erro; isso pertence à Task 5.0.
- Alterar diretórios, serviços e componentes do frontend.
- Introduzir broker, microservice, event bus, RAG, embeddings, banco vetorial ou provider novo.
- Alterar regras clínicas, invariantes de produto ou uso de dados reais.

## Subtarefas

- [x] 4.1 Atualizar o contrato interno de análise, mappers e validação para os nomes canônicos.
- [x] 4.2 Executar as separações de responsabilidades confirmadas e registrar as decisões mantidas.
- [x] 4.3 Atualizar portas, provider fake, adapter OpenAI e scheduler/worker.
- [x] 4.4 Validar transações, retry, lease, idempotência, isolamento e resultado tardio.
- [x] 4.5 Reexecutar o scan de referências antigas.

## Critérios de sucesso

- Cada componente alterado possui uma responsabilidade principal clara ou uma justificativa de manutenção.
- Pareceres e complementos continuam persistidos mesmo com IA indisponível ou falhando.
- O worker processa somente snapshots clínicos do paciente e nunca usa análise anterior como fonte.
- Respostas inválidas ou inseguras não são publicadas como análise válida.
- O domínio não depende de SDK, HTTP, JPA ou detalhes do provider.

## Testes obrigatórios

- [x] Unitários dos serviços separados, mappers, enums, payload e validador.
- [ ] Testes de fronteira arquitetural e dependências entre portas, aplicação, adapters e domínio.
- [x] Provider fake para timeout, erro, resposta inválida, schema inválido e retry controlado.
- [ ] Cenários de zero, um e múltiplos pareceres originais, incluindo complementos.
- [ ] Evidência inexistente, outro paciente, fora do snapshot, campo inválido e citação inexistente.
- [ ] Ausência de diagnóstico fechado, prescrição, recomendação de dose e invenção de informação.
- [ ] Integração do worker sem rollback do registro clínico e sem sobrescrita de análise anterior.

## Skills aplicáveis

Nenhuma skill especializada. Aplicar as Rules de arquitetura, segurança clínica, privacidade, invariantes e qualidade.

## Arquivos/módulos prováveis

`apps/backend/src/main/java/com/psiqapp/application/`, `domain/`, `adapter/out/ai/`, `adapter/out/persistence/`, `config/`, scheduler/worker e testes unitários/integrados.
