# Task 6.0 — Frontend e consumidores internos

## Objetivo

Alinhar a estrutura, a nomenclatura de domínio e todos os consumidores frontend ao contrato HTTP final, sem tradução em runtime nem alteração dos fluxos funcionais.

## Rastreabilidade

- PRD: RF-001, RF-003, RF-005, RF-007, RF-008, RNF-001, RNF-004
- TechSpec: TS-004, TS-005, TS-011
- Critérios de aceite: AC-RF001-01, AC-RF001-02, AC-RF003-02, AC-RF003-03, AC-RF005-04, AC-RF007-02, AC-RF007-03, AC-RF008-02

## Dependências

Task 5.0.

## Escopo

- Renomear diretórios de negócio `patients`, `appointments`, `clinical-records` e `analyses` para `pacientes`, `consultas`, `registros-clinicos` e `analises`.
- Atualizar serviços, tipos, hooks, componentes, rotas internas, imports, mocks, fixtures e mensagens para os nomes finais.
- Preservar `app`, `features`, `shared`, `api` e hooks React como papéis estruturais convencionais.
- Manter o `ApiClient` centralizado como único ponto de acesso HTTP.
- Atualizar todos os campos consumidos para camelCase português e remover os contratos antigos, sem fallback silencioso.
- Atualizar tratamento de `ApiError`, estados de geração, evidências, timeline, análise atual e regeneração.

## Fora do escopo da task

- Alterar regras de negócio, comportamento visual não relacionado à nomenclatura ou fluxos do produto.
- Fazer tradução em runtime entre contratos antigo e novo.
- Alterar backend, migrations, infraestrutura ou provider de IA.
- Adicionar dados reais a fixtures, mocks, testes ou documentação.

## Subtarefas

- [ ] 6.1 Renomear diretórios e módulos de negócio.
- [ ] 6.2 Atualizar tipos, serviços, hooks, componentes e cliente HTTP.
- [ ] 6.3 Atualizar testes Vitest, mocks e fixtures.
- [ ] 6.4 Atualizar fixtures e cenários Playwright para as rotas e campos finais.
- [ ] 6.5 Reexecutar o scan de referências antigas.

## Critérios de sucesso

- O frontend consome exclusivamente o contrato HTTP final.
- Não existem `fetch` diretos fora do `ApiClient` nem referências funcionais aos nomes antigos.
- Pacientes, consultas, registros, timeline, análise, evidências, polling e regeneração continuam funcionando.
- O isolamento entre pacientes e a persistência clínica com IA indisponível permanecem cobertos.
- TypeScript, lint, testes e build passam.

## Testes obrigatórios

- [ ] `npm run typecheck`.
- [ ] `npm run lint`.
- [ ] `npm test -- --run`.
- [ ] Testes do `ApiClient`, formulários, páginas e tratamento de erro.
- [ ] E2E de pacientes, consultas, parecer, complemento, timeline, polling, evidência e regeneração.
- [ ] E2E de isolamento entre dois pacientes e provider fake indisponível/falhando sem perda do registro clínico.
- [ ] `npm run build` e `npm run e2e`.

## Skills aplicáveis

Nenhuma skill especializada. Aplicar as Rules de privacidade, segurança clínica, invariantes e qualidade.

## Arquivos/módulos prováveis

`apps/frontend/src/app/`, `apps/frontend/src/features/`, `apps/frontend/src/shared/`, `apps/frontend/e2e/` e configurações Vite/Playwright.
