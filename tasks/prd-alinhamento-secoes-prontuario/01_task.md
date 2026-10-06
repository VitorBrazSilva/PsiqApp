# Task 1.0 — Alinhar Análise e corrigir Dados pessoais

## Objetivo e rastreabilidade

RF-001/002, RNF-001; AC-RF001-01/02 e AC-RF002-01/02; TS-001/002/003. Dependências: PRD/spec-review e TechSpec sem bloqueadores.

Retorno visual do usuário: incluir AC-RF001-03 na mesma task/branch, corrigindo o ícone das evidências na apresentação completa e lateral.

## Escopo e subtarefas

- [x] 1.1 Corrigir layout da Análise em `styles.css`.
- [x] 1.2 Apresentar o cadastro em `DadosPaciente` e restringir o painel IA em `PaginaProntuario`.
- [x] 1.3 Validar checks e E2E existentes/afetados, medidas e capturas responsivas.
- [x] 1.4 Executar task review, code review, manutenção documental, QA e revisão final.
- [x] 1.5 Atualizar o frontend local em 5173 e verificar as URLs fornecidas.
- [x] 1.6 Corrigir o ícone das evidências, verificar renderização/ação e atualizar o frontend local e reviews.

Fora de escopo: edição, API, dados persistidos, comportamento clínico, integrações e mudanças gerais de arquitetura. Skill: `ui-ux-pro-max`; consulta focada de layout e largura de conteúdo, mantendo o padrão visual existente.

## Testes e sucesso

Typecheck, lint, Vitest, build e Playwright de análise/cadastro com API local fictícia. Testes medem alinhamento e verificam dados visíveis, fallback da queixa inicial, ausência de análise na seção cadastral e navegação/diálogos. Sem chamadas a providers externos. Cada aceite precisa de evidência em `qa-report.md`.

## Módulos e Rules

Preservar composição em registros-clinicos, apresentação cadastral em pacientes e análise em analises conforme TECHNICAL §3/5/14. Rules aplicáveis: arquitetura, produto, segurança clínica, privacidade, testes e documentação. Revisão manual do diff e verificações frontend; backend/ArchUnit/migrations não aplicáveis.

## Estado

CONCLUÍDA. AC-RF001-03 e checks afetados revalidados; ícone corrigido e frontend atualizado em 5173. Entrega anterior e suas evidências preservadas. Task/code review, documentação, QA e segurança clínica revalidados.
