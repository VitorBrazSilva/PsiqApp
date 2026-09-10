# Task 1.0 - infra-bootstrap

## Status

Concluida.

## Objetivo

Criar a base de infraestrutura local e qualidade do monorepo para desenvolvimento do MVP, sem implementar fluxos de produto.

## Rastreabilidade

- PRD: RNF-004, RNF-006, RNF-008
- TechSpec: TS-002, TS-005, TS-032, TS-034, TS-036
- Critérios de aceite: requisitos de ambiente local, PostgreSQL via Docker Compose, configuração externa de secrets, execução em loopback e CI inicial

## Dependências

- Nenhuma task anterior.

## Escopo

- Estrutura inicial do monorepo com áreas `apps/backend`, `apps/frontend` e `infra`.
- Docker Compose local para PostgreSQL 18.6 com volume persistente e acesso em `127.0.0.1:5432`.
- Arquivos de configuração de exemplo sem secrets reais.
- Scripts/documentação mínima de execução local e checks.
- Pipeline inicial separado para backend, frontend e integração, ainda que os jobs de aplicação só passem a executar checks completos após os bootstraps correspondentes.

## Fora do escopo da task

- Código de domínio, API, frontend funcional, migrations de negócio ou worker de IA.
- Autenticação, deploy remoto, cloud, Kubernetes, broker externo ou CORS amplo.
- Qualquer dado real de paciente.

## Subtarefas

- [x] 1.1 Criar `infra/compose.yaml` com PostgreSQL local, volume nomeado e binding em loopback.
- [x] 1.2 Criar `.env.example` com placeholders como `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `OPENAI_API_KEY` e `OPENAI_MODEL`.
- [x] 1.3 Definir convenções iniciais de comandos em `README.md`, sem documentar comportamento ainda não implementado como pronto.
- [x] 1.4 Criar estrutura base de CI para checks de backend, frontend e E2E integrado.
- [x] 1.5 Registrar explicitamente a restrição de dados fictícios no onboarding local.

## Critérios de sucesso

- O PostgreSQL local sobe via Compose e fica acessível apenas em loopback.
- Nenhum secret real é versionado.
- A estrutura permite que as tasks de backend e frontend adicionem seus próprios checks.
- A documentação descreve apenas setup e limitações reais do estado atual.

## Testes obrigatórios

- [x] Validação do arquivo Compose com o comando padrão da ferramenta.
- [x] Smoke test local de subida e parada do PostgreSQL.
- [x] Verificação de ausência de secrets reais em arquivos versionados.
- [x] Execução do pipeline inicial ou validação equivalente dos arquivos de CI.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `infra/compose.yaml`
- `.env.example`
- `.gitignore`
- `.github/workflows/validacao.yml`
- `README.md`
