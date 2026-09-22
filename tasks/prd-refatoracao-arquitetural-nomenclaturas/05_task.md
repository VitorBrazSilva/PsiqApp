# Task 5.0 — API HTTP e contratos de erro

## Objetivo

Atualizar rotas, parâmetros, DTOs, campos JSON, respostas de erro e OpenAPI para o contrato público canônico em português, sem alterar a semântica das operações.

## Rastreabilidade

- PRD: RF-003, RF-006, RF-007, RF-008, RNF-001, RNF-004, RNF-006
- TechSpec: TS-005, TS-010, TS-011
- Critérios de aceite: AC-RF003-01 a AC-RF003-04, AC-RF006-01, AC-RF006-04, AC-RF006-05, AC-RF007-01, AC-RF007-03, AC-RF008-02

## Dependências

Tasks 2.0, 3.0 e 4.0.

## Escopo

- Renomear endpoints e query params conforme TS-005, incluindo pacientes, consultas, registros clínicos, gerações e análises.
- Manter `/health/readiness` como exceção técnica operacional documentada.
- Atualizar classes de Controller, Request/Response DTOs, mappers e nomes de campos para o contrato final.
- Atualizar paginação (`itens`, `pagina`, `tamanho`, `total`), datas UTC, CPF mascarado, status HTTP e headers técnicos.
- Atualizar `Problem Details`, preservando campos reservados do RFC 9457 e traduzindo campos próprios como `codigo`, `errosDeCampo` e `idRequisicao`.
- Atualizar OpenAPI e testes de contrato para o estado final.
- Remover aliases, redirects e compatibilidade dupla; rotas antigas devem deixar de ser expostas.

## Fora do escopo da task

- Alterar regras de negócio, validações, transações, idempotência ou comportamento clínico.
- Alterar o cliente HTTP ou componentes frontend; isso pertence à Task 6.0.
- Traduzir headers técnicos `Idempotency-Key`, `X-Request-Id` e `Accept`.
- Expor mensagens brutas do provider, SQL, dados clínicos ou valores rejeitados.

## Subtarefas

- [x] 5.1 Atualizar Controllers, rotas e query params.
- [x] 5.2 Atualizar Request/Response DTOs e mappers HTTP.
- [x] 5.3 Atualizar Problem Details e tratamento seguro de erros.
- [x] 5.4 Atualizar OpenAPI e contratos internos consumidos pelo frontend.
- [x] 5.5 Confirmar ausência de rotas e campos antigos nos consumidores ativos.

## Critérios de sucesso

- Todas as rotas e campos afetados usam a nomenclatura final portuguesa.
- As operações mantêm status, validações, paginação, datas, idempotência e semântica anteriores.
- Rotas antigas retornam 404 e não aparecem no OpenAPI ativo.
- Contratos de erro permanecem interoperáveis, seguros e sem exposição de dados sensíveis.
- O contrato final está pronto para consumo direto pelo frontend, sem adaptador de compatibilidade.

## Testes obrigatórios

- [x] Testes de contrato HTTP para rotas, métodos, status 201/202/200 e campos finais.
- [x] Testes de paginação, datas UTC, CPF mascarado e headers de correlação/idempotência.
- [x] Testes de Problem Details, validação, recurso ausente, conflito e erro interno.
- [x] Testes confirmando 404 para rotas antigas e ausência delas no OpenAPI.
- [x] Testes de isolamento entre pacientes e idempotência das criações protegidas.
- [x] `./mvnw --batch-mode --no-transfer-progress verify`.

## Skills aplicáveis

Nenhuma skill especializada. Aplicar as Rules de privacidade, segurança clínica, invariantes e qualidade.

## Arquivos/módulos prováveis

`apps/backend/src/main/java/com/psiqapp/adapter/in/web/`, mappers HTTP, handler de erros, OpenAPI e testes de contrato/API.
