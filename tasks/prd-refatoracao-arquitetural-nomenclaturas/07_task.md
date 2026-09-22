# Task 7.0 — Documentação, configuração e CI

## Objetivo

Refletir o estado final da refatoração na documentação viva, nas configurações próprias da aplicação e nos workflows de validação, sem declarar comportamento inexistente ou expor dados sensíveis.

## Rastreabilidade

- PRD: RF-007, RF-008, RNF-004, RNF-005, RNF-006
- TechSpec: TS-011, TS-012
- Critérios de aceite: AC-RF007-01, AC-RF007-04, AC-RF008-01, AC-RF008-03, AC-RF008-04

## Dependências

Tasks 3.0, 4.0, 5.0 e 6.0.

## Escopo

- Atualizar `README.md`, `docs/BUSINESS.md`, `docs/TECHNICAL.md`, workflows e documentação canônica da feature para o estado final.
- Renomear propriedades próprias de análise para `psiqapp.analise.*` e variáveis próprias para `PSIQAPP_ANALISE_*`, mantendo nomes obrigatórios externos como `OPENAI_API_KEY` e `OPENAI_MODEL`.
- Atualizar `.env.example`, `application*.yaml`, Compose, scripts e CI sem trocar versões ou comandos previstos na TechSpec.
- Validar que documentação, OpenAPI e configuração não apresentam nomes funcionais antigos como ativos.
- Manter referências históricas necessárias em migrations, testes de upgrade e tabelas de mapeamento, com exceções documentadas para o scan.
- Não regenerar PDFs/HTML derivados, salvo se o fluxo documental da task exigir; Markdown canônico permanece como fonte.

## Fora do escopo da task

- Alterar comportamento funcional, stack, banco, provider ou infraestrutura.
- Habilitar autenticação, autorização, uso de dados reais ou chamadas reais de provider.
- Corrigir implementação de código pertencente às tasks anteriores.
- Documentar como disponível qualquer comportamento que ainda não esteja implementado.

## Subtarefas

- [x] 7.1 Atualizar documentação de negócio, técnica, onboarding e artefatos SDD.
- [x] 7.2 Atualizar propriedades, variáveis, `.env.example` e Compose.
- [x] 7.3 Atualizar workflows e validações sem alterar a matriz de jobs e comandos.
- [x] 7.4 Validar links, comandos, nomes finais, placeholders e ausência de secrets/dados reais.
- [x] 7.5 Reexecutar o scan em documentação e configuração usando a allowlist definida na Task 1.

## Critérios de sucesso

- A documentação descreve apenas o estado implementado e usa a terminologia final.
- Configuração própria de análise está em português sem quebrar nomes de integrações externas ou ferramentas.
- CI continua com os jobs de backend, frontend e E2E previstos.
- `.env.example` contém somente placeholders e nenhum dado real.
- A documentação não expõe prontuários, respostas integrais da IA, CPF completo, secrets ou credenciais.

## Testes obrigatórios

- [ ] Validação de links, comandos, configuração do Compose e propriedades do backend.
- [ ] Execução dos checks dos jobs backend, frontend e E2E aplicáveis.
- [ ] Scan de nomes obsoletos na documentação e configuração.
- [ ] Verificação de placeholders e ausência de secrets/dados reais.
- [ ] Revisão de consistência entre README, BUSINESS.md, TECHNICAL.md, OpenAPI e TechSpec.

## Skills aplicáveis

Nenhuma skill especializada. Aplicar a Rule de manutenção documental e as Rules de privacidade e qualidade.

## Arquivos/módulos prováveis

`README.md`, `docs/BUSINESS.md`, `docs/TECHNICAL.md`, `.env.example`, `apps/backend/src/main/resources/application*.yaml`, `infra/compose.yaml`, `.github/workflows/` e artefatos da feature.
