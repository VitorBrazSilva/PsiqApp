# Task 3.0 — Construir o fluxo compartilhado de busca e agendamento

## Objetivo

Entregar nas duas origens o fluxo de busca mensal, seleção de horário, revisão e confirmação de consulta. Usar o protótipo da feature como referência visual, adaptar a apresentação a desktop e mobile e preservar a seleção obrigatória de paciente na Agenda, o paciente fixo no prontuário e o cadastro manual retroativo.

## Rastreabilidade
- PRD: RF-001, RF-002, RF-003, RNF-001, RNF-002.
- TechSpec: TS-004 (frontend), TS-005, TS-009 (composição do formulário), TS-010 (calendário e acessibilidade), TS-011 e TS-012.
- Critérios de aceite: AC-RF001-01 a AC-RF001-03 e AC-RF001-07; AC-RF002-01 a AC-RF002-04; AC-RF003-01 a AC-RF003-07.
- Referência visual: [prototipo/agenda.png](prototipo/agenda.png).

## Dependências

Tasks 1.0 e 2.0. A Task 1.0 fornece o contrato de disponibilidade/criação e a Task 2.0 integra a recarga do painel e contagens depois de mutações.

## Escopo

- Adicionar serviço/tipos frontend para a consulta mensal e usar a API real de consultas na Agenda e no prontuário.
- Implementar `CalendarioDisponibilidade`, `HorariosDisponiveis` e `useDisponibilidadeMensal`; evoluir `FormularioConsulta` para o mesmo caminho de busca, seleção, revisão e confirmação nas duas origens.
- Usar a imagem versionada da feature como inspiração: preservar a navegação/contexto da aplicação; em desktop, organizar calendário e horários lado a lado, com etapas, resumo da data/hora/paciente e ação de confirmação em destaque. Na Agenda geral, usar a largura disponível da área de conteúdo; no prontuário, usar o diálogo amplo previsto na TechSpec.
- Em telas pequenas, organizar o fluxo em uma coluna e expandir o diálogo do prontuário para ocupar a tela. Manter os controles utilizáveis por toque e teclado, com foco visível, labels/estados acessíveis e sem rolagem horizontal da página.
- Fora do prontuário, exigir a seleção de paciente antes da confirmação; no prontuário, omitir o seletor e vincular a consulta ao paciente da rota atual.
- Manter o caminho secundário manual para data/hora e consultas retroativas, usando a verificação exata atual. Alternar entre busca e entrada manual deve limpar seleções/verificações incompatíveis.
- Revalidar criação pela API sem reservar slots. Manter corpo e chave de idempotência ao repetir resposta incerta; em 409 invalidar o slot e renovar a busca; em 503 Google remover disponibilidade anterior e impedir confirmação até nova busca válida.
- Cancelar/descartar respostas de requisições antigas, mudanças de paciente, mês, conexão Google ou rota; atualizar horários de hoje antes do envio e renovar dados ao voltar à janela/aba.
- Após confirmação, fechar o diálogo quando aplicável, recarregar consulta/contagens do painel e preservar a informação de sincronização Google.

## Fora do escopo da task

- Regras temporais, rotas e persistência de disponibilidade/criação, cobertas pela Task 1.0.
- Endpoint, SQL, filtros e paginação das listas, cobertos pela Task 2.0.
- Nova biblioteca de calendário/ícones, design system, localStorage/cache, autenticação ou mudanças nas regras Google.

## Subtarefas
- [x] 3.1 Adicionar contratos frontend de disponibilidade mensal e ajuste de idempotência da criação.
- [x] 3.2 Criar calendário, hook e lista de horários com estados de carregamento, mês vazio, erro, seleção e revisão.
- [x] 3.3 Integrar o formulário compartilhado às duas origens, incluindo paciente, caminho manual e estados de conflito/Google.
- [x] 3.4 Aplicar a referência visual em desktop e adaptar painel/diálogo para mobile e acessibilidade.
- [x] 3.5 Cobrir os fluxos nas duas telas, dados tardios, fusos, teclado, responsividade e avaliação documental aplicável.

## Critérios de sucesso

- O médico navega pelos meses permitidos, identifica datas com horários livres, escolhe um horário e revisa data completa, dia da semana, hora e paciente antes de confirmar.
- A seleção e a apresentação usam o fuso `America/Sao_Paulo`; o instante da API não é reinterpretado pelo fuso do navegador. Datas e slots passados não podem ser confirmados no fluxo de busca.
- Os mesmos passos funcionam na Agenda e no prontuário; o paciente é obrigatório na primeira e fixo pela rota na segunda. Respostas atrasadas não cruzam pacientes.
- A falha Google é apresentada separadamente de agenda sem horários; a falha e o conflito invalidam resultados antigos e oferecem recuperação coerente.
- O reenvio após resposta perdida reaproveita a mesma chave e corpo; criação bem-sucedida atualiza as consultas e contagens sem remover a sincronização.
- O fluxo manual continua permitindo consultas retroativas e mantém sua verificação atual.
- A composição segue o protótipo sem ocultar a navegação/contexto da aplicação; em 360 px e desktop, conteúdo e ações permanecem acessíveis sem overflow horizontal.

## Testes obrigatórios
- [x] Unitários: contratos/serviço frontend, hook, ordenação e agrupamento dos horários, mudança de mês, abortamento e atualização do corte temporal.
- [x] Integração de interface: seleção progressiva, revisão, validações, paciente selecionado/fixo, caminho manual e atualização da lista.
- [x] E2E/sistema: completar agendamento na Agenda e no prontuário; incluir fim de semana, conflito entre busca e criação, indisponibilidade Google e consulta retroativa manual.
- [x] Casos de erro/edge cases relevantes: resposta de criação perdida com repetição idempotente, mudança de paciente/mês/aba, resposta fora de ordem, meia-noite, datas/horários em fuso de navegador diferente e conexão alterada.
- [x] Acessibilidade/responsividade: teclado, foco, labels e mensagens anunciadas, diálogo com foco/fechamento/retorno ao acionador, 360 px e desktop; não depender de serviços externos.

## Skills aplicáveis

`ui-ux-pro-max` conforme TS-005/010, usando a referência aprovada e as convenções existentes do PsiqApp. Sem biblioteca visual nova.

## Módulo/responsabilidade e Rules aplicáveis
- Módulo e responsabilidade existentes que esta task altera: componentes, hooks e serviços em `features/consultas`; composição em `PaginaAgenda` e `PaginaProntuario`; estilos em `styles.css`. O prontuário mantém responsabilidade de compor consultas sem mover regras de consulta para `shared` ou para módulos clínicos.
- Rules/TS de arquitetura que a task precisa preservar: `.agents/rules/architecture-boundaries.md`, `.agents/rules/clinical-data-privacy.md`, `.agents/rules/product-invariants.md` e `.agents/rules/testing-quality.md`; TS-004/005/009/010–012. Usar somente dados fictícios, API real nas duas origens, não expor dados de outro paciente e não alterar registros ou análise clínica.
- Verificação correspondente (ou `N/A`, com motivo): testes de páginas/componentes e Playwright nas duas origens; testar troca de paciente A/B com resposta atrasada; revisar imports `features/shared`, teclado, foco e viewport manualmente, pois a TechSpec não registra gate frontend automatizado.

## Arquivos/módulos prováveis

- `apps/frontend/src/features/consultas/servicoConsultas.ts`, `FormularioConsulta.tsx` e novos `CalendarioDisponibilidade.tsx`, `HorariosDisponiveis.tsx`, `useDisponibilidadeMensal.ts`.
- `apps/frontend/src/features/consultas/PaginaAgenda.tsx`, `ListaConsultas.tsx`; `apps/frontend/src/features/registros-clinicos/PaginaProntuario.tsx`; `styles.css`.
- Referência visual versionada em `tasks/prd-melhorias-agenda/prototipo/agenda.png`.
- Testes Vitest/Testing Library das consultas, `PaginaAgenda.test.tsx`, `PaginaProntuario.test.tsx` e novos/atualizados specs Playwright.
- Avaliar `docs/BUSINESS.md` e `docs/TECHNICAL.md` após implementar o fluxo; README somente se a operação/configuração mudar.

## Conclusão — 02/10/2026

Task 3 concluída conforme `execute_task.md`: testes/checks aprovados, task-review APROVADO, code-review APROVADO sem blockers e manutenção documental concluída. BUSINESS/TECHNICAL atualizados; README não necessita alteração. Evidências em `03_task_evidence.md`; reviews em `03_task_review.md` e `03_task_code_review.md`.

Durante a execução foi corrigida uma lacuna do contrato entregue pela Task 1: metadados `hoje`, `fusoHorario`, `verificadoEm` e `fonteDisponibilidade` previstos na TechSpec § 7, necessários para TS-004/005. Complemento aditivo no resultado/DTO e testes, sem alteração de regra temporal, persistência ou arquitetura. Justificativa e verificação registradas nas evidências.

A conclusão desta task não declara a feature READY. `execute_qa` e reviews finais permanecem etapas seguintes; preservar esta pasta até o encerramento do workflow.
