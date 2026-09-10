# Task 3.0 - frontend-bootstrap

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

- [ ] 3.1 Criar projeto Vite em `apps/frontend` com versões compatíveis.
- [ ] 3.2 Estruturar `src/app`, `src/features` e `src/shared`.
- [ ] 3.3 Criar `ClienteApi`, `ErroApi` e utilitário de `chaveDeIdempotencia`.
- [ ] 3.4 Criar rotas iniciais para pacientes, agenda e prontuário como placeholders navegáveis.
- [ ] 3.5 Criar `AvisoDadosFicticios` persistente e visível.
- [ ] 3.6 Configurar proxy Vite de `/api` para `127.0.0.1:8080`.
- [ ] 3.7 Configurar testes unitários de componentes e cliente HTTP.

## Critérios de sucesso

- Frontend inicia em `127.0.0.1:5173`.
- O aviso de dados fictícios aparece em todas as rotas.
- Cliente HTTP trata Problem Details sem vazar payload sensível em mensagens.
- A base visual é responsiva e não depende de backend funcional.

## Testes obrigatórios

- [ ] Typecheck TypeScript.
- [ ] Testes de renderização do layout e do aviso persistente.
- [ ] Testes do `ClienteApi` para sucesso, Problem Details e header `Idempotency-Key`.
- [ ] Build Vite.

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

