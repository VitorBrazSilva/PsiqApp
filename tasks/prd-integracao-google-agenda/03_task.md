# Task 3.0 — Integrar os fluxos da Agenda e validar a experiência completa

## Objetivo

Integrar os contratos de OAuth, disponibilidade e sincronização à página `/agenda`, mantendo a agenda local compreensível e acessível em todos os estados de integração.

## Rastreabilidade
- PRD: RF-001 a RF-006, RNF-001, RNF-002, RNF-003.
- TechSpec: TS-001, TS-005, TS-006.
- Critérios de aceite: AC-RF001-01 a AC-RF001-06; AC-RF002-01 a AC-RF002-06; AC-RF003-02 a AC-RF003-06; AC-RF004-01, AC-RF004-03, AC-RF004-05; AC-RF005-01 e AC-RF005-02; AC-RF006-01 e AC-RF006-02.

## Dependências

Tasks 1.0 e 2.0 aprovadas, com contratos HTTP disponíveis para o frontend.

## Escopo

- Adicionar à página Agenda painel de conexão/status Google e ações compatíveis para conectar, reconectar e desconectar; tratar `NAO_CONFIGURADA`, `NAO_CONECTADA`, `DESCONECTADA`, `CONECTADA` e `INDISPONIVEL`.
- Antes da autorização, explicar quais dados identificam o evento e que permissões de compartilhamento do calendário controlam sua visibilidade. Informar que a desconexão não remove eventos já criados.
- No formulário de nova consulta, oferecer verificação explícita da data/hora candidata. Invalidar a disponibilidade quando a data/hora mudar; bloquear criação sem verificação válida, em horário ocupado ou durante falha de conexão ativa.
- Distinguir conflito de horário de falha ao consultar o Google. Mostrar estados de verificação, indisponibilidade, conexão e sincronização com ação de recuperação quando houver.
- Mostrar estado Google por consulta, incluindo `SINCRONIZADA`, `AGUARDANDO_CONEXAO`, `PENDENTE`, `FALHA` e `NAO_APLICAVEL`; oferecer nova tentativa quando aplicável.
- Preservar lista, filtros, paginação e criação/status local existentes; eventos Google ocupados não podem ser adicionados à lista de consultas.
- Manter acessibilidade por teclado, foco visível, labels/erros associados, anúncio de mudanças assíncronas, informação textual além de cor/ícone, alvos de toque e layout móvel definidos em TS-001.
- Atualizar testes de componente/fluxo e Playwright; completar instruções de uso e documentação viva pertinente após o fluxo real existir. Não indicar disponibilidade da feature antes da implementação verificada; passar pelo `project-documentation-maintainer`.

## Fora do escopo da task

- Criar ou alterar endpoints, persistência, worker ou integração Google, cobertos pelas tasks 1.0 e 2.0.
- Importar/exibir títulos, participantes, descrições ou outros dados de eventos existentes no Google.
- Criar grade mensal, expediente, horários sugeridos ou editar data/hora de consulta já criada.

## Subtarefas

- [ ] 3.1 Adicionar serviço/contratos da feature para estado, OAuth, disponibilidade e nova tentativa de sincronização.
- [ ] 3.2 Integrar painel de conexão, disclosure e estados de recuperação em `PaginaAgenda`.
- [ ] 3.3 Integrar verificação e invalidação de disponibilidade em `FormularioConsulta`.
- [ ] 3.4 Integrar indicadores e ação de sincronização em `ListaConsultas`.
- [ ] 3.5 Cobrir estados, falhas e acessibilidade em Vitest/Testing Library e Playwright; atualizar documentação operacional.

## Critérios de sucesso

- Cada estado da integração tem texto e ação compatíveis; ambiente não configurado não oferece ação impossível e mantém criação local permitida.
- A autorização é iniciada por navegação ao backend; nenhum client secret, access token, refresh token ou código OAuth é exposto à SPA.
- A criação só pode ser solicitada após verificar a data/hora atual; mudar o campo invalida o resultado. Conflito e indisponibilidade mostram mensagens e ações diferentes.
- O painel/lista apresenta pendência ou falha por consulta, permite tentar novamente quando aplicável e comunica consultas legadas sem evento como `NAO_APLICAVEL`.
- A agenda do PsiqApp continua exibindo apenas consultas locais; atualizar status Google mantém data e hora; desconectar informa que eventos existentes permanecem no Google.
- Fluxos funcionam por teclado e em tela estreita; status não depende somente de cor, mensagens estão associadas aos campos e anúncios assíncronos não movem o foco.
- README e documentação humana descrevem somente fluxos implementados; a documentação passa pelo `project-documentation-maintainer` antes do commit.

## Testes obrigatórios
- [ ] Unitários/componente: estados de conexão/sincronização, verificação e invalidação por alteração da data/hora, bloqueio de envio, mensagens distintas e nova tentativa.
- [ ] Integração: cliente HTTP da feature para rotas novas, erros Problem Details e resposta sem credenciais/detalhes Google.
- [ ] E2E/sistema: conectar/desconectar; sem conexão; conflito local/Google; falha de disponibilidade; consulta pendente e sincronizada; atualização de `REALIZADA`/`FALTA`; cancelamento; consulta legada.
- [ ] Acessibilidade/responsividade: teclado e foco, leitor de tela/announcements, labels e erros, zoom/reflow, breakpoint móvel e `prefers-reduced-motion`.
- [ ] Casos de erro/edge cases: configuração ausente, autorização revogada, consulta ocupada, indisponibilidade sem falso conflito, erro ao sincronizar, nova tentativa e mudança de data/hora depois de uma verificação.
- [ ] E2E usa backend/fakes locais e dados fictícios; não depende de conta Google ou rede externa.

## Skills aplicáveis

Seguir `ui-ux-pro-max` e `frontend-design` conforme TS-001 e a matriz de compatibilidade da TechSpec; preservar tokens, padrões e componentes existentes da Agenda.

## Módulo/responsabilidade e Rules aplicáveis
- Módulo e responsabilidade existentes que esta task altera: `apps/frontend/src/features/consultas` — `PaginaAgenda`, `FormularioConsulta`, `ListaConsultas` e `servicoConsultas`; `shared` somente para recurso comprovadamente transversal.
- Rules/TS de arquitetura que a task precisa preservar: `.agents/rules/architecture-boundaries.md`, `.agents/rules/clinical-data-privacy.md` e `.agents/rules/testing-quality.md`; TS-001, TS-005 e TS-006. Não transferir detalhes de provider para o domínio/frontend nem introduzir estado/cache global sem necessidade.
- Verificação correspondente (ou `N/A`, com motivo): typecheck, lint, Vitest/Testing Library, Playwright e revisão manual de teclado/foco/leitor de tela/viewport; usar apenas dados fictícios.

## Arquivos/módulos prováveis

- `apps/frontend/src/features/consultas/PaginaAgenda.tsx`.
- `apps/frontend/src/features/consultas/FormularioConsulta.tsx` e `ListaConsultas.tsx`.
- `apps/frontend/src/features/consultas/servicoConsultas.ts` ou serviço específico de integração da feature.
- CSS existente da Agenda e `PaginaAgenda.test.tsx`/novos testes de componente e E2E.
- `README.md`, `docs/BUSINESS.md` e `docs/TECHNICAL.md`, conforme o comportamento implementado.
