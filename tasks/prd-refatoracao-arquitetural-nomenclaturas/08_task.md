# Task 8.0 — Validação integrada e rastreabilidade final

## Objetivo

Comprovar que a refatoração está consistente em todo o monorepo, preserva o comportamento e possui evidências completas.

## Rastreabilidade

- PRD: RF-006, RF-007, RF-008, RNF-001 a RNF-006
- TechSpec: TS-009, TS-010, TS-011, TS-012
- Critérios de aceite: AC-RF006-01 a AC-RF006-05, AC-RF007-01 a AC-RF007-04, AC-RF008-01 a AC-RF008-04

## Dependências

Tasks 1.0 a 7.0.

## Escopo

- Executar scan final de referências antigas com allowlist explícita.
- Executar migration upgrade e checks backend, frontend, build e E2E previstos.
- Confirmar rastreabilidade RF/RNF → TS → task → teste/evidência.
- Registrar resultados, lacunas e qualquer regressão encontrada.

## Fora do escopo da task

Corrigir implementação de forma ampla; correções devem retornar à task responsável.

## Subtarefas

- [ ] 8.1 Executar checks completos e migration upgrade.
- [ ] 8.2 Executar scan final e validar documentação/OpenAPI.
- [ ] 8.3 Consolidar evidências e matriz de rastreabilidade.

## Critérios de sucesso

Todos os checks aplicáveis passam, não há referências funcionais antigas não justificadas e as regras clínicas/privacidade permanecem protegidas.

## Testes obrigatórios

- [ ] `./mvnw --batch-mode --no-transfer-progress verify`.
- [ ] `npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build`.
- [ ] `npm run e2e`.
- [ ] `docker compose --env-file .env.example -f infra/compose.yaml config --quiet`.
- [ ] Scan de resíduos, isolamento entre pacientes e checks de segurança clínica.

## Skills aplicáveis

Nenhuma skill especializada.

## Arquivos/módulos prováveis

Todo o monorepo, artefatos SDD e relatórios de testes/CI.
