# QA Report — Melhorias na Agenda

## Status
APROVADO

Data local: 02/10/2026. Base: `d1fddae`, com correções de encerramento registradas em `bugs.md`. Verificação executada nesta sessão, conforme `sdd-workflow/execute_qa.md`; não é execução de CI remoto.

## Matriz de rastreabilidade
| Requisito/AC | Verificação | Resultado | Evidência |
|---|---|---|---|
| AC-RF001-01 | Hoje/futuro, fins de semana e passado | APROVADO | DisponibilidadeAgendaTest; DisponibilidadeMensal.test.tsx |
| AC-RF001-02 | Uma hora inteira livre e adjacência | APROVADO | DisponibilidadeAgendaTest; GoogleAgendaCalendarIT |
| AC-RF001-03 | Passo 30 min, 23:30 e corte após latência | APROVADO | DisponibilidadeAgendaTest; ConsultarDisponibilidadeMensalUseCaseTest; DisponibilidadeMensal.test.tsx |
| AC-RF001-04 | AGENDADA bloqueia; estados finais liberam | APROVADO | GoogleAgendaCalendarIT |
| AC-RF001-05 | FreeBusy bloqueia sem detalhes de eventos | APROVADO | GoogleAgendaCalendarIT; GoogleAgendaCalendarAdapterTest |
| AC-RF001-06 | Local desconectado; Google ativo falha sem slots | APROVADO | GoogleAgendaCalendarIT; VerificarDisponibilidadeConsultaUseCaseTest; google-agenda.spec.ts |
| AC-RF001-07 | Busca compartilhada nas duas origens | APROVADO | melhorias-agenda.spec.ts |
| AC-RF002-01 | Ordenação, deduplicação e quatro períodos | APROVADO | DisponibilidadeMensal.test.tsx |
| AC-RF002-02 | Seleção única e revisão data/dia/hora | APROVADO | DisponibilidadeMensal.test.tsx; melhorias-agenda.spec.ts |
| AC-RF002-03 | Dia indisponível e mês vazio distintos de falha | APROVADO | DisponibilidadeMensal.test.tsx |
| AC-RF002-04 | Mesma seleção/revisão nas duas origens | APROVADO | melhorias-agenda.spec.ts |
| AC-RF003-01 | Paciente correto, instante recebido, AGENDADA | APROVADO | PatientAppointmentIT; melhorias-agenda.spec.ts |
| AC-RF003-02 | Revalidação e concorrência sem sobreposição | APROVADO | GoogleAgendaCalendarIT; melhorias-agenda.spec.ts |
| AC-RF003-03 | 503 sem consulta/intenção nem slots antigos | APROVADO | GoogleAgendaCalendarIT; melhorias-agenda.spec.ts |
| AC-RF003-04 | Persistência local e sincronização/retry posteriores | APROVADO | GoogleAgendaCalendarIT; google-agenda.spec.ts |
| AC-RF003-05 | Busca sem passado e manual retroativo | APROVADO | DisponibilidadeMensal.test.tsx; melhorias-agenda.spec.ts |
| AC-RF003-06 | Paciente obrigatório na Agenda | APROVADO | melhorias-agenda.spec.ts; PaginaAgenda.test.tsx |
| AC-RF003-07 | Paciente fixo e descarte de A em B/A | APROVADO | PaginaProntuario.test.tsx; DisponibilidadeMensal.test.tsx; melhorias-agenda.spec.ts |
| AC-RF004-01 | Cinco grupos; 120 registros; contagens fora da página | APROVADO | PatientAppointmentIT; fluxos-principais.spec.ts |
| AC-RF004-02 | Próximas por referência do servidor; igualdade inclusiva | APROVADO | PatientAppointmentIT; ListarAgendaConsultasUseCaseTest; useAgendaConsultas.test.tsx |
| AC-RF004-03 | Agendadas anteriores, inclusive retroativas | APROVADO | PatientAppointmentIT; melhorias-agenda.spec.ts |
| AC-RF004-04 | Estados finais em seus grupos | APROVADO | PatientAppointmentIT; fluxos-principais.spec.ts |
| AC-RF004-05 | Listas/contagens isoladas e respostas tardias | APROVADO | PatientAppointmentIT; PaginaProntuario.test.tsx; fluxos-principais.spec.ts |
| AC-RF004-06 | Dados, ações, sync/retry e ícones de data/hora | APROVADO | PaginaAgenda.test.tsx; google-agenda.spec.ts; inspeção agenda-360.png/agenda-desktop.png |
| AC-RF005-01 | Extremidades civis inclusivas; dia seguinte excluído | APROVADO | PatientAppointmentIT; ListarAgendaConsultasUseCaseTest |
| AC-RF005-02 | Sem período/limpeza remove corte | APROVADO | ListarAgendaConsultasUseCaseTest; fluxos-principais.spec.ts |
| AC-RF005-03 | Período aplicado às listas e contagens | APROVADO | PatientAppointmentIT; fluxos-principais.spec.ts |
| AC-RF005-04 | Par incompleto/invertido: erro UI/API | APROVADO | ListarAgendaConsultasUseCaseTest; PatientAppointmentIT; testes frontend |
| RNF-001 | DTO mínimo, isolamento, erros/logs sanitizados | APROVADO | BackendApiContractIT; LogsSegurosTest; PaginaProntuario.test.tsx |
| RNF-002 | Vazio distinto de falha; nenhum slot velho após 503 | APROVADO | DisponibilidadeMensal.test.tsx; melhorias-agenda.spec.ts |

Os arquivos Java referidos estão em `apps/backend/src/test/java/com/psiqapp/` e subpacotes; testes React em `apps/frontend/src/features/`; specs em `apps/frontend/e2e/`. RF-001 a RF-005 são cobertos por todos os respectivos ACs acima. Detalhamento histórico: reviews/evidências das Tasks 1–3.

## Verificações executadas
- Backend: `mvnw.cmd --batch-mode --no-transfer-progress verify` — BUILD SUCCESS, 58 testes unitários/contexto/arquitetura e 42 ITs; zero falhas, erros ou skips. Migrations/Testcontainers PostgreSQL 18.6 incluídos. Log ignorado: `apps/backend/target/feature-qa-verify.log`.
- Extensão ArchUnit prevista pela TS-012: `mvnw.cmd --batch-mode --no-transfer-progress -Dtest=ArquiteturaTest test` — BUILD SUCCESS, 2/2 aprovados; log `target/feature-qa-architecture.log`.
- Frontend final: typecheck, lint sem warnings, 75/75 testes em 9 arquivos e build aprovados.
- Playwright final: `npm run e2e -- --workers=1` — 18/18 aprovados, 39,6 s. Log ignorado: `apps/frontend/feature-qa-e2e.log`.
- Compose: `docker compose --env-file .env.example -f infra/compose.yaml config --quiet` aprovado.
- `git diff --check` sem erros; avisos LF/CRLF são conversão do Git.
- Inspeção real das imagens de 360 px/1280 px, Agenda/lista e diálogo: legibilidade, foco e controles alcançáveis, sem overflow horizontal. E2Es verificam teclado, Escape, contenção/retorno de foco e instante UTC sob UTC/Honolulu.
- Review manual das fronteiras frontend: lógica em consultas; prontuário compõe; nenhuma lógica específica nova em shared. Não existe gate automatizado frontend para essa fronteira.

## Requisitos não funcionais
RNF-001 e RNF-002 aprovados conforme matriz. PRD não fixa meta numérica de desempenho. Busca mensal faz uma leitura local e no máximo uma consulta lógica Google, confirmadas por código/testes do caso de uso, sem SQL/HTTP por slot. Não foi executado benchmark de produção.

## Segurança / privacidade
Somente fixtures fictícias, providers fake e Google mock/local. Disponibilidade retorna datas/instantes e metadados, sem paciente/observação/evento/credencial; listas e callbacks respeitam o contexto do paciente. Contratos no-store e logs allowlist preservados. Gate de prontuário em `clinical-safety-review.md`.

## Integrações e falhas
E2Es em Vite 5176 → backend atual 8082 → PostgreSQL temporário 55433, com worker de análise habilitado/provider fake. Google real/OpenAI não foram chamados. Confirmados conflito, 503 ativo, perda de resposta/reenvio idempotente, manual retroativo, estados/retry e persistência local após falha de sincronização. Os serviços habituais do Compose não foram atualizados.

Primeira tentativa de verify falhou porque o Docker estava parado; após iniciar Docker Desktop, a suíte completa passou. O log do verify verde contém aviso de encerramento tardio do JVM fork do Failsafe, com BUILD SUCCESS e 42 ITs aprovados; não houve teste ignorado.

## Bugs encontrados
Quatro lacunas encontradas/corrigidas no fechamento, detalhadas em `bugs.md`: atualização temporal da lista, resumo ao retornar, ícones das listas e restrição Google no ArchUnit. Nenhum bloqueador aberto.

## Riscos residuais
- Disponibilidade não reserva horário; Google pode mudar depois da última FreeBusy, conforme risco explicitamente aceito na TechSpec.
- Atualização temporal da lista agenda um GET pelo relógio do navegador; classificação/contagens continuam exclusivamente no servidor. Divergência do relógio pode adiantar/atrasar essa renovação; retorno à aba também renova. Corte da busca mensal continua pela referência do servidor.
- Mobile exige rolagem vertical; contagens podem piscar durante recarga, conforme observações não bloqueantes das tasks.
- Validação local com dados fictícios; não declara prontidão para dados reais.

## Veredito
APROVADO: todos os 28 ACs e os dois RNFs possuem evidência; não há falha obrigatória ou bug bloqueante aberto. Review final verifica também documentação e gates SDD.
