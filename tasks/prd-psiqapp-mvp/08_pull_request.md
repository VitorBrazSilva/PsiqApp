# Pull Request - Task 08

## Título

test: valida contratos REST do backend

## Descrição

```markdown
## Objetivo

Validar e estabilizar o contrato REST do backend sob `/api/v1`, cobrindo rotas, DTOs, OpenAPI, Problem Details, paginação, datas, idempotência e privacidade, sem reimplementar casos de uso, persistência, worker ou frontend.

## Implementado

- Adicionados testes integrados de contrato HTTP para pacientes, consultas, registros clínicos, análises, paginação, datas UTC, idempotência, Problem Details e OpenAPI.
- Uniformizado o tratamento de `Idempotency-Key` ausente para passar pela validação própria e retornar Problem Details com `fieldErrors`.
- Ajustado `PacienteResposta` para expor CPF mascarado em respostas da API, preservando CPF completo apenas no armazenamento e validação internos.
- Atualizada documentação viva e arquivos SDD da Task 08 com reviews, manutenção documental e conclusão da task.

## Requisitos atendidos

### PRD

- RNF-002: salvamento clínico segue independente da conclusão da IA.
- RNF-003: contratos preservam auditabilidade de datas, registros e gerações.
- RNF-005: contratos de análise permanecem explícitos e sem expansão funcional.
- RNF-006: respostas e erros não expõem CPF completo nem payload clínico rejeitado.
- RNF-007: nenhuma alteração amplia dados enviados ao provider de IA.

### TechSpec

- TS-024: REST/JSON sob `/api/v1`, status HTTP e OpenAPI local.
- TS-025: Problem Details com `code`, `fieldErrors` quando aplicável e `requestId`.
- TS-026: paginação `page`/`size` com padrão, máximo e validação.
- TS-027: entrada ISO 8601 com offset, saída UTC e nascimento como data local.
- TS-030/TS-031: contrato backend consumível pelo cliente/polling frontend futuro.
- TS-035: privacidade operacional e ausência de entidades JPA no OpenAPI.
- TS-038: rotas e DTOs backend consolidados.

### Critérios de aceite

- Rotas `/api/v1` previstas na TechSpec validadas.
- DTOs principais validados por contrato HTTP e OpenAPI.
- Problem Details, paginação, datas UTC, idempotência e privacidade cobertos por testes.
- Nenhuma funcionalidade futura, UI, worker, regra de domínio ou persistência foi reimplementada.

## Testes executados

- `cd apps/backend && ./mvnw "-Dtest=BackendApiContractIT,PatientAppointmentIT" test`
- `cd apps/backend && ./mvnw verify`
- Resultado do `verify`: 22 testes Surefire e 23 testes Failsafe aprovados.

## Reviews

- task-reviewer: APROVADO
- code-reviewer: APROVADO

## Documentação

- `README.md`: não aplicável
- `docs/BUSINESS.md`: atualizado
- `docs/TECHNICAL.md`: atualizado

## Fora do escopo

- Não foram reimplementados casos de uso, regras de domínio, persistência, worker ou frontend.
- Não foi criado teste real contra provider externo.
- Não foram antecipadas funcionalidades das Tasks 09, 10 ou 11.

## Observações

- A criação automática do PR não pôde ser executada localmente porque o GitHub CLI (`gh`) não está instalado no ambiente. A branch foi enviada para o remote e o GitHub retornou a URL de criação manual.
```

## URL para abertura manual

https://github.com/VitorBrazSilva/PsiqApp/pull/new/task/08-backend-api-contract-validation
