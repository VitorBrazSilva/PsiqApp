# QA Report — Painel de consultas do prontuário

## Status

APROVADO

## Matriz de rastreabilidade

| Requisito/AC | Verificação | Resultado | Evidência |
|---|---|---|---|
| AC-RF001-01/02 | Integração do prontuário compartilha data e remove próxima após status final | PASS | PaginaProntuario.test.tsx |
| AC-RF002-01 | Painel branco, lista delimitada e layout | PASS | consultas-prontuario.spec.ts; evidencias/consultas-*.png |
| AC-RF002-02 | Controles originais, apresentação compacta opcional e regressão de agendamento | PASS | Vitest completo; E2E de melhorias-agenda |
| AC-RF002-03 | Botão abre diálogo para paciente atual com teclado, Escape e retorno de foco | PASS | Segundo E2E novo |
| AC-RF003-01/02 | Soma de contagens completas e consultas dos grupos apropriados | PASS | Hook: 140 consultas em páginas de 1 item; integração de filtros |
| AC-RF003-03 | Status, retorno à janela, corte temporal e duração máxima do timer | PASS | PaginaProntuario/useResumoConsultas testes |
| AC-RF003-04/05 | Erro sem total zero, recusa de item alheio, abort e resposta atrasada | PASS | Testes do hook e isolamento do prontuário; JSX de erro revisado |
| RNF-001 | Desktop/mobile sem overflow; ação 44–56 px; teclado | PASS | E2E 360/768/1024/1440 px e imagens inspecionadas |
| RNF-002 | Isolamento por paciente e ausência de mudanças clínicas/IA | PASS | Testes e review de imports/diff |

## Verificações executadas

Em `apps/frontend`:

- `npm test -- --run --maxWorkers=1`: 81 testes aprovados em 10 arquivos, 49,96 s.
- `npm run lint`: aprovado.
- `npm run build`: typecheck e build aprovados; 120 módulos; sem dependências novas.
- `E2E_BASE_URL=http://127.0.0.1:5174 npm run e2e -- e2e/consultas-prontuario.spec.ts e2e/analysis-redesign.spec.ts e2e/melhorias-agenda.spec.ts --grep-invert 'backend real e PostgreSQL'`: sete testes aprovados, 14,4 s. Variável foi definida apenas no processo PowerShell correspondente.
- `git diff --check`: aprovado.

Atualização local:

- `docker compose --env-file .env -f infra/compose.yaml build frontend`: aprovado.
- `docker compose --env-file .env -f infra/compose.yaml up -d --no-deps frontend`: frontend reconstruído/recriado na porta 5173.
- Teste temporário somente leitura da URL solicitada: aprovado em 1440 e 360 px, comparando total e próxima consulta com a API. Script temporário removido após o QA.
- Bundle servido verificado: `index-B9xvMr2P.js` e `index-BReG0HBq.css`.

## Requisitos não funcionais

Lista/resumo lado a lado acima de 740 px e empilhados abaixo. Nenhum overflow nas quatro larguras. Foco e retorno do diálogo verificados por teclado. Não se introduziu estado global, biblioteca ou novo módulo transversal.

## Segurança / privacidade

Massa de testes sintética. Leituras do resumo têm paciente obrigatório, abort e guarda de identidade. Registros clínicos e IA não recebem dados de consultas nem foram alterados. A ocorrência Google da execução integrada anterior e sua correção estão registradas em bugs.md; o run final usa respostas simuladas e a conferência da URL é somente leitura.

## Integrações e falhas

E2E de regressão simula conflito, falha Google e resposta de criação perdida, preservando repetição idempotente e cadastro retroativo. O hook recusa respostas alheias e transforma falha em indisponibilidade explícita. Não foi executada suíte backend, migrations ou ArchUnit: backend e fronteiras correspondentes não mudaram.

## Bugs encontrados

B-001 a B-004 em bugs.md, todos corrigidos/resolvidos. Incluem build antigo, SVG sem dimensão, timeouts por concorrência e agendamento de teste em conexão Google ativa, já cancelado/sincronizado.

## Evidências visuais

- `evidencias/consultas-360.png`, `consultas-768.png`, `consultas-1024.png`, `consultas-1440.png`: fixture da referência.
- `evidencias/realizadas-1440.png`: lista filtrada com resumo completo.
- `evidencias/consultas-local-1440.png`, `consultas-local-360.png`: paciente da URL solicitada, após atualização do frontend Docker. A leitura mostrou total 14 e três próximas; são evidências do instante da verificação.

## Riscos residuais

Revisões feitas pelo agente implementador em passagens distintas, sem reviewer independente. Não há teste arquitetural automatizado frontend; compatibilidade foi verificada manualmente. A suite E2E inteira de escrita requer backend isolado e Google desconectado, como documentado no README.

## Veredito

Todos os ACs e RNFs da task têm evidência. Nenhum blocker aberto; composição conferida visualmente também na URL local solicitada.
