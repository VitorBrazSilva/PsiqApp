# Task 7.0 — Documentação, configuração e CI

## Objetivo

Refletir o estado final nos documentos vivos, propriedades próprias, variáveis, workflows e artefatos operacionais.

## Rastreabilidade

- PRD: RF-007, RF-008, RNF-004, RNF-005, RNF-006
- TechSpec: TS-011, TS-012
- Critérios de aceite: AC-RF007-01, AC-RF007-04, AC-RF008-03, AC-RF008-04

## Dependências

Tasks 3.0, 4.0, 5.0 e 6.0.

## Escopo

- Atualizar `README.md`, `docs/BUSINESS.md`, `docs/TECHNICAL.md` e documentação da feature.
- Renomear propriedades `psiqapp.analise.worker.*` e variáveis `PSIQAPP_ANALISE_*` quando aplicável.
- Atualizar workflows e validações sem trocar versões ou comandos existentes.
- Remover descrições obsoletas sem declarar comportamento não implementado.

## Fora do escopo da task

Alterar comportamento funcional, stack ou infraestrutura não previsto na TechSpec.

## Subtarefas

- [ ] 7.1 Atualizar documentação de negócio e técnica.
- [ ] 7.2 Atualizar configuração e variáveis próprias.
- [ ] 7.3 Atualizar CI e artefatos canônicos.

## Critérios de sucesso

Documentação, configuração e CI descrevem somente nomes e fluxos ativos, sem expor dados sensíveis ou secrets.

## Testes obrigatórios

- [ ] Validação de links, comandos e configuração.
- [ ] Build/checks dos jobs backend, frontend e E2E.
- [ ] Scan de nomes obsoletos na documentação/configuração.
- [ ] Verificação de placeholders e ausência de secrets/dados reais.

## Skills aplicáveis

Nenhuma skill especializada.

## Arquivos/módulos prováveis

`README.md`, `docs/`, arquivos de configuração, `.env.example`, workflows e OpenAPI.
