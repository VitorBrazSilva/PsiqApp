# PsiqApp MVP

PsiqApp MVP e uma aplicacao local para desenvolver e validar uma ferramenta de apoio ao prontuario psiquiatrico usando somente dados ficticios.

O repositorio contem os documentos SDD aprovados, Rules, PostgreSQL local, backend Spring Boot com APIs de pacientes, consultas, registros clinicos, nucleo persistente de analises e worker assincrono de IA configuravel, e uma SPA navegavel com aviso persistente de dados ficticios. No frontend, Pacientes, Agenda e Prontuario permitem cadastrar, buscar e abrir pacientes, visualizar dados basicos, criar consultas, atualizar status, registrar pareceres e complementos, consultar linha do tempo clinica, ver estados da IA, analise atual, historico e evidencias consumindo a API real.

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
tasks/prd-psiqapp-mvp/
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

O worker de analise fica desabilitado por padrao. Para processar geracoes localmente, habilite `PSIQAPP_ANALYSIS_WORKER_ENABLED=true`. O provider padrao e `fake`, sem rede externa; para usar OpenAI, configure `PSIQAPP_ANALYSIS_PROVIDER=openai`, `OPENAI_API_KEY` e `OPENAI_MODEL`.

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

O `verify` executa testes unitarios, testes de contexto HTTP, arquitetura, migrations e integracao das APIs de pacientes, consultas, registros clinicos, analises e worker de IA com PostgreSQL 18.6 via Testcontainers. Docker Desktop deve estar iniciado. O CI tem jobs separados para backend, frontend e E2E integrado; Playwright ainda nao esta implementado.

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

Os testes usam Vitest e Testing Library, sem endpoints reais. `npm test` abre o modo watch; `npm run build` valida os tipos e gera `dist`. `npm run preview` permite conferir esse build localmente em 127.0.0.1:5173; para o desenvolvimento com proxy da API, use `npm run dev`.

## Documentacao

- Documentacao de negocio: `docs/BUSINESS.md`
- Documentacao tecnica: `docs/TECHNICAL.md`
- Documentos canonicos das tasks do MVP: `tasks/prd-psiqapp-mvp/`
