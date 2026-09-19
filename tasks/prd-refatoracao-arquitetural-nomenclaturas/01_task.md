# Task 1.0 — Inventário e matriz de nomenclatura

## Objetivo

Congelar o estado atual, o mapeamento antigo → final, os consumidores afetados, as exceções técnicas e as decisões de responsabilidade antes das alterações de código, contrato e persistência.

## Rastreabilidade

- PRD: RF-001, RF-002, RF-003, RF-004, RF-007, RF-008, RNF-004, RNF-005
- TechSpec: TS-001, TS-011
- Critérios de aceite: AC-RF001-01 a AC-RF001-03, AC-RF002-01 a AC-RF002-03, AC-RF003-02, AC-RF004-01, AC-RF005-01, AC-RF007-01, AC-RF008-03

## Dependências

Nenhuma. Esta é a primeira task da feature.

## Escopo

- Inventariar nomes, pacotes, classes, arquivos, imports, rotas, query params, headers próprios, campos JSON, tabelas, colunas, enums, índices, constraints, triggers, configurações, testes, fixtures, OpenAPI e documentação afetados.
- Consolidar a matriz de nomenclatura com as colunas `atual`, `final`, `tipo`, `papel`, `decisão`, `requisito`, `TS relacionado`, `consumidores` e `evidência esperada`.
- Registrar para cada componente a decisão `MANTER`, `RENOMEAR`, `SEPARAR` ou `JUSTIFICAR_MANUTENÇÃO`, incluindo a justificativa quando a nomenclatura antiga for permitida.
- Detalhar o mapeamento legado → canônico do JSONB de análise, incluindo chaves de seções, itens, natureza, evidências, campos, citações e limitações.
- Detalhar os valores antigos e finais dos enums persistidos e seus checks, incluindo tipo de registro, estado, gatilho, modo, seção, campo e natureza.
- Definir o scan automatizado de resíduos, distinguindo referências funcionais ativas de referências históricas permitidas em V001–V003, testes explícitos de upgrade e tabelas de mapeamento da própria documentação.
- Registrar a matriz `RF/RNF → TS → Task → teste/evidência` que será atualizada nas tasks seguintes.

## Fora do escopo da task

- Alterar código de produção, migrations, contratos HTTP, frontend ou documentação viva.
- Corrigir nomes inventariados nesta etapa.
- Executar a refatoração ou implementar o scan como comportamento de produto.

## Subtarefas

- [ ] 1.1 Levantar referências ativas e históricas em backend, frontend, infraestrutura, documentação, testes e migrations.
- [ ] 1.2 Consolidar a matriz completa de nomenclatura e responsabilidades.
- [ ] 1.3 Fechar o mapeamento JSONB e os valores de enums para a migration e o código.
- [ ] 1.4 Definir o escopo, a allowlist e os falsos positivos esperados do scan.
- [ ] 1.5 Validar a cobertura da matriz contra a TechSpec e o PRD.

## Critérios de sucesso

- Todos os componentes e consumidores listados na TechSpec possuem uma entrada na matriz ou uma justificativa explícita de não impacto.
- O mapeamento JSONB e de enums é determinístico e suficiente para orientar a implementação sem decisão de produto adicional.
- Toda referência antiga permitida possui motivo e localização documentados.
- A matriz permite rastrear cada mudança relevante até requisito, TS, task e evidência.

## Testes obrigatórios

- [ ] Scan inicial de referências com allowlist documentada.
- [ ] Validação de que cada item da matriz aponta para um requisito e um TS existentes.
- [ ] Casos de erro: nome ambíguo, exceção técnica não justificada, referência histórica classificada como ativa e JSONB sem mapeamento.
- [ ] Conferência de que nenhum dado real, secret ou conteúdo clínico sensível foi incluído no inventário.

## Skills aplicáveis

Nenhuma skill especializada. Aplicar as Rules de arquitetura, privacidade, documentação e qualidade.

## Arquivos/módulos prováveis

`tasks/prd-refatoracao-arquitetural-nomenclaturas/`, `apps/backend/`, `apps/frontend/`, `infra/`, `docs/`, `README.md`, `.github/workflows/` e `.agents/rules/`.
