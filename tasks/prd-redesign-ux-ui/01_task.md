# Task 1.0 — Base de contratos, paginação e matriz de paridade

## Objetivo

Estabelecer a base de dados e operação do redesign sem perda de informação, completando os modelos do frontend, a normalização de contratos, a paginação real, os estados assíncronos e a rastreabilidade campo a campo dos dados e endpoints existentes.

## Rastreabilidade

- PRD: RF-017, RF-019, RNF-005, RNF-006
- TechSpec: TS-003, TS-012, TS-013, TS-014, TS-015
- Critérios de aceite: AC-RF017-01 a AC-RF017-06, AC-RF019-01 a AC-RF019-06
- Inventário obrigatório: D-01 a D-15 e E-01 a E-17

## Dependências

- TechSpec aprovada em `tasks/prd-redesign-ux-ui/techspec.md`.
- Código atual de `apps/frontend/src/shared/api/` e serviços de cada feature.
- Deve ser concluída antes das Tasks 2.0 e 3.0.

## Escopo

- Completar os modelos canônicos de paciente, consulta, registro clínico, geração, análise, item de análise, evidência, paginação e erro.
- Preservar propriedades desconhecidas ou evolutivas no adaptador, sem `pick` destrutivo.
- Normalizar `sequenciaRequest`, mantendo compatibilidade apenas na borda quando necessário.
- Implementar o suporte comum a `pagina`, `tamanho`, `total`, `itens`, filtros, cancelamento, respostas obsoletas, `Problem Details`, `X-Request-Id`, `Location` e `Idempotency-Key`.
- Criar `parity-matrix.md`, com uma linha para cada D-01–D-15 e E-01–E-17, contendo campo/capacidade, consumidor, arquivo/componente previsto, teste, evidência e status.
- Definir fixtures fictícias completas e reutilizáveis para os contratos, incluindo campos nulos, listas extensas e páginas posteriores.

## Fora do escopo da task

- Redesign visual específico de Pacientes, Agenda, Prontuário ou IA.
- Alteração de regras clínicas, persistência, banco ou autenticação.
- Ajuste do vínculo entre geração histórica e análise, que pertence à Task 3.0.

## Subtarefas

- [x] 1.1 Inventariar e tipar todos os campos dos DTOs e respostas E-01–E-17.
- [x] 1.2 Implementar/adaptar normalizadores de contrato sem perda de dados.
- [x] 1.3 Implementar paginação, filtros, cancelamento e proteção contra respostas obsoletas.
- [x] 1.4 Preservar erros de campo, `idRequisicao` e headers operacionais com exposição segura.
- [x] 1.5 Criar e manter a matriz `parity-matrix.md` com rastreabilidade executável.

## Encerramento

Concluída em 2026-09-23 na branch `task/01-redesign-contracts`. Testes direcionados, typecheck, lint e build aprovados; a suíte completa foi tentada, mas excedeu o limite operacional do ambiente.

## Critérios de sucesso

- Nenhum campo inventariado é descartado pelo cliente ou reduzido a um view model incompleto.
- Pacientes, registros, consultas e gerações conseguem acessar segunda e última página quando aplicável.
- Busca/filtro antigo não substitui a resposta da consulta vigente.
- Erros, nulos, estados vazios e indisponibilidade permanecem distinguíveis.
- A matriz possui todas as 32 linhas D-01–D-15/E-01–E-17 e nenhuma linha sem destino ou teste planejado.

## Testes obrigatórios

- [ ] Unitários: modelos, normalização de `sequenciaRequest`, paginação, filtros, nulos, cancelamento e resposta obsoleta.
- [ ] Integração/contrato: um caso para cada E-01–E-14, com método, URL, query/body, headers, status e payload completo.
- [ ] Operacional: E-15, E-16, E-17 e OpenAPI/readiness.
- [ ] Casos de erro: 400, 404, 409, 500, abort silencioso e conteúdo sensível não exposto.
- [ ] Verificação da matriz: nenhuma linha D/E sem consumidor, teste e evidência.

## Skills aplicáveis

- `ui-ux-pro-max`: acessibilidade, estados, responsividade e preservação de dados na interação.
- `frontend-design`: princípios de conteúdo claro e hierarquia sem ocultar informação.

## Arquivos/módulos prováveis

- `apps/frontend/src/shared/api/*`
- `apps/frontend/src/shared/idempotencia/*`
- `apps/frontend/src/features/*/servico*.ts`
- Tipos e adaptadores nas features `pacientes`, `consultas`, `registros-clinicos` e `analises`
- `apps/frontend/src/**/*.test.tsx` e testes de contrato a serem adicionados
- `tasks/prd-redesign-ux-ui/parity-matrix.md`
