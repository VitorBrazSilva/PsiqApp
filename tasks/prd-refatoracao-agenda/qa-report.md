# QA Report — Organização da tela Agenda

## Status

APROVADO — 2026-10-05

QA executado pelo agente responsável pela implementação, em etapa separada dos reviews; não houve revisor independente.

## Matriz de rastreabilidade

| Requisito/AC | Verificação | Resultado | Evidência |
|---|---|---|---|
| RF-001 / AC-RF001-01 | Formulário desmontado ao entrar, sem leitura mensal; botão abre diálogo com paciente | PASS | Vitest “abre cadastro somente por ação”; E2E “organiza a Agenda” |
| RF-001 / AC-RF001-02 | Voltar/cancel, limpeza ao reabrir, foco inicial/retorno e Escape nativo | PASS | Vitest de abertura; E2E Agenda/prontuário |
| RF-001 / AC-RF001-03 | Criação com disponibilidade, fechamento/feedback, busca/manual, conflito/503/repetição segura | PASS | PaginaAgenda.test; google-agenda; melhorias-agenda em UTC/Honolulu |
| RF-002 / AC-RF002-01 | Posições/empilhamento em 320/360/768/1024/1440 px e overflow | PASS | E2E de organização; screenshots em evidencias/ |
| RF-002 / AC-RF002-02 | Conexão/desconexão/reconexão, OAuth fake, divulgação e estados Google | PASS | Seis E2E Google e testes Vitest existentes adaptados |
| RF-003 / AC-RF003-01 | Próxima com nome/data/hora SP, ausência distinta de erro, retry e fallback técnico | PASS | Vitest de contexto/erro/retry/fallback; E2E de organização |
| RF-003 / AC-RF003-02 | Próxima independente de grupo/período, mudança de paciente e chave de montagem | PASS | Vitest “destaca a próxima consulta por paciente”; inspeção da chave/guardas/abort |
| RF-003 / AC-RF003-03 | Renovação por criação/status, foco/visibilidade e timer do hook | PASS | Vitest de status, E2E criação; useAgendaConsultas.test (timer/cleanup) e inspeção dos listeners existentes |
| RNF-001 | Layout responsivo, teclado, rótulos, erro/loading, diálogo/foco | PASS | Playwright nas cinco larguras; inspeção visual desktop/mobile/1024 e diálogo |
| RNF-002 | Mesmos módulos/contratos/dependências; privacidade; fakes locais | PASS | Code review, diff, escopo de rotas interceptadas |

## Verificações executadas

Em `apps/frontend`:

```text
npm.cmd run typecheck
PASS

npm.cmd run lint
PASS

npm.cmd test -- --run
10 arquivos aprovados; 86 testes aprovados

npm.cmd run build
PASS; inclui typecheck

E2E_BASE_URL=http://127.0.0.1:5174
npm.cmd run e2e -- e2e/google-agenda.spec.ts e2e/melhorias-agenda.spec.ts e2e/consultas-prontuario.spec.ts --grep-invert "backend real"
12 testes aprovados

npm.cmd run e2e -- e2e/google-agenda.spec.ts
6 testes aprovados contra o frontend atualizado em 127.0.0.1:5173

npx.cmd playwright test --list
22 testes em seis arquivos
```

Build Docker frontend aprovado. Atualização local com `docker compose --env-file .env -f infra/compose.yaml up -d --no-deps frontend`; nenhuma recriação de backend/PostgreSQL. HTTP `/agenda` retorna 200 e o bundle servido é `index-CuOMwrOh.js`, igual ao build validado. A configuração secreta não foi lida/exposta no relatório.

## Requisitos não funcionais

Inspeção visual de [desktop](evidencias/agenda-desktop.png), [1024 px](evidencias/agenda-1024.png) e [mobile](evidencias/agenda-mobile.png). Coluna de integração alinhada à lista em desktop, fluxo empilhado no mobile e nenhum overflow nas cinco larguras. Diálogo respeita a composição existente e foi verificado nas duas origens por teclado e em 360 px/desktop.

Compatibilidade arquitetural conferida manualmente: somente consultas/estilos/frontend, documentação e artefatos. Não há gate automatizado de fronteiras frontend. Backend/ArchUnit/migrações: N/A, sem alterações.

## Segurança / privacidade

Somente fixtures fictícias e respostas interceptadas. Não houve OAuth Google real, criação de evento externo ou acesso a provider IA. Divulgação Google e guarda de paciente fixo permanecem intactas. Fonte clínica, registros e análise de IA não foram alterados; clinical-safety-review especializado: N/A.

## Integrações e falhas

Testes distinguem ocupação/indisponibilidade, erro de resumo e ausência, desconexão e recuperação da resposta de criação pela chave original. A lista e o formulário mantêm os serviços/API existentes.

## Bugs encontrados

Nenhum bug bloqueante aberto. Ocorrências resolvidas registradas em `bugs.md`.

## Riscos residuais

Suíte integrada que exige backend/PostgreSQL isolados não reexecutada nesta task; contratos/persistência não mudaram. Reviews/QA realizados pelo executor, sem parecer independente. Reabrir descarta o cadastro não confirmado, conforme o padrão existente do prontuário e o PRD.

## Veredito

ACs cobertos, verificações aplicáveis aprovadas e versão local atualizada/validada.
