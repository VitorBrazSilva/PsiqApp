# Review — Task 02

## Status
CHECKPOINT — backend pendente

## Rastreabilidade
| Origem | ID | Status | Evidência |
|---|---|---|---|
| PRD | RF-004 / AC-RF004-01–06 | Coberto | SQL projeta cinco grupos e contagens completas; integração cobre volume >100, todas as contagens, página vazia/fora do limite e igualdade com referência fixa. UI verifica resposta atrasada no prontuário; E2E passou nos grupos, contagens, consulta retroativa, filtro por período e isolamento. O teste de retry confirma novo GET da agenda após o POST. |
| PRD | RF-005 / AC-RF005-01–04 | Coberto | Use case valida e resolve datas civis em São Paulo; integração comprova 23:30 local incluído e 00:00 do dia seguinte excluído por requisições dos respectivos dias civis, além do período parcial. E2E cobre aplicação do período. |
| PRD | RNF-001 / RNF-002 | Coberto | Filtro no banco por paciente, rota `no-store`, resposta atrasada descartada, erro do resumo explícito sem bloquear dados clínicos e erro da lista distinto de vazio. Testes unitários/UI e E2E verificam isolamento nos contextos abrangidos. |
| TechSpec | TS-006 / TS-007 | Coberto | CTE de universo, contagens e paginação em consulta parametrizada; rota antiga preservada; clock fixo e bordas temporais cobertos na integração. |
| TechSpec | TS-008 / TS-009 | Coberto | Painel compartilhado dentro de `features/consultas`; paciente fixo na seção de prontuário; leitura separada da carga clínica; stale responses descartadas; criação/status/retry renovam leitura. |
| TechSpec | TS-010 / TS-011 / TS-012 | Coberto | Estados/labels acessíveis, botões `aria-pressed`, retry com atualização, `no-store` e docs canônicos atualizados. Playwright exercita teclado, foco visível e layouts em 360px/1280px sem overflow, com inspeção dos screenshots reportada pela execução E2E. |

## Arquivos revisados

- Backend: `ConsultaController`, `PaginaAgendaResponse`, `ListarAgendaConsultasUseCase`, `RepositoryConsultaPort`, `GrupoAgendaConsulta`, `PaginaAgendaConsultas`, `AdapterConsultaJpa`, composição de casos de uso e testes unitários/integração.
- Frontend: serviço de consultas, `PainelConsultas`, `FiltrosConsultas`, `useAgendaConsultas`, `PaginaAgenda`, `PaginaProntuario`, testes das páginas e estilos.
- `docs/BUSINESS.md`, `docs/TECHNICAL.md`, Task 02, PRD, TechSpec e Rules de arquitetura, privacidade, testes e manutenção documental.

## Problemas bloqueantes

Nenhum.

## Problemas não bloqueantes

- Durante atualização do painel, o hook limpa a resposta anterior até a nova consulta chegar. As contagens continuam consistentes com o estado de carregamento, mas podem piscar; avaliar retenção visual em refinamento futuro.
- O cabeçalho da Agenda deixou de exibir o contador geral que existia antes da integração; os totais por grupo continuam disponíveis no painel.

## Testes e verificações executadas

- Revisão estática do diff e contexto completo dos arquivos da task.
- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm test -- --run`: 58/58 testes passaram em 7 arquivos.
- `npm run build`: passou.
- `apps/backend/mvnw.cmd verify`: pendente. As integrações anteriores registraram 42 ITs sem falhas; a execução atual falha ao inicializar `PatientAppointmentIT` na suíte (`Container POSTGRES needs to be initialized`). A execução isolada passou; investigar ciclo de vida/cache do Testcontainers antes de aprovar backend.
- E2Es Playwright focados da Task 2 passaram: grupos, período, isolamento, teclado, responsividade e paginação. A suíte completa tem 14 testes: 9 passaram e 5 falharam nos fluxos de análise e Google, fora do escopo, associados à configuração local/execução concorrente. Screenshots em 360px/1280px foram inspecionados.
- `git diff --check`: passou sem erros (apenas avisos de conversão LF/CRLF do Git).

## Pontos positivos

- A nova rota mantém compatibilidade com a rota antiga por instantes e declara `Cache-Control: no-store`.
- SQL parametrizado filtra paciente/período antes das contagens e seleciona o grupo ativo com ordenação determinística por data/ID.
- Resolução de `dataInicial` e início do dia após `dataFinal` usa `America/Sao_Paulo`; a referência temporal é capturada uma vez no use case.
- Componentes de lista/filtros/estado permanecem em `features/consultas`; o prontuário fixa `pacienteId` na consulta e separa a leitura de consultas do carregamento clínico.
- Atualização de status e criação chamam recarga em vez de alterar somente a página local; o hook limita respostas antigas por ID de requisição e aborta leituras anteriores.
- Atualizações canônicas de negócio e técnica são localizadas e condizentes com o comportamento implementado.

## Veredito

CHECKPOINT — revisão de escopo aprovada, mas gate de testes backend permanece aberto devido à falha Testcontainers na suíte completa. Não marcar Task 2 como concluída até `mvnw verify` ficar verde.