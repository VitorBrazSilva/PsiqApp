# Task 1.0 — Inventário e matriz de nomenclatura

## Objetivo

Congelar o mapeamento de nomes antigos e finais, componentes afetados, consumidores e exceções históricas antes da refatoração.

## Rastreabilidade

- PRD: RF-001, RF-002, RF-003, RF-004, RF-007, RNF-004, RNF-005
- TechSpec: TS-001, TS-011
- Critérios de aceite: AC-RF001-01 a AC-RF001-03, AC-RF002-01 a AC-RF002-03, AC-RF007-01, AC-RF008-03

## Dependências

Nenhuma. É a primeira task.

## Escopo

- Produzir a matriz de nomenclatura português/inglês conforme o papel do componente.
- Inventariar backend, frontend, API, persistência, testes, fixtures, OpenAPI, configuração e documentação.
- Definir allowlist exclusiva para V001–V003 e testes explícitos de upgrade.
- Registrar decisões MANTER, RENOMEAR, SEPARAR ou JUSTIFICAR_MANUTENÇÃO.

## Fora do escopo da task

Alterar código de produção, contratos, banco ou documentação viva.

## Subtarefas

- [ ] 1.1 Levantar referências ativas e históricas.
- [ ] 1.2 Consolidar matriz antigo → final e rastreabilidade RF/RNF → TS.
- [ ] 1.3 Definir scan automatizado e sua allowlist.

## Critérios de sucesso

A matriz cobre todos os consumidores previstos e permite identificar qualquer referência antiga não intencional.

## Testes obrigatórios

- [ ] Scan inicial de referências com allowlist documentada.
- [ ] Validação de consistência da matriz com a TechSpec.
- [ ] Casos de erro: nomes ambíguos, exceções técnicas e referências históricas.

## Skills aplicáveis

Nenhuma skill especializada; seguir rules de arquitetura, documentação e qualidade.

## Arquivos/módulos prováveis

`tasks/prd-refatoracao-arquitetural-nomenclaturas/`, `apps/`, `infra/`, `docs/`, `README.md` e workflows.
