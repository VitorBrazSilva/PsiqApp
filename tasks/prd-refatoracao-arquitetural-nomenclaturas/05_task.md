# Task 5.0 — API HTTP e contratos de erro

## Objetivo

Atualizar rotas, parâmetros, DTOs, campos JSON, Problem Details e OpenAPI para o contrato público canônico em português.

## Rastreabilidade

- PRD: RF-003, RF-006, RF-007, RNF-001, RNF-004, RNF-006
- TechSpec: TS-005, TS-010, TS-011
- Critérios de aceite: AC-RF003-01 a AC-RF003-04, AC-RF006-01, AC-RF007-03

## Dependências

Tasks 2.0, 3.0 e 4.0.

## Escopo

- Renomear endpoints e query parameters conforme TS-005.
- Atualizar request/response DTOs, paginação, datas, headers e erros próprios.
- Garantir que rotas antigas não sejam expostas.
- Atualizar OpenAPI e contratos de integração internos.

## Fora do escopo da task

Manter aliases, redirects ou compatibilidade retroativa com endpoints antigos.

## Subtarefas

- [ ] 5.1 Atualizar controllers, DTOs e mappers HTTP.
- [ ] 5.2 Atualizar Problem Details e OpenAPI.
- [ ] 5.3 Atualizar testes de contrato e rotas inexistentes.

## Critérios de sucesso

Os fluxos mantêm semântica, status, validações e idempotência usando exclusivamente o contrato final.

## Testes obrigatórios

- [ ] Testes de contrato HTTP.
- [ ] Testes de erro, paginação, datas, headers e Problem Details.
- [ ] Verificação de 404 para rotas antigas.
- [ ] Testes de isolamento e idempotência.

## Skills aplicáveis

Nenhuma skill especializada.

## Arquivos/módulos prováveis

Controllers, DTOs, mappers, handlers de erro, OpenAPI e testes de API backend.
