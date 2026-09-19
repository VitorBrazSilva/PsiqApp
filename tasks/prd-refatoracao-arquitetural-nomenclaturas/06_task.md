# Task 6.0 — Frontend e consumidores internos

## Objetivo

Alinhar estrutura, nomes de domínio, serviços, tipos, componentes, mocks e chamadas do frontend ao contrato HTTP final.

## Rastreabilidade

- PRD: RF-001, RF-003, RF-005, RF-007, RNF-001, RNF-004
- TechSpec: TS-004, TS-005, TS-011
- Critérios de aceite: AC-RF003-02, AC-RF003-03, AC-RF007-02, AC-RF007-03

## Dependências

Task 5.0.

## Escopo

- Renomear features e diretórios para os conceitos portugueses definidos.
- Atualizar tipos, serviços, componentes, hooks, mocks e fixtures.
- Preservar `ApiClient` como único ponto de acesso HTTP.
- Atualizar mensagens e tratamento de `ApiError`.

## Fora do escopo da task

Alterar comportamento visual ou funcional não relacionado à nomenclatura e ao contrato.

## Subtarefas

- [ ] 6.1 Renomear estrutura `features`, `app` e `shared` afetada.
- [ ] 6.2 Atualizar tipos, serviços e componentes.
- [ ] 6.3 Atualizar mocks, testes Vitest e Playwright.

## Critérios de sucesso

Os fluxos frontend consomem apenas o contrato final, sem `fetch` direto ou referências funcionais antigas.

## Testes obrigatórios

- [ ] Typecheck, lint e testes unitários.
- [ ] Testes de integração do ApiClient.
- [ ] E2E de pacientes, consultas, registros, análise e isolamento.
- [ ] Provider fake indisponível sem perda do registro clínico.

## Skills aplicáveis

Nenhuma skill especializada.

## Arquivos/módulos prováveis

`apps/frontend/src`, `apps/frontend/e2e`, mocks, fixtures e configuração Vite/Playwright.
