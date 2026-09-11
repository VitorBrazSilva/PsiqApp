# Task 3.0 - frontend-bootstrap

**Status: CONCLUÍDA em 2026-09-11.** Testes aprovados, task-reviewer aprovado, code-reviewer sem blockers e manutenção documental concluída. Abertura automática do PR indisponível por ausência de `gh` e navegador; título/descrição preparados em `03_pull_request.md`, conforme fallback do workflow.

## Objetivo

Criar a SPA React/Vite com TypeScript, roteamento, cliente HTTP centralizado, estados básicos de UI e aviso persistente de dados fictícios.

## Rastreabilidade

- PRD: RF-020; RNF-001, RNF-004, RNF-005
- TechSpec: TS-004, TS-030, TS-031, TS-032
- Critérios de aceite: SPA local, proxy `/api`, banner persistente, fetch centralizado, base de testes frontend

## Dependências

- Nenhuma task anterior.

## Escopo

- Criar `apps/frontend` com React 19.2, TypeScript, Vite 8 e CSS simples.
- Configurar React Router declarativo.
- Criar cliente HTTP centralizado para `/api/v1`, incluindo Problem Details e `Idempotency-Key`.
- Criar layout funcional inicial com aviso persistente de dados fictícios.
- Configurar Vitest e Testing Library.

## Fora do escopo da task

- Telas completas de cadastro, agenda, prontuário ou análise.
- Integração real com endpoints ainda não implementados.
- Biblioteca de estado global, framework CSS pesado ou cache de servidor.
- Implementação de RFs funcionais de pacientes, consultas, registros clínicos ou IA.

## Subtarefas

- [x] 3.1 Criar projeto Vite em `apps/frontend` com versões compatíveis.
- [x] 3.2 Estruturar `src/app`, `src/features` e `src/shared`.
- [x] 3.3 Criar `ClienteApi`, `ErroApi` e utilitário de `chaveDeIdempotencia`.
- [x] 3.4 Criar rotas iniciais para pacientes, agenda e prontuário como placeholders navegáveis.
- [x] 3.5 Criar `AvisoDadosFicticios` persistente e visível.
- [x] 3.6 Configurar proxy Vite de `/api` para `127.0.0.1:8080`.
- [x] 3.7 Configurar testes unitários de componentes e cliente HTTP.

## Critérios de sucesso

- Frontend inicia em `127.0.0.1:5173`.
- O aviso de dados fictícios aparece em todas as rotas.
- Cliente HTTP trata Problem Details sem vazar payload sensível em mensagens.
- A base visual é responsiva e não depende de backend funcional.

## Testes obrigatórios

- [x] Typecheck TypeScript.
- [x] Testes de renderização do layout e do aviso persistente.
- [x] Testes do `ClienteApi` para sucesso, Problem Details e header `Idempotency-Key`.
- [x] Build Vite.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/frontend/package.json`
- `apps/frontend/vite.config.ts`
- `apps/frontend/src/app/Aplicacao.tsx`
- `apps/frontend/src/app/rotas.tsx`
- `apps/frontend/src/shared/api/clienteApi.ts`
- `apps/frontend/src/shared/api/erroApi.ts`
- `apps/frontend/src/shared/idempotencia/chaveDeIdempotencia.ts`
- `apps/frontend/src/shared/componentes/AvisoDadosFicticios.tsx`
- `apps/frontend/src/styles.css`

## Evidências e limites

- `03_task_review.md`: rastreabilidade e checks; 23 testes aprovados, lint, typecheck, build e smoke local de Vite/proxy.
- `03_task_code_review.md`: revisão técnica aprovada.
- `03_task_documentation.md`: atualização de README, BUSINESS e TECHNICAL.
- React 19.2.8, Vite 8.3.0, Node 24.18.0 LTS, npm 11.16.0, TypeScript 6.0.3 e dependências estáveis fixadas no projeto.
- RF-020, RNF-005 e TS-031 não são declarados funcionalmente completos: isolamento integrado, análises e polling continuam nas tasks futuras. O bootstrap fornece cliente sem contexto global de paciente e suporte a cancelamento.
- Inspeção visual em navegador real indisponível; navegação/renderização testadas com Testing Library e responsividade revisada no CSS. E2E fora do escopo.

