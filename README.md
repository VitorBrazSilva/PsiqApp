# PsiqApp MVP

PsiqApp MVP e uma aplicacao local para desenvolver e validar uma ferramenta de apoio ao prontuario psiquiatrico usando somente dados ficticios.

O repositorio contem documentos SDD, Rules, PostgreSQL local, backend Spring Boot com APIs de pacientes, consultas, integracao server-side com Google Agenda, registros clinicos, nucleo persistente de analises e workers configuraveis, e uma SPA navegavel com aviso persistente de dados ficticios. No frontend, Pacientes, Agenda e Prontuario permitem cadastrar, buscar e abrir pacientes, visualizar dados basicos, criar consultas, atualizar status, registrar pareceres e complementos, consultar linha do tempo clinica, ver analises e seu historico consumindo a API real. A interface Google sera integrada na task 3.0 da feature.

## Aviso de seguranca

Use somente dados ficticios de pacientes neste MVP. Nao insira prontuarios reais, dados pessoais reais, CPFs reais, notas clinicas reais, credenciais ou secrets de producao em exemplos, testes, fixtures, logs ou bancos locais.

## Estrutura do repositorio

```text
apps/
  backend/
  frontend/
infra/
  compose.yaml
docs/
tasks/prd-integracao-google-agenda/
.agents/rules/
```

## Pre-requisitos

- Backend: Docker com Docker Compose v2, Java 21 e Maven Wrapper incluido no repositorio.
- Frontend: Node.js 24.18.0 LTS e npm 11.16.0. A versao do Node esta em `apps/frontend/.nvmrc`.

O frontend inicial funciona sem PostgreSQL, backend ou arquivo `.env`. As APIs funcionais do backend dependem do PostgreSQL local.

## Configuracao local

Crie um arquivo local de ambiente a partir do template com placeholders:

```bash
cp .env.example .env
```

Substitua os placeholders localmente. `.env` e outros arquivos locais de ambiente sao ignorados pelo Git; `.env.example` deve conter apenas placeholders.

O worker de analise fica desabilitado por padrao. Para processar geracoes localmente, habilite `PSIQAPP_ANALISE_WORKER_ENABLED=true`. O provider padrao e `fake`, sem rede externa; para usar OpenAI, configure `PSIQAPP_ANALISE_PROVIDER=openai`, `OPENAI_API_KEY` e `OPENAI_MODEL`.

A conexao OAuth opcional com Google Agenda requer `PSIQAPP_GOOGLE_AGENDA_CLIENT_ID`, `PSIQAPP_GOOGLE_AGENDA_CLIENT_SECRET` e `PSIQAPP_GOOGLE_AGENDA_ENCRYPTION_KEY` (Base64 de 32 bytes aleatorios). Configure tambem `PSIQAPP_GOOGLE_AGENDA_REDIRECT_URI` no cliente OAuth Google e `PSIQAPP_GOOGLE_AGENDA_FRONTEND_URI` com o destino fixo `/agenda`. Sem essa configuracao completa, o backend inicia normalmente e informa `NAO_CONFIGURADA`; o fluxo de conexao fica indisponivel. O refresh token e persistido cifrado com AES-256-GCM e a chave deve permanecer fora do repositório. OAuth usa navegação para `/api/v1/integracoes/google-agenda/conectar`; credenciais nunca são retornadas à SPA. Este fluxo não habilita uso com dados reais de pacientes.

O worker de sincronização do Google Agenda usa `PSIQAPP_GOOGLE_AGENDA_WORKER_ENABLED=true` e polling de `PSIQAPP_GOOGLE_AGENDA_WORKER_POLL_INTERVAL=5s` por padrão; ajuste essas opções no `.env` quando necessário. O backend valida disponibilidade local e Google antes de criar consulta, registra a intenção de sincronização junto com a consulta e atualiza eventos depois do commit. Eventos existentes no Google são usados somente como intervalos ocupados; eventos gerenciados pelo PsiqApp contêm nome, e-mail e horário. A interface React para conectar conta, verificar horários e mostrar o estado da sincronização ainda pertence à task 3.0.

## PostgreSQL

Subir o banco local:

```bash
docker compose --env-file .env -f infra/compose.yaml up -d
```

Verificar status:

```bash
docker compose --env-file .env -f infra/compose.yaml ps
```

Parar o banco:

```bash
docker compose --env-file .env -f infra/compose.yaml down
```

O banco e publicado somente em `127.0.0.1:5432` e usa o volume Docker nomeado `psiqapp-postgres-data`.

## Ambiente completo via Docker Compose

Com o Docker Desktop iniciado, suba PostgreSQL, backend e frontend:

```bash
docker compose --env-file .env -f infra/compose.yaml up --build -d
```

O frontend fica disponível em `http://127.0.0.1:5173`, o backend em `http://127.0.0.1:8080` e o PostgreSQL em `127.0.0.1:5432`. O Compose aguarda o PostgreSQL e o healthcheck do backend antes de iniciar o frontend. Para acompanhar os logs, use `docker compose --env-file .env -f infra/compose.yaml logs -f`; para parar os serviços, use `docker compose --env-file .env -f infra/compose.yaml down`.

## Checks

Validar o arquivo Compose:

```bash
docker compose --env-file .env.example -f infra/compose.yaml config --quiet
```

Executar os checks do backend:

```bash
cd apps/backend
./mvnw verify
```

O `verify` executa testes unitarios, testes de contexto HTTP, arquitetura, migrations e integracao das APIs de pacientes, consultas, disponibilidade/sincronizacao Google, registros clinicos, analises e workers com PostgreSQL 18.6 via Testcontainers. Docker Desktop deve estar iniciado. O CI tem jobs separados para backend, frontend e E2E integrado.

## Frontend local

Na raiz do repositorio:

```bash
cd apps/frontend
npm ci
npm run dev
```

Abra `http://127.0.0.1:5173`. As rotas `/pacientes`, `/agenda` e `/prontuario` mostram os fluxos de pacientes, consultas, registros clinicos e analise, mantendo o aviso de dados ficticios. A raiz redireciona para pacientes. O servidor exige a porta 5173 livre e encaminha `/api` para `http://127.0.0.1:8080`, sem remover o prefixo. Para usar os fluxos funcionais, mantenha o backend em execucao.

Checks, a partir de `apps/frontend`:

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Validar a suite E2E integrada, com o backend em `127.0.0.1:8080` e o provider fake:

```bash
npm run e2e
```

Os testes de unidade usam Vitest e Testing Library, sem endpoints reais. A suite E2E usa Playwright contra o frontend e a API locais, com dados ficticios. `npm test` abre o modo watch; `npm run build` valida os tipos e gera `dist`. `npm run preview` permite conferir esse build localmente em 127.0.0.1:5173; para o desenvolvimento com proxy da API, use `npm run dev`.

## Documentacao

- Instrucoes para agentes: `AGENTS.md`
- Workflow SDD: `sdd-workflow/workflow.md`
- Rules do projeto: `.agents/rules/`
- Documentacao de negocio: `docs/BUSINESS.md`
- Documentacao tecnica: `docs/TECHNICAL.md`
- Feature SDD da integracao Google Agenda (backend Tasks 1.0/2.0; interface Task 3.0 pendente): `tasks/prd-integracao-google-agenda/`
