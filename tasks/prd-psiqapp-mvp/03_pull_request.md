# Título

chore: bootstrap React frontend

Base: `main`

Head: `task/03-frontend-bootstrap`

## Objetivo

Entregar a Task 03 frontend-bootstrap: SPA local com navegação inicial, aviso persistente de dados fictícios e base de comunicação/testes. As páginas indicam que os fluxos clínicos ainda estão em preparação.

## Implementado

- React 19.2.8, Vite 8.3.0, TypeScript 6.0.3, React Router declarativo e CSS simples em app/features/shared.
- Rotas placeholder de pacientes, agenda e prontuário, redirecionamento inicial e fallback de rota desconhecida.
- Aviso compartilhado de dados fictícios, navegação semântica e estilos responsivos.
- Cliente `/api/v1` com fetch centralizado, erros seguros, JSON, cancelamento e suporte a Idempotency-Key preservada em repetição.
- Node/npm e dependências fixadas, Vitest/Testing Library e job frontend de CI ativo.
- Vite em 127.0.0.1:5173 com proxy `/api` para 127.0.0.1:8080.

## Requisitos atendidos

### PRD

- RNF-001: navegação inicial e mensagens claras, dentro do bootstrap.
- RNF-004: aviso persistente e execução em loopback.
- RF-020 e RNF-005: preservados/preparados no escopo; nenhuma consulta clínica ou análise é implementada. Validação funcional pertence às tasks futuras.

### TechSpec

- TS-004, TS-030 e TS-032: SPA, organização, comunicação centralizada e execução local.
- TS-031: suporte de base a cancelamento; polling e proteção de contexto dos fluxos clínicos permanecem na Task 10.

### Critérios de aceite

- SPA local sem dependência de backend funcional.
- Proxy `/api`, banner persistente, erros sem texto bruto sensível e testes frontend.
- Rastreamento detalhado em `03_task_review.md`.

## Testes executados

Em `apps/frontend`:

- `npm ci`: aprovado, zero vulnerabilidades reportadas na instalação.
- `npm ls --depth=0`: aprovado.
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm test -- --run`: 23 testes em 2 arquivos aprovados.
- `npm run build`: aprovado.

Na raiz:

- `git diff --cached --check`: aprovado.
- Smoke temporário `node .cache/frontend-smoke.mjs`: Vite real, cinco URLs SPA e proxy para stub HTTP loopback aprovados; servidores encerrados ao final. Script temporário não versionado, sem dependência de endpoints reais.

Backend, migrations, concorrência clínica e E2E não se aplicam ao diff. Não se declara CI remoto aprovado antes de sua execução.

## Reviews

- task-reviewer: APROVADO (`03_task_review.md`).
- code-reviewer: APROVADO (`03_task_code_review.md`).
- Etapas de revisão executadas pelo agente executor e registradas separadamente.

## Documentação

- `README.md`: atualizado.
- `docs/BUSINESS.md`: atualizado.
- `docs/TECHNICAL.md`: atualizado.
- Decisão documental registrada em `03_task_documentation.md`.

## Fora do escopo

- Cadastro/busca de pacientes, agendamento/status de consultas e prontuário funcional.
- Pareceres, complementos, análises, polling, provider de IA e integração real com endpoints.
- Autenticação, publicação da aplicação, cache de servidor e E2E.

## Observações

- TypeScript 6.0.3 foi selecionado por compatibilidade com typescript-eslint 8.70.0, sem forçar peers incompatíveis.
- A ferramenta de navegação não disponibilizou navegador. Responsividade revisada no CSS e navegação validada com Testing Library; não houve inspeção visual em navegador real.
- PR preparado em arquivo conforme fallback do workflow: GitHub CLI (`gh`) ausente e navegador indisponível. Nenhuma configuração de autenticação foi alterada.
