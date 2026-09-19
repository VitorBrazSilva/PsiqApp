# Task 8.0 — Validação integrada e rastreabilidade final

## Objetivo

Comprovar a consistência da feature completa, a preservação do comportamento funcional e clínico e a rastreabilidade entre requisitos, tasks, testes e evidências.

## Rastreabilidade

- PRD: RF-006, RF-007, RF-008, RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006
- TechSpec: TS-009, TS-010, TS-011, TS-012
- Critérios de aceite: AC-RF006-01 a AC-RF006-05, AC-RF007-01 a AC-RF007-04, AC-RF008-01 a AC-RF008-04

## Dependências

Tasks 1.0 a 7.0 implementadas e revisadas.

## Escopo

- Executar o scan final de referências antigas com a allowlist aprovada.
- Executar migration upgrade com dados fictícios e validar o estado final do banco.
- Executar os checks completos de backend, frontend, build, integração, E2E e Compose definidos na TechSpec.
- Confirmar que as rotas antigas não estão expostas e que o OpenAPI, contratos, frontend, testes e documentação usam os nomes finais.
- Confirmar append-only, isolamento entre pacientes, independência da persistência clínica em relação à IA, segurança clínica e privacidade.
- Consolidar a matriz `RF/RNF → TS → Task → Code/Test → Evidence` e registrar resultados, lacunas ou regressões.
- Encaminhar qualquer falha de implementação para a task responsável, sem absorver correções amplas nesta task.

## Fora do escopo da task

- Implementar novas funcionalidades.
- Corrigir de forma ampla código pertencente a tasks anteriores.
- Alterar PRD, Rules ou TechSpec para acomodar uma falha sem decisão explícita.
- Marcar a feature como pronta quando houver check crítico falhando ou evidência ausente.

## Subtarefas

- [ ] 8.1 Executar checks backend, frontend, build, E2E e Compose.
- [ ] 8.2 Executar migration upgrade e validação antes/depois.
- [ ] 8.3 Executar scan final de referências, contratos e documentação.
- [ ] 8.4 Validar cenários clínicos, privacidade, isolamento e falhas da IA.
- [ ] 8.5 Consolidar evidências e a matriz de rastreabilidade.
- [ ] 8.6 Registrar blockers e encaminhar correções para as tasks correspondentes.

## Critérios de sucesso

- Todos os checks aplicáveis passam ou possuem lacuna explicitamente registrada.
- Não há referências funcionais antigas não justificadas.
- Banco, contratos, frontend, testes e documentação estão consistentes com o estado canônico.
- Nenhum invariante clínico, de privacidade, isolamento ou append-only foi enfraquecido.
- Cada mudança relevante possui evidência relacionada a requisito, critério de aceite, task e teste/revisão.

## Testes obrigatórios

- [ ] `apps/backend: ./mvnw --batch-mode --no-transfer-progress verify`.
- [ ] `apps/frontend: npm ci`.
- [ ] `apps/frontend: npm run typecheck`.
- [ ] `apps/frontend: npm run lint`.
- [ ] `apps/frontend: npm test -- --run`.
- [ ] `apps/frontend: npm run build`.
- [ ] `apps/frontend: npm run e2e`.
- [ ] `docker compose --env-file .env.example -f infra/compose.yaml config --quiet`.
- [ ] Scan de resíduos, migration upgrade, isolamento entre pacientes e cenários críticos de segurança clínica.

## Skills aplicáveis

Nenhuma skill especializada. Aplicar todas as Rules relevantes e os reviewers definidos no workflow SDD.

## Arquivos/módulos prováveis

Todo o monorepo, `tasks/prd-refatoracao-arquitetural-nomenclaturas/`, relatórios de testes, evidências de migration, OpenAPI e resultados de CI.
