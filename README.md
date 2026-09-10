# PsiqApp MVP

PsiqApp MVP e uma aplicacao local para desenvolver e validar uma ferramenta de apoio ao prontuario psiquiatrico usando somente dados ficticios.

O repositorio atualmente contem os documentos SDD aprovados, Rules do projeto, infraestrutura local de PostgreSQL, CI inicial e diretorios reservados do monorepo para backend e frontend. Fluxos de produto, APIs, UI, migrations e worker de IA ainda nao estao implementados.

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

- Docker com Docker Compose v2.
- Java 21, Maven, Node.js e npm serao necessarios nas proximas tasks de bootstrap de backend e frontend, mas ainda nao existem checks de aplicacao.

## Configuracao local

Crie um arquivo local de ambiente a partir do template com placeholders:

```bash
cp .env.example .env
```

Substitua os placeholders localmente. `.env` e outros arquivos locais de ambiente sao ignorados pelo Git; `.env.example` deve conter apenas placeholders.

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

Checks de backend, frontend e Playwright serao adicionados pelas respectivas tasks de bootstrap. O CI atual tem jobs separados para backend, frontend e E2E integrado, com guardas sem efeito ate esses projetos existirem.

## Documentacao

- Documentacao de negocio: `docs/BUSINESS.md`
- Documentacao tecnica: `docs/TECHNICAL.md`
- Documentos canonicos das tasks do MVP: `tasks/prd-psiqapp-mvp/`
