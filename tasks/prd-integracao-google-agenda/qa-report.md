# QA Report — Integração com Google Agenda

## Status

APROVADO

## Matriz de rastreabilidade

| Requisito/AC | Verificação | Resultado | Evidência |
|---|---|---|---|
| RF-001 / AC-RF001-01 a AC-RF001-06 | OAuth fake, estados, desconexão, confirmação e preservação de eventos | Passou | `GoogleAgendaOAuthIT` (3 testes), `PaginaAgenda.test.tsx`, E2E de conexão/desconexão e reviews das Tasks 01/03. |
| RF-002 / AC-RF002-01 a AC-RF002-06 | Ocupação local/Google, fuso, indisponibilidade e bloqueio na UI | Passou | `GoogleAgendaCalendarIT` (8 testes), testes de serviço/formulário e E2E de conflito versus indisponibilidade. |
| RF-003 / AC-RF003-02 a AC-RF003-06 | Persistência local, sincronização pendente, worker, retry e estados mostrados | Passou | `GoogleAgendaCalendarIT`, testes de worker e E2E com conexão ausente, estado pendente e nova tentativa; Task 02 review aprovado. |
| RF-004 / AC-RF004-01 e AC-RF004-03 a AC-RF004-05 | Atualização de status, preservação local, estado Google e horário | Passou | `GoogleAgendaCalendarIT`, `PaginaAgenda.test.tsx` e E2E de `REALIZADA`, `FALTA` e `CANCELADA`. |
| RF-005 / AC-RF005-01 e AC-RF005-02 | Eventos Google ocupados não importados à agenda local | Passou | `GoogleAgendaCalendarIT` e implementação da lista local; reviews da Task 02 e Task 03. |
| RF-006 / AC-RF006-01 e AC-RF006-02 | Ausência de edição de data/hora existente e preservação ao mudar status | Passou | `PaginaAgenda.test.tsx`, E2E e `GoogleAgendaCalendarIT`. |
| RNF-001 | Proteção de tokens, estado OAuth seguro e erros sanitizados | Passou | `GoogleAgendaOAuthIT`, `CifraTokenGoogleAgendaTest`, `GoogleAgendaCalendarIT` e testes do cliente HTTP. |
| RNF-002 | Payload mínimo, disclosure e dados fictícios | Passou | Testes de contrato do adapter Google, painel de divulgação e revisão de segurança/privacidade. |
| RNF-003 | Estados claros, teclado, reflow, foco e anúncios live | Passou | 56 testes Vitest/Testing Library, 12 testes Playwright, inspeção visual móvel e verificações de ARIA. |

## Verificações executadas

- Frontend `npm run lint` — aprovado.
- Frontend `npm test -- --run` — 7 arquivos e 56 testes aprovados.
- Frontend `npm run build` — aprovado; inclui `tsc --noEmit`.
- Playwright `npm run e2e` com `E2E_BASE_URL=http://127.0.0.1:5174` e `E2E_API_PROXY_TARGET=http://127.0.0.1:8081` — 12 de 12 testes aprovados. Os fluxos Google foram atendidos por API fake local; o backend isolado usou `PSIQAPP_ANALISE_PROVIDER=fake`.
- Backend `$env:PSIQAPP_ANALISE_PROVIDER='fake'; .\mvnw.cmd --batch-mode --no-transfer-progress clean verify` — BUILD SUCCESS; 45 testes unitários/contexto e 35 testes de integração aprovados com PostgreSQL 18.6 via Testcontainers, incluindo ArchUnit, migrações, contratos, OAuth, disponibilidade e sincronização.
- `docker compose --env-file .env.example -f infra/compose.yaml config --quiet` — aprovado.
- `git diff --cached --check` antes do commit — aprovado.
- Revisão visual da Agenda em 375 px; Playwright verifica viewport de 320 px sem overflow, teclado/foco, redução de movimento, mensagem `aria-live`, rótulos associados e alvo de toque mínimo de 44 px.

## Requisitos não funcionais

- A interface inicia OAuth por navegação ao backend; a SPA usa o endpoint de estado sem credenciais.
- A verificação é obrigatória para a data/hora atual. Conflito, falha do Google e consulta disponível permanecem resultados distintos.
- Os estados usam texto e ações compatíveis; informações assíncronas são anunciadas sem mover o foco.
- O conteúdo enviado ao Google não inclui CPF ou dados do prontuário. Estados finais `REALIZADA`/`FALTA` são divulgados como parte da identificação do evento.

## Segurança / privacidade

O QA final usou dados fictícios. Testes backend utilizam fakes locais; Playwright intercepta a API dos novos fluxos Google e não usa conta Google nem rede do Google. O teste Maven foi executado com provider de análise `fake`. Não foram identificados tokens, dados reais ou conteúdo clínico nas alterações.

## Integrações e falhas

Os testes cobrem falha/revogação de autorização, erro de disponibilidade, conflito ocupado, sincronização pendente/falha, retry e recuperação do estado local. As verificações de disponibilidade e sincronização Google não são exercitadas contra uma conta externa; isso é intencional para a task e está coberto por fakes de contrato no backend.

## Bugs encontrados

Nenhum bug bloqueante ou não bloqueante permaneceu aberto.

## Riscos residuais

- O contexto de uma consulta psiquiátrica pode revelar dado referente à saúde. O MVP continua restrito a dados fictícios; uso real depende das salvaguardas e decisões previstas nas Rules e PRD.
- Após os 35 testes de integração, o Failsafe registrou que encerrou a JVM de fork depois de esperar 30 segundos por sua saída. Todos os testes ficaram verdes e o comando terminou com `BUILD SUCCESS`; a task 03 não altera o backend.
- Uma execução exploratória inicial da suíte reutilizou o backend local existente, então configurado com provider OpenAI. Dois testes de análise expiraram; não foi possível confirmar se uma chamada chegou ao provider. Os fixtures eram fictícios. Essa execução não é usada como evidência de aprovação. O resultado final foi obtido em stack isolada com provider `fake`.
- A conclusão de OAuth contra uma conta Google real não foi realizada e não é requisito dos testes desta task.

## Veredito

Todos os ACs aplicáveis têm evidência de implementação e teste; não há bug aberto nem falha de segurança ou privacidade bloqueante. QA aprovado.
