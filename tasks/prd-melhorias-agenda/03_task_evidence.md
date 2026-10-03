# Evidências — Task 03

Data local: 02/10/2026. Branch: `task/03-agendamento-compartilhado`. Base de revisão: `origin/main` com as Tasks 1 e 2 integradas.

## Implementação e dependência corrigida

Fluxo compartilhado calendário → dia → horário → revisão → confirmação, com API real nas duas origens, paciente selecionado na Agenda/fixo no prontuário, caminho manual retroativo, recuperação idempotente, abort/descarte por contexto, corte temporal do servidor, renovação por visibilidade/conexão e atualização dos painéis após sucesso. Diálogo nativo amplo, tela inteira mobile e retorno de foco ao acionador.

A Task 1 havia implementado `DisponibilidadeMensalResponse` apenas com `mes`/`dias`, divergindo dos metadados previstos na TechSpec § 7. A Task 3 necessita de `hoje`, `verificadoEm`, `fusoHorario` e `fonteDisponibilidade` para cumprir TS-004/005 sem usar o relógio do navegador. Complemento aditivo localizado no resultado do caso de uso/DTO, com a mesma referência capturada depois das leituras e a fonte do serviço Google existente. Não altera regras temporais, ocupação, transações, schema ou limites arquiteturais. Testes de contrato, fonte e referência pós-latência foram acrescentados. Não houve conflito com Rules nem nova decisão arquitetural.

O plano e protótipo da Task 3 existiam na branch de trabalho anterior, mas ainda não em `main`; pertencem à entrega desta task e acompanham o commit final.

## Verificações

| Comando / verificação | Resultado |
|---|---|
| `apps/backend/mvnw.cmd --batch-mode --no-transfer-progress verify` | BUILD SUCCESS, 58 unitários/contexto/arquitetura e 42 integrações, zero falhas/erros/skips. Inclui ArchUnit, logs seguros, concorrência/idempotência, Google fake e migrations Testcontainers. Log local `apps/backend/target/task03-verify.log`. |
| Frontend `npm run typecheck` | Aprovado. |
| Frontend `npm run lint` | Aprovado, zero warnings. |
| Frontend `npm test -- --run` | 73/73, 8 arquivos; repetido após correções e reforço de cleanup/visibilidade. |
| Frontend `npm run build` | Aprovado. |
| `npm run e2e -- --workers=1` | 18/18 aprovados: suíte completa com backend atual, PostgreSQL e provider fake. |
| `npm run e2e -- e2e/melhorias-agenda.spec.ts --workers=1` | 4/4 aprovados no estado final após regressão A → B → A e reforço de foco nativo. Na repetição dos specs afetados, os 5 E2Es de Google também passaram. |
| `git diff --check` | Aprovado; somente avisos de conversão LF/CRLF do Git. |
| Review manual de imports frontend | Lógica específica em consultas; prontuário compõe; sem dependência nova em shared. |

E2Es usaram `E2E_BASE_URL=http://127.0.0.1:5176` e `E2E_API_PROXY_TARGET=http://127.0.0.1:8082`, JAR atual e PostgreSQL 18.6 temporário em 55433, com worker de análise fake. O Compose preexistente em 5173/8080 não foi atualizado. Nenhum provider externo/Google real foi chamado. Relatórios/screenhots/logs de execução ficam em diretórios locais ignorados pelo Git.

## Rastreabilidade verificável

- RF-001 / AC-RF001-01/02/03/07 → TS-002/005/009/010 → Task 3 → calendário/hook/DTO → testes de mês inicial, passado, sábado, abort/mês/conexão, referência e meia-noite; E2E duas origens.
- RF-002 / AC-RF002-01–04 → TS-005/010 → horários/radios/revisão → teste de ordenação/deduplicação/grupos vazios, mês vazio, seleção única e resumo; E2Es UTC/Honolulu.
- RF-003 / AC-RF003-01–07 → TS-004/005/009/011 → formulário/serviço/diálogo → paciente obrigatório/fixo, instante UTC, 409/503, resposta perdida/chave-corpo iguais após vencimento, manual retroativo, atualização de lista/sincronização e cancelamento A/B; E2Es fake/real e ITs existentes.
- RNF-001/002 → TS-011/012 → DTO anônimo, erros locais e contexto isolado → contrato backend sem dados pessoais/provider, transportes sem fallback, falha distinta de vazio, descarte de disponibilidade e criação tardias.

## Acessibilidade e visual

Screenshots inspecionados em `apps/frontend/test-results/agendamento-UTC-360.png`, `agendamento-UTC-1280.png` e `dialogo-agendamento-UTC-360.png`, além da execução em Pacific/Honolulu. Calendário e horários lado a lado no desktop/uma coluna no mobile, foco visível nos radios, estados por texto/semântica, ações alcançáveis por rolagem e ausência de overflow horizontal. Ajustado o contraste dos botões de modo após inspeção. Modal `showModal`, foco inicial, navegação sem alcançar conteúdo de fundo, Escape e retorno ao acionador verificados em Playwright. Ao voltar do chrome do navegador, a busca é renovada como previsto.

## Diagnósticos resolvidos

- Primeira chamada de check frontend na raiz falhou por ausência de `package.json`; checks executados depois em `apps/frontend`.
- Corrigida dependência de memoização apontada pelo lint do hook.
- Corrigida a associação de label do seletor de paciente para não incluir o texto das options no nome acessível.
- Ajustados testes legados para abrir o modo manual/diálogo visível e respeitar a rota de grupos.
- Teste de mês vazio ajustado para a mensagem de status acompanhada de informação de fonte.
- Testes de foco reforçados inicialmente presumiam retorno direto ao primeiro botão em um Tab; diagnóstico mostrou renovação ao retornar do chrome do navegador. Asserções finais verificam modalidade/contenção no conteúdo e foco inicial/retorno, sem presumir a sequência da UI do browser.
- Regressão A → B → A corrigida incrementando a versão e removendo a leitura anterior na mudança de contexto.

## Reviews e manutenção documental

- Task-review: APROVADO.
- Code-review: APROVADO; sem blockers.
- BUSINESS.md: UPDATED — fluxo de busca compartilhado, confirmação e manual retroativo, § 1/4.
- TECHNICAL.md: UPDATED — componentes de consultas, metadados mensais, contexto/tempo/idempotência e API real nas duas origens, § 1/11/14.
- README.md: NOT NEEDED; setup, dependências e comandos permanecem os existentes.

Esta entrega conclui a Task 3, mas não substitui QA e reviews finais da feature. A pasta permanece versionada até READY.
