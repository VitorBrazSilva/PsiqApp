# Task 2.0 — Implementar grupos, período, contagens e paginação nas duas listas

## Objetivo

Status: CONCLUÍDA em 02/10/2026. Task-review aprovado, code-review aprovado com observações e manutenção documental avaliada. Evidências da retomada em `02_task_evidence.md`. Task 3 e QA final permanecem pendentes.

Permitir localizar consultas pelos cinco grupos e por período civil inclusivo na Agenda geral e na área de consultas do prontuário, com paginação e contagens completas calculadas pelo backend e isolamento pelo paciente quando aplicável.

## Rastreabilidade
- PRD: RF-004, RF-005, RNF-001, RNF-002.
- TechSpec: TS-006, TS-007, TS-008, TS-009 (composição das consultas), TS-010 (acessibilidade da lista) e TS-011/012.
- Critérios de aceite: AC-RF004-01 a AC-RF004-06; AC-RF005-01 a AC-RF005-04.

## Dependências

Task 1.0. A implementação da listagem estende o contrato e o adapter de consultas na sequência da mudança da Task 1.0.

## Escopo

- Criar a rota e o caso de uso de agenda por grupo, paciente e par de datas civis; manter a rota antiga de consultas por instantes compatível.
- Calcular uma única referência temporal por requisição. Resolver datas em `America/Sao_Paulo` com início inclusivo e início do dia seguinte ao fim como limite exclusivo.
- Implementar no adapter a página do grupo ativo e as cinco contagens sobre o universo paciente/período usando a estratégia SQL aprovada na TechSpec. Contagens devem continuar corretas em página vazia ou fora do limite.
- Criar `PainelConsultas`, `FiltrosConsultas` e `useAgendaConsultas` dentro de `features/consultas`; compor o mesmo painel na Agenda e na seção de consultas do prontuário.
- Preservar o filtro de paciente da Agenda geral; no prontuário, fixar o `pacienteId` da rota. Buscar consultas sem bloquear carregamento de dados clínicos, descartar respostas antigas e limpar o estado ao trocar de paciente.
- Preservar os dados, transições de status, estado/retry do Google e informações atuais da lista. Recarregar itens e contagens depois das mutações; manter os filtros ao atualizar.
- Manter labels e contagens visíveis e acessíveis em desktop e mobile, incluindo zerados, conforme o PRD e TS-010.

## Fora do escopo da task

- Busca mensal e confirmação de horário, cobertas pelas Tasks 1.0 e 3.0.
- Mudanças em status de consulta, contrato da rota antiga, modelo persistido ou sincronização Google.
- Reestruturação de histórico clínico, registros, análise ou componentes genéricos de `shared`.

## Subtarefas
- [x] 2.1 Implementar `ListarAgendaConsultasUseCase`, validação de período civil, projeção de grupos e paginação/contagens no adapter.
- [x] 2.2 Expor e testar a nova rota e seus contratos, preservando compatibilidade da listagem existente.
- [x] 2.3 Implementar serviço frontend e painel/filtros compartilhados para grupo, período, contagens e paginação.
- [x] 2.4 Integrar o painel à Agenda e ao prontuário, mantendo contexto fixo, resumo da próxima consulta e operações atuais.
- [x] 2.5 Cobrir limites, volumes acima de uma página, isolamento, mutações, erros, acessibilidade e estados responsivos; avaliar documentação aplicável.

## Critérios de sucesso

- As duas telas apresentam os cinco grupos do PRD e contagens completas do paciente/período, independentes da página e incluindo zeros.
- A página contém somente o grupo selecionado, respeita ordenação e desempate estáveis, e a contagem permanece mesmo quando a página não contém itens.
- O filtro de período exige as duas datas válidas; o dia final é inclusivo, inclusive às 23:30, e a meia-noite seguinte fica fora.
- Uma troca de paciente, grupo ou período não exibe consultas do contexto anterior. Falha de consulta não impede a leitura de informações clínicas do prontuário.
- Criação, transição de status e retry Google recarregam itens/contagens mantendo os filtros; a paginação é corrigida se uma mutação esvaziar a página atual.
- A rota antiga por instantes continua compatível; não há carregamento de todas as consultas no browser nem contagem derivada da página.

## Testes obrigatórios
- [x] Unitários: agrupamento temporal, referência única, validação/resolução das datas e paginação.
- [x] Integração: SQL/endpoint com pelo menos 120 consultas fictícias, vários pacientes, status e períodos; percorrer páginas e comparar totais/contagens.
- [x] E2E/sistema: fluxos de filtro por grupo/período, paginação, consulta retroativa em Agendadas anteriores e isolamento entre pacientes nas duas origens.
- [x] Casos de erro/edge cases relevantes: data final 23:30, 00:00 do dia seguinte excluída, período parcial/invertido, timestamp igual à referência, página vazia ou esvaziada por mutação, resposta de paciente anterior atrasada e falha de API.
- [x] Verificar teclado, foco, contagens visíveis em 360 px e desktop; usar somente dados fictícios.

## Skills aplicáveis

`ui-ux-pro-max` para filtros, contagens, controles acessíveis e apresentação responsiva; seguir a direção visual existente e TS-010, sem criar design system ou dependência nova.

## Módulo/responsabilidade e Rules aplicáveis
- Módulo e responsabilidade existentes que esta task altera: `application/usecase` para consulta; `application/port/out` e `adapter/out/persistence` para contrato e SQL; `adapter/in/web` para rota/DTO; `features/consultas` para serviço, painel, filtros e estado; `PaginaAgenda` e `PaginaProntuario` para composição.
- Rules/TS de arquitetura que a task precisa preservar: `.agents/rules/architecture-boundaries.md`, `.agents/rules/clinical-data-privacy.md`, `.agents/rules/testing-quality.md` e `.agents/rules/documentation-maintenance.md`; TS-006–009 e TS-011/012. Lógica de consulta permanece em `features/consultas`; `shared` fica restrito a responsabilidades transversais.
- Verificação correspondente (ou `N/A`, com motivo): testes de integração com banco e paciente A/B, testes de componentes/páginas e `ArquiteturaTest`; review manual da separação `features/shared` conforme lacuna registrada na TechSpec.

## Arquivos/módulos prováveis

- Backend: `ListarAgendaConsultasUseCase`, novos contratos em `application/port/out`, `AdapterConsultaJpa`, `ConsultaController` e DTOs de agenda.
- Frontend: novos `PainelConsultas.tsx`, `FiltrosConsultas.tsx`, `useAgendaConsultas.ts`; `servicoConsultas.ts`, `PaginaAgenda.tsx`, `PaginaProntuario.tsx`, `ListaConsultas.tsx` e CSS local.
- Testes backend de use case/integração e testes frontend das duas páginas; Playwright para os fluxos cobertos.
- Avaliar atualizações localizadas em `docs/BUSINESS.md` e `docs/TECHNICAL.md`; README somente se configuração ou operação mudar.

## Adendo de QA final — 02/10/2026

QA-001/002/003 corrigidos conforme TS-008/009/010: GET da lista ao atravessar início de consulta visível, renovação do resumo ao retornar à janela/aba e SVGs decorativos de dia/hora nas listas. Revisão funcional e técnica APROVADAS: classificação/contagens no backend, cleanup de timer/listeners, contextos preservados e ícones aria-hidden sem alterar texto/ações. Testes de regressão no hook/prontuário; frontend final com typecheck/lint/build e 75 testes aprovados, 18 E2Es aprovados e imagens finais inspecionadas. Manutenção documental: BUSINESS/TECHNICAL atualizados; README sem necessidade. Detalhes em bugs.md e qa-report.md. Status da Task 2 permanece APROVADO, com observações visuais anteriores não bloqueantes.
