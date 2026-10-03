# TechSpec — Painel de consultas do prontuário

## 1. Resumo executivo

Compor a seção com o contexto da próxima consulta em largura completa, painel branco da lista e resumo lateral. Reusar React/TypeScript/CSS, serviços, filtros, paginação e diálogo existentes. Uma task cobre implementação e validação.

## 2. Requisitos de origem

| Requisito | Cobertura técnica |
|---|---|
| RF-001 | TS-001, TS-002 |
| RF-002 | TS-003, TS-004 |
| RF-003 | TS-001, TS-003 |
| RNF-001 | TS-002, TS-003, TS-004 |
| RNF-002 | TS-001, TS-003 |

## 3. Arquitetura e fluxo de dados

`PaginaProntuario` permanece responsável pela composição do prontuário e por abrir o diálogo. `features/consultas` mantém leitura e apresentação dos dados da agenda. `shared` e backend não são alterados.

API existente → `servicoConsultas.listarAgenda` → hook de resumo por paciente → contexto superior/resumo lateral. O painel paginado continua usando `useAgendaConsultas`, com filtros independentes do resumo.

Inspeção confirmou responsabilidades registradas nas seções 3, 5 e 14 de TECHNICAL.md. O backend já ordena Próximas crescentemente e grupos encerrados decrescentemente. Não há desvio arquitetural novo ou conflito com Rules.

## 4. Componentes

### TS-001 — Leitura do resumo

**Responsabilidade:** consultar as primeiras consultas de PROXIMAS e REALIZADAS, com `pagina=0`, `tamanho=1` e paciente obrigatório, sem período. Somar contagens completas de PROXIMAS para obter o total. Conservar identificação do paciente na leitura, abortar no cleanup, rejeitar itens de outro paciente e ignorar respostas abortadas. Tratar falha como indisponibilidade, sem contagem fictícia.

Renovar na criação/atualização via versão externa, retorno à janela/aba e passagem do instante da próxima consulta. Remover listeners/timers ao desmontar.

**Requisitos relacionados:** RF-001, RF-003, RNF-002.

### TS-002 — Próxima consulta compartilhada

**Responsabilidade:** extrair a apresentação já existente do histórico para componente de consultas, usando os mesmos estilos e fuso explícito. Histórico oferece ação para abrir Consultas; a própria seção dispensa essa ação. Datas de consulta usam formatador local da feature.

**Requisitos relacionados:** RF-001, RNF-001.

### TS-003 — Composição do prontuário

**Responsabilidade:** substituir a lista dentro do contexto por painel próprio, com título, indicação de Brasília e botão para o diálogo existente. Acrescentar `aside` semântico de resumo, com total, próxima e última realizada; estados vazios/carregando/erro explícitos. A atualização da lista notifica a composição para renovar o resumo. Os dados pessoais aparecem somente na seção Dados pessoais.

**Requisitos relacionados:** RF-002, RF-003, RNF-001, RNF-002.

### TS-004 — Estilos delimitados

**Responsabilidade:** aplicar painel branco e bordas na lista apenas no prontuário, sem alterar a Agenda global. Usar a grade existente e empilhar abaixo de 740 px. Ajustar controles de status para alvos de ao menos 44 px no painel.

**Requisitos relacionados:** RF-002, RNF-001.

Plano visual derivado da referência e do sistema existente:

- Cor: superfície branca `#ffffff`, página `#f7f9f7`, resumo verde suave `#f1f6f0`, borda `#dde5df`, texto `#24382f`, ação `#285c47`. Texto secundário conserva `#62716a`.
- Tipo: Segoe UI e fallbacks existentes; título de painel 20 px, título de resumo 16 px, dados 14 px e metadados 13 px.
- Layout: títulos/dados à esquerda, ação do painel à direita, resumo alinhado ao topo da lista, 22–28 px entre regiões. Em mobile, contexto → lista → resumo.
- Princípio: hierarquia da agenda do paciente, sem gráficos ou números clínicos inventados. Não introduzir fonte, animação ou estilo global novos.

```text
[ Próxima consulta                                      ]
[ Consultas do paciente / Agendar ][ Resumo das consultas ]
[ Filtros, período, lista        ][ Total                ]
[ Paginação                     ][ Próxima / Última     ]
```

Revisão do plano contra o brief: preserva a direção visual escolhida e seus componentes existentes. Os controles atuais ficam no painel para conservar capacidade funcional; não copiar elementos decorativos do protótipo sem ação real.

## 5. Interfaces e contratos

Reusar `Consulta`, `PaginaAgendaConsultas` e `GrupoAgendaConsulta`. O hook retorna resumo ou ausência durante carregamento, mais erro identificado. `PainelConsultas` recebe callback opcional de atualização e opção de apresentação do prontuário, preservando seus consumidores atuais. Nessa apresentação, a lista mostra data/hora compactas e o paciente já está identificado no cabeçalho; a Agenda conserva seus metadados completos.

## 6. Modelo de dados e persistência

Sem mudança.

## 7. APIs / entradas e saídas

Reusar `GET /agenda/consultas` com os filtros descritos em TS-001. Nenhum endpoint novo.

## 8. Integrações externas

Preservar exibição de sincronização Google e fluxo de agendamento. Não acessar Google ou IA reais durante validação.

## 9. Tratamento de erros e resiliência

Falha do resumo não remove histórico clínico ou lista. Erro do resumo é exibido no contexto/histórico ou no painel lateral, sem interpretar ausência de leitura como ausência de consultas. Respostas do paciente anterior são descartadas.

## 10. Segurança, privacidade e compliance

Somente fixtures fictícias. Todas as leituras do resumo usam paciente da rota. Nenhum novo log, transmissão, credencial ou conteúdo derivado por IA.

## 11. Observabilidade

Sem alteração. Evidências locais de testes/screenshots ficam na pasta da feature.

## 12. Estratégia de testes

### Unitários e integração de componentes

Testar total independente da página, seleção das datas por grupo, isolamento de resposta tardia, erro sem total zero e renovação ao cruzar o início. Teste do prontuário verifica atualização de status/reflexo no resumo e invariância diante de filtros. Rodar suíte Vitest existente.

### E2E / fluxos de sistema

Playwright existente, com API fake local, para verificar layout em 360/768/1024/1440 px, painel branco, empilhamento e agendamento pelo painel. Gerar imagens e inspecioná-las. Executar regressão pertinente de análise e agendamento.

### Contrato, segurança e arquitetura

Typecheck, ESLint e build. Revisão manual dos imports e isolamento da feature; o frontend não possui teste arquitetural automatizado próprio. Backend/ArchUnit/migrations não se aplicam a esta mudança, pois seus módulos permanecem intactos.

## 13. Sequenciamento recomendado

Uma task autorizada: implementar os quatro TS, verificar, executar reviews distintos, avaliar documentação e QA/feature review finais.

## 14. Decisões e trade-offs

Duas leituras pequenas do contrato existente obtêm dados completos sem carregar todas as consultas nem deduzir o total da página. O resumo não adota período/grupo selecionados: apresenta o acompanhamento integral do paciente conforme a referência.

## 15. Riscos técnicos e mitigação

CSS antigo tem regras sobrepostas: alterar seletores locais da seção e conferir breakpoints. Async pode retornar após troca de rota: abortar e filtrar contexto. Atualização de status pode deixar resumo defasado: callback de renovação e teste de integração.

## 16. Conformidade com rules e skills

| Restrição/Rule | Fonte | Módulo e responsabilidade existentes | Decisão da feature | Verificação |
|---|---|---|---|---|
| Separação features/shared | architecture-boundaries | Consultas lê/apresenta agenda; prontuário compõe features | Componentes/hook em consultas; composição em registros-clinicos | Review de imports/diff; typecheck |
| Isolamento por paciente | clinical-data-privacy | Serviços recebem paciente/contexto | Filtro obrigatório, abort e guarda de paciente | Teste de resposta tardia e troca de rota |
| Dados fictícios | clinical-data-privacy | Fixtures locais | Apenas massa sintética | Review dos testes/evidências |
| Fonte clínica/append-only | product-invariants, clinical-ai-safety | Registros e análise separados de consultas | Sem alteração clínica/IA | Diff restrito ao frontend da agenda |
| Qualidade/rastreabilidade | testing-quality | Vitest, ESLint, Playwright | ACs ligados a testes/evidências | Checks e reviews |
| Documentação vigente | documentation-maintenance | BUSINESS/TECHNICAL descrevem comportamento | Atualizar descrição do painel/resumo quando implementado | Documentation review |

Skills: frontend-design para plano/critique visual; ui-ux-pro-max para responsividade/composição tipada. Consultas locais confirmaram guidance de overflow Web e composição/props React; não é criado design system global.

## 17. Arquivos/módulos impactados

- `features/consultas`: hook de resumo, componentes de próxima/resumo e callback do painel.
- `features/registros-clinicos/PaginaProntuario.tsx` e seu teste.
- `src/styles.css`, com alterações locais de Consultas.
- Testes Vitest/Playwright pertinentes e documentos canônicos aplicáveis.

## Definition of Ready da TechSpec

- [x] RF/RNF cobertos por TS estáveis.
- [x] Stack, contratos, responsabilidades e modos de falha derivados do projeto.
- [x] Nenhuma mudança de Rule, fronteira ou convenção global.
- [x] Testes/evidências previstos, sem antecipar resultados.

## Complemento autorizado — TS-005 / RF-004

Reabrir a task 1.0 na mesma branch para os refinamentos solicitados. `DialogoConsulta` e `FormularioConsulta` recebem e-mail opcional do paciente guardado pela identidade da rota, sem nova leitura ou contrato. Nome/e-mail e instrução compõem um cabeçalho compacto. SVGs decorativos locais a `features/consultas` representam calendário, relógio, paciente, informação, períodos e setas; as etapas recebem conectores em CSS. Radios permanecem nativos, com foco visível e aparência de opções da referência. A revisão usa três informações existentes (data, hora e paciente), sem inventar tipo ou idade.

A apresentação da busca filtra instantes anteriores às 06:00 em `America/Sao_Paulo`, tanto nas datas oferecidas quanto nas opções/revisão. O hook mensal continua responsável pelo contrato, envelhecimento e cancelamento de leituras; API, manual e repetição idempotente permanecem intactos. Aplicar o desenho ao formulário compartilhado nas duas origens. Hover dos grupos reutiliza as cores das ações de status por seletores locais, sem mudar o estilo global dos botões.

Compatibilidade: consultas mantém composição e formatação de agenda; prontuário somente fornece o cadastro atual; shared/backend não recebem regra de apresentação. Rules de isolamento, dados fictícios, integrações simuladas e documentação continuam aplicáveis, sem nova fronteira ou convenção global. Verificar nome/e-mail após troca de paciente, ocultação de madrugada/dias exclusivos/estado vazio, fluxo manual e repetição, teclado, retorno de foco, hover, layouts 360/768/1024/1440 px, typecheck, lint, Vitest e build. Evidências e reviews do complemento devem ser registrados antes de retornar a READY.
