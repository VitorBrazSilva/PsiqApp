# Task 4.0 — Domínio, enums e worker de análise

## Objetivo

Uniformizar modelos de domínio, enumerações, payload de análise e componentes do worker sem alterar invariantes clínicos ou o fluxo assíncrono.

## Rastreabilidade

- PRD: RF-001, RF-003, RF-004, RF-006, RNF-001, RNF-006
- TechSpec: TS-007, TS-009, TS-010
- Critérios de aceite: AC-RF006-02 a AC-RF006-05, AC-RF008-02, AC-RF008-04

## Dependências

Tasks 2.0 e 3.0.

## Escopo

- Renomear enums, modelos e payload JSONB para o contrato canônico.
- Atualizar provider fake, adapter OpenAI, montagem de snapshot, validação e worker.
- Preservar retry, lease, backoff, processamento pós-commit e histórico append-only.
- Aplicar campos próprios portugueses nos erros técnicos, mantendo campos RFC e headers convencionais.

## Fora do escopo da task

Alterar regras de segurança clínica, usar análise anterior como fonte ou adicionar integração externa nova.

## Subtarefas

- [ ] 4.1 Atualizar domínio e enums.
- [ ] 4.2 Atualizar payload, mappers e validação.
- [ ] 4.3 Atualizar worker, configuração e provider fake.

## Critérios de sucesso

O processamento mantém isolamento, rastreabilidade de evidências, limitações e persistência clínica independente da IA.

## Testes obrigatórios

- [ ] Unitários de payload, enums, validação e regras clínicas.
- [ ] Integração do worker com provider fake.
- [ ] Timeout, erro e resposta inválida do provider.
- [ ] Zero/um/múltiplos pareceres, retry e ausência de diagnóstico/prescrição indevidos.

## Skills aplicáveis

Nenhuma skill especializada.

## Arquivos/módulos prováveis

Domínio, serviços de aplicação, adapters de IA, worker/scheduler, configuração e testes backend.
