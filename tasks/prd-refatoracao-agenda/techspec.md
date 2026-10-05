# TechSpec — Organização da tela Agenda

## 1. Resumo executivo

Compor a Agenda com botão de agendamento, contexto superior e grade lista/lateral. Reutilizar `DialogoConsulta`, `ProximaConsulta` e `useAgendaConsultas` em `features/consultas`, na stack React/Vite existente.

## 2. Requisitos de origem

| Requisito | Cobertura técnica |
|---|---|
| RF-001 | TS-001 |
| RF-002 | TS-002 |
| RF-003 | TS-003 |
| RNF-001 | TS-001, TS-002, TS-003 |
| RNF-002 | TS-001, TS-003 |

## 3. Arquitetura e fluxo de dados

`PaginaAgenda` compõe componentes de consultas; estes usam os serviços existentes, que consomem `shared/api`. Backend e fronteiras permanecem intactos. Estado local controla a montagem do diálogo e a versão de atualização da agenda.

## 4. Componentes

### TS-001 — Diálogo compartilhado
**Responsabilidade:** Tornar `pacienteId` opcional em `DialogoConsulta`: na Agenda, o formulário oferece o seletor existente; no prontuário, mantém paciente fixo e a guarda da criação. Receber opcionalmente o estado de integração da Agenda, conservando a leitura própria no prontuário. Abrir apenas por botão; preservar `showModal`, fechamento e foco. Sucesso fecha e renova a lista/contexto com mensagem explícita.
**Requisitos relacionados:** RF-001, RNF-001, RNF-002.

### TS-002 — Organização responsiva
**Responsabilidade:** Grade principal `minmax(0, 1fr)` e lateral de 318 px, com ajuste intermediário e empilhamento em viewport estreita. Manter tipografia e cores existentes: texto #24382f/#62716a, ação #285c47, superfícies #ffffff/#f1f6f0 e bordas #d7e3d4. Lista branca, integração com tratamento da lateral do prontuário. Estilos locais não redefinem o sistema visual global.
**Requisitos relacionados:** RF-002, RNF-001.

### TS-003 — Contexto de próxima consulta da Agenda
**Responsabilidade:** `ProximaConsultaAgenda` reutiliza `useAgendaConsultas(pacienteId, 1)` no grupo inicial Próximas, sem filtros da lista. A primeira AGENDADA usa `ProximaConsulta`, com nome opcional do paciente; fallback técnico existente quando o cadastro não está na página. Montar por chave do filtro de paciente para descartar respostas/contexto anteriores. Renovar por versão ao criar/finalizar; eventos de foco/visibilidade e timer ficam no hook existente. Mostrar carregamento, ausência e falha com retry.
**Requisitos relacionados:** RF-003, RNF-001, RNF-002.

## 5. Interfaces e contratos

Props opcionais locais do diálogo e da apresentação de próxima consulta. HTTP permanece inalterado.

## 6. Modelo de dados e persistência

Sem mudança.

## 7. APIs / entradas e saídas

Leitura adicional existente: `/api/v1/agenda/consultas`, `grupo=PROXIMAS`, `pagina=0`, `tamanho=1`, `pacienteId` opcional. Ordenação e seleção temporal permanecem responsabilidade do backend.

## 8. Integrações externas

Mesmos contratos Google, sem OAuth real nem provider externo nos testes.

## 9. Tratamento de erros e resiliência

Reutilizar estados seguros, AbortSignal e idempotência existentes. Erro de próxima consulta não é convertido em ausência. Fechar desmonta o formulário e aborta operações locais como no prontuário.

## 10. Segurança, privacidade e compliance

Preservar divulgação de nome/e-mail/horário e permissões Google. Testar exclusivamente fixtures fictícias e rotas HTTP interceptadas. Nenhuma informação clínica entra no destaque ou integração.

## 11. Observabilidade

Sem logs novos; evidências em relatórios e screenshots locais de QA.

## 12. Estratégia de testes

### Unitários
Adaptar `PaginaAgenda.test.tsx` para abrir o diálogo; verificar montagem sob demanda, foco/limpeza, seleção de próxima independente da lista, filtro de paciente, erro/retry e renovação por status. Executar a suíte frontend completa, incluindo isolamento do prontuário e disponibilidade mensal.

### Integração
Testing Library cobre composição/serviços com fetch fake. Backend/migrações/ArchUnit: N/A, pois não mudam módulos nem fronteiras.

### E2E / fluxos de sistema
Adaptar testes fake Google/busca mensal ao acionador e ao diálogo. Verificar distribuição dos painéis em 320/360/768/1024/1440 px, abertura por teclado, Escape, foco e confirmação; renderizar screenshots para inspeção visual. Testes que requerem backend isolado só serão executados se o ambiente seguro estiver disponível.

### Contrato, segurança ou domínio específico
Conferir preservação do isolamento fixo no prontuário, feedback seguro e divulgação Google. Gate clínico especializado: N/A, sem alteração de fonte clínica ou IA.

## 13. Sequenciamento recomendado

Uma task coesa: composição → estilos → adaptação/execução de testes → reviews → manutenção documental → QA e feature review.

## 14. Decisões e trade-offs

Reutilizar o diálogo do prontuário satisfaz a abertura por botão e consistência pedidas. Reutilizar o hook da lista para uma leitura de tamanho 1 evita outro ciclo de requests/timers e garante contexto independente dos filtros da lista. A leitura adicional é limitada e não exige novo contrato nem biblioteca.

## 15. Riscos técnicos e mitigação

Evitar nome/paciente antigo após filtro: chave de montagem, AbortController e testes de contexto. Evitar esconder privacidade por compactação: divulgação permanece visível. Não derivar próxima consulta da página/grupo atual.

## 16. Conformidade com rules e skills

| Restrição/Rule | Fonte | Módulo e responsabilidade existentes | Decisão da feature | Verificação |
|---|---|---|---|---|
| Features vs shared | architecture-boundaries; TECHNICAL §3/14 | consultas: agenda, formulário, hooks e apresentação | Reuso dentro de consultas, sem módulo transversal novo | Diff, typecheck, code review |
| Isolamento de paciente | clinical-data-privacy | Diálogo fixo no prontuário; leituras abortáveis | Preservar guarda fixa; chave por filtro na Agenda | Vitest/prontuário, E2E fake |
| Contratos e fonte de verdade | BUSINESS §4; product-invariants | Serviços frontend e API existentes | Nenhuma alteração de backend/contrato | Diff, testes de criação/status/disponibilidade |
| Testes com fakes | testing-quality | Vitest/Playwright existentes | Fixtures locais; nenhum Google real | Execuções e logs QA |
| Documentação de estado atual | documentation-maintenance | BUSINESS/TECHNICAL/README | Atualização localizada do fluxo e composição | Review documental |

`frontend-design` e `ui-ux-pro-max`: consistência com a referência explícita do usuário, formulário sob demanda e foco visível. Consulta local UX “modal focus return” confirmou foco visível em controles modais. Nenhuma divergência relevante entre fontes canônicas e código afetado encontrada.

## 17. Arquivos/módulos impactados

`PaginaAgenda.tsx`, `DialogoConsulta.tsx`, `ProximaConsulta.tsx`, novo `ProximaConsultaAgenda.tsx`, `styles.css`, testes da Agenda/E2E afetados, BUSINESS §4 e TECHNICAL §14/17.

## Definition of Ready

Todos os RF/RNF mapeados, responsabilidades atuais preservadas, sem conflito de Rule ou mudança de fronteira. Plano dentro da refatoração autorizada pelo usuário; nenhuma decisão arquitetural adicional pendente.
