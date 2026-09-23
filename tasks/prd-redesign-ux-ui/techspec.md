# TechSpec — Redesign de UX/UI do PsiqApp — Foco clínico

## 1. Resumo executivo

Esta TechSpec transforma o PRD aprovado em um plano implementável para o redesign do frontend React/TypeScript existente. A arquitetura mantém o backend e a persistência atuais, preserva os contratos de `/api/v1` e aplica a direção visual A em Pacientes, Agenda e Prontuário.

O critério técnico central é paridade integral: nenhum campo, vínculo, estado, filtro, página, erro ou metadado retornado pelo backend pode ser descartado pelo redesign. Um dado pode aparecer diretamente na leitura principal, em detalhe contextual, em um drawer/modal de auditoria ou como vínculo operacional navegável, mas precisa continuar acessível e rastreável.

Escopo de alteração de contrato: somente adicionar ao item de geração histórica a referência necessária para localizar sua análise, preferencialmente `analiseId`/`analysisId` conforme o padrão efetivo adotado no backend. Não há mudança de banco, conteúdo de IA ou regra clínica.

Fonte: [PRD](prd.md), [spec-review aprovado](spec-review.md), código em `apps/frontend` e contratos/controllers em `apps/backend`. Esta execução cria somente documentação; não altera código.

## 2. Requisitos de origem

| Requisito | Cobertura técnica |
|---|---|
| RF-001 a RF-004 | TS-001, TS-002, TS-003, TS-014 |
| RF-005 a RF-008 | TS-004, TS-005, TS-006, TS-010, TS-014 |
| RF-009 a RF-013 | TS-007, TS-008, TS-009, TS-010, TS-011, TS-014 |
| RF-014 a RF-016 | TS-012, TS-013, TS-014 |
| RF-017 | TS-005, TS-006, TS-013, TS-015 |
| RF-018 | TS-001, TS-004, TS-007, TS-010 |
| RF-019 | TS-003 a TS-015, especialmente TS-014 |
| RNF-001 a RNF-008 | TS-001, TS-003, TS-005, TS-007, TS-013, TS-015 |

## 3. Estado técnico verificado

- Frontend: React + TypeScript + Vite, CSS próprio, `fetch` centralizado em `ClienteApi`, sem biblioteca nova de estado/cache.
- Organização atual: `app`, features de `pacientes`, `consultas`, `registros-clinicos`, `analises` e componentes compartilhados.
- Backend: Spring Boot, API REST JSON sob `/api/v1`, paginação `PaginaResponse`, Problem Details, idempotência e `X-Request-Id`.
- Backend já possui endpoints de consulta de análise histórica (`GET .../analises/{analiseId}`), mas a listagem de gerações não entrega hoje o vínculo suficiente para abrir cada item.
- Frontend atual carrega `tamanho=25`, `50` ou `100` e não oferece continuidade verdadeira. Esses valores são apenas primeira página, nunca limite de produto.
- O tipo frontend chama a sequência de `sequenciaRequisicao`; o contrato efetivo do backend é `sequenciaRequest`. O modelo normalizado adotará o nome efetivo e manterá compatibilidade somente no adaptador de transporte.

## 4. Arquitetura e fluxo de dados

O fluxo será:

`rota/contexto -> feature page -> hook de consulta/mutação -> serviço de domínio -> ClienteApi -> REST -> normalizador de contrato -> view model -> componentes da direção A`.

Cada feature continua dona de seus modelos e serviços. O `ClienteApi` continua sendo a única porta HTTP, preservando cancelamento, `cache: no-store`, `credentials: same-origin`, `Idempotency-Key`, Problem Details e `X-Request-Id`.

As respostas serão normalizadas sem eliminar propriedades. Tipos de domínio devem representar todos os campos do contrato. Quando uma resposta for desconhecida ou evoluir, o adaptador não deve fazer `pick` destrutivo; testes de contrato devem detectar campos obrigatórios ausentes e campos necessários ao redesenho.

Paginação será cursorada por página numerada existente: cada lista mantém `pagina`, `tamanho`, `total` e `itens`, exibe continuidade e permite ir à primeira, anterior, próxima e última página quando calculável. Busca, filtros e paciente contextual pertencem à chave da consulta; resposta de uma busca antiga nunca pode substituir a vigente.

## 5. Componentes e decisões técnicas

### TS-001 — Shell, rotas e contexto do paciente

**Responsabilidade:** aplicar navegação lateral desktop, navegação acessível em larguras menores, breadcrumb/contexto, retorno, página não encontrada, estado sem paciente e aviso persistente de dados fictícios.

**Requisitos relacionados:** RF-001, RF-018, RF-019, RNF-001, RNF-003, RNF-005.

O `pacienteId` permanece na rota do prontuário. A seção ativa deve estar na URL ou em estado navegável, para que back/forward restaure paciente e seção. Nenhum fallback silencioso pode abrir outro paciente.

### TS-002 — Pacientes e cadastro sob demanda

**Responsabilidade:** busca, lista paginada, estados loading/vazio/erro, seleção e formulário completo de cadastro.

**Requisitos relacionados:** RF-002 a RF-004, RF-008, RF-017, RF-019.

Campos `nome`, `cpf`, `dataNascimento`, `telefone`, `email` e `queixaInicial` permanecem no formulário, com validação local e erro de campo vindo do backend. A lista mostra ao menos nome, e-mail e CPF mascarado; dados restantes continuam disponíveis em Dados pessoais. O formulário deve sobreviver a troca de seção e erro de rede conforme o comportamento aprovado do PRD.

### TS-003 — Modelo de paciente, serviço e paginação

**Responsabilidade:** tipar `Paciente`, `CriarPaciente` e `Pagina<T>` integralmente e implementar `GET /pacientes`, `GET /pacientes/{id}` e `POST /pacientes`.

**Requisitos relacionados:** RF-002 a RF-004, RF-019.

O serviço aceitará `nome`, `pagina` e `tamanho`, não fixará a página em zero para navegação subsequente e manterá `total`. CPF só será exibido como retornado mascarado pelo backend.

### TS-004 — Prontuário, histórico clínico e fonte

**Responsabilidade:** compor Dados pessoais, Histórico clínico, Análise de IA e Consultas sem perder a leitura integral.

**Requisitos relacionados:** RF-004 a RF-010, RF-018, RF-019.

O histórico mostra tipo, texto completo, data clínica, data de criação, humor, medicamentos, revisão e vínculos `parecerOriginalId`/`consultaId`. Registros fora da página atual devem ser acessíveis por paginação; uma evidência deve poder buscar sua fonte por `GET .../registros-clinicos/{registroId}` e retornar à observação e à versão da análise.

### TS-005 — Novo parecer e complemento append-only

**Responsabilidade:** formulários intencionais para parecer e complemento, preservação de rascunho, associação opcional de parecer à consulta contextual, confirmação e tratamento de falhas.

**Requisitos relacionados:** RF-006 a RF-008, RF-017, RF-019.

Campos: `texto`, `humor`, `medicamentos`, `dataHoraClinica`, `consultaId`. Para complemento, o original é obrigatório pelo caminho e não há associação independente a consulta. Após salvar, o resultado contém `registro`, `geracaoId` e `geracao`; todos os três devem ser mantidos no estado da tela e usados para acompanhar a geração.

### TS-006 — Agenda e consultas

**Responsabilidade:** agenda global/contextual, filtros de período e paciente, criação e transição de status.

**Requisitos relacionados:** RF-014 a RF-017, RF-019.

Filtros `de`, `ate`, `pacienteId`, paginação e total são persistidos na consulta. Cada consulta mantém `id`, `pacienteId`, `agendadaPara`, `status`, `observacoes`, `criadaEm` e `statusAlteradoEm`; estados nulos são visualmente distinguíveis de ausência de carregamento. Só transições permitidas pelo backend são oferecidas.

### TS-007 — Estado e polling da análise

**Responsabilidade:** exibir separadamente `analiseAtual`, `ultimaGeracao`, `geracaoAtiva`, `podeRegenerar` e `motivo`, com polling cancelável e retomado após retorno à aba.

**Requisitos relacionados:** RF-009, RF-011, RF-012, RF-017 a RF-019.

O polling não sobrescreve uma análise com resposta obsoleta, não cria requests sobrepostos e não interrompe o uso do prontuário. Falha/indisponibilidade da IA é estado derivado e nunca transforma o salvamento clínico em falso fracasso.

### TS-008 — Painel atual e histórico de IA

**Responsabilidade:** mostrar modo, datas, estado, cobertura do snapshot, limitações e todas as três listas de análise, além de histórico paginado de gerações.

**Requisitos relacionados:** RF-009 a RF-013, RF-019.

Uma geração apresenta `id`, `pacienteId`, `estado`, `revisaoSnapshot`, `sequenciaRequest`, `solicitadaEm`, `totalRegistros`, `totalOriginais`, `totalComplementos`, `ultimoRegistroClinicoId`, `modo` e, após o ajuste mínimo, o vínculo de análise. `analiseAtual` nunca é usada para representar silenciosamente uma geração histórica.

### TS-009 — Análise histórica por vínculo explícito

**Responsabilidade:** abrir `GET /pacientes/{pacienteId}/analises/{analiseId}` a partir do histórico, preservar a versão selecionada e permitir retorno sem trocar o contexto.

**Requisitos relacionados:** RF-010, RF-013, RF-019.

O ajuste de contrato adicionará somente a referência de análise ao DTO de geração/listagem ou uma rota de resolução equivalente, sem alterar persistência ou conteúdo. A UI deve validar paciente e geração antes de mostrar a versão. Se o vínculo não existir, exibir estado de indisponibilidade explícito, nunca a análise atual.

### TS-010 — Observações, evidências e fonte completa

**Responsabilidade:** renderizar cada item das listas sem limite fixo, distinguindo `RELATO` de `INTERPRETACAO`, e navegar por cada evidência.

**Requisitos relacionados:** RF-009, RF-010, RF-013, RF-019, regras de segurança clínica.

Cada evidência preserva `apelidoRegistro`, `registroId`, `campo` e `citacao`. O destino mostra texto integral, `dataHoraClinica`, `criadoEm`, humor, medicamentos, tipo, revisão e vínculos do registro correto. A apresentação deixa explícito que a análise é apoio à leitura e não diagnóstico, prescrição ou conduta.

### TS-011 — Regeneração segura e idempotente

**Responsabilidade:** ação de regenerar somente quando `podeRegenerar`, proteger contra duplo envio e acompanhar a geração retornada.

**Requisitos relacionados:** RF-011, RF-012, RF-017, RF-019.

Usar `Idempotency-Key` único por intenção, desabilitar a ação durante request e aceitar `202`/`Location`/corpo de geração. Uma nova análise não substitui o histórico anterior.

### TS-012 — Cliente de contrato e compatibilidade de nomes

**Responsabilidade:** centralizar chamadas e normalizar divergências conhecidas sem perda de dados.

**Requisitos relacionados:** RF-017, RF-019, RNF-005.

O modelo canônico usa `sequenciaRequest`, exatamente como `GeracaoAnaliseResponse.java`. Se houver consumidores antigos, um alias temporário pode ser oferecido no adaptador, mas nenhum campo pode ser renomeado e descartado. O contrato deverá incluir testes para JSON real de todos os DTOs.

### TS-013 — Erros, estados assíncronos e resiliência

**Responsabilidade:** preservar Problem Details, erros de campo, `idRequisicao`, status HTTP e distinção entre erro, vazio, loading e sucesso.

**Requisitos relacionados:** RF-017, RF-019, RNF-005, RNF-006.

Mensagens serão locais e seguras; o frontend não exibe nem registra texto remoto bruto sensível. `AbortError` não aparece como falha. O componente de formulário associa `errosDeCampo.campo` ao campo correspondente e mantém tentativa segura quando aplicável.

### TS-014 — Matriz executável de paridade

**Responsabilidade:** impedir aceite enquanto qualquer item do inventário não tiver destino, consumidor, teste e evidência.

**Requisitos relacionados:** RF-019 e todos os RFs/RNFs aplicáveis.

Cada linha da matriz abaixo deve virar caso de teste/evidência nas Tasks. “Contextual” significa acessível via detalhe, drawer, fonte, auditoria ou vínculo navegável; não significa removido.

| ID | Campos/capacidade | Destino e consumidor | Teste/evidência obrigatória |
|---|---|---|---|
| D-01 | `nome`, `cpf`, `dataNascimento`, `telefone`, `email`, `queixaInicial` | Formulário de paciente; validação e recuperação | teste de payload, erros por campo e screenshot preenchido |
| D-02 | `id`, identidade, dados pessoais, `criadoEm`, CPF mascarado | Lista, cabeçalho do prontuário e Dados pessoais | contrato + paciente homônimo distinguível |
| D-03 | paciente, `agendadaPara`, `observacoes`, status | Agenda e formulário contextual | criar consulta e transições finais |
| D-04 | `id`, `pacienteId`, `agendadaPara`, `status`, `observacoes`, `criadaEm`, `statusAlteradoEm` | Lista, detalhe/auditoria e prontuário | nulos e estados finais preservados |
| D-05 | `texto`, `humor`, `medicamentos`, `dataHoraClinica`, `consultaId` | Parecer/complemento | parecer com consulta e complemento sem consulta |
| D-06 | todos os campos de `RegistroClinico` | Histórico e fonte completa | fonte fora da primeira página |
| D-07 | `registro`, `geracaoId`, `geracao` | Confirmação e acompanhamento pós-salvamento | resposta 201 integral e IA indisponível |
| D-08 | `analiseAtual`, `ultimaGeracao`, `geracaoAtiva`, `podeRegenerar`, `motivo` | Painel de estado | estados simultâneos não confundidos |
| D-09 | todos os campos de `GeracaoAnaliseResponse` + vínculo histórico | Histórico e detalhe de geração | paginação, campos e abertura da versão |
| D-10 | todos os campos de `AnaliseResponse` | Painel atual/histórico | listas completas, modo e limitações |
| D-11 | `texto`, `natureza`, `evidencias` sem limite fixo | Card de observação | múltiplas observações e naturezas |
| D-12 | `apelidoRegistro`, `registroId`, `campo`, `citacao` | Evidência e fonte | citação abre registro do mesmo paciente |
| D-13 | `itens`, `pagina`, `tamanho`, `total`, filtros | Paginação de pacientes, registros, consultas e gerações | segunda/última página e filtros combinados |
| D-14 | Problem Details e `idRequisicao` | Alertas, campos e suporte operacional | 400/404/409/500 e conteúdo sensível não exposto |
| D-15 | `Idempotency-Key`, `X-Request-Id`, status, `Location` | ClienteApi e feedback de operação | retry seguro, 201/202 e headers verificados |

### TS-015 — Observabilidade, privacidade e acessibilidade

**Responsabilidade:** manter logs mínimos, dados fictícios, isolamento por paciente, teclado, foco, semântica e larguras 375/768/1024/1440 px.

**Requisitos relacionados:** RNF-001 a RNF-008 e Rules aplicáveis.

Não logar texto clínico, CPF completo, payload integral de IA ou respostas sensíveis. Usar IDs, estado, código, request id e duração. O aviso de dados fictícios permanece visível. Todas as ações e fontes devem ser acessíveis por teclado, sem esconder conteúdo por largura.

## 6. Interfaces e contratos

### Modelos canônicos do frontend

Os tipos existentes são mantidos e completados, não substituídos por modelos “de apresentação” parciais:

- `Paciente`: `id`, `nome`, `cpf`, `dataNascimento`, `telefone`, `email`, `queixaInicial`, `criadoEm`.
- `Consulta`: `id`, `pacienteId`, `agendadaPara`, `status`, `observacoes`, `criadaEm`, `statusAlteradoEm`.
- `RegistroClinico`: `id`, `pacienteId`, `tipo`, `parecerOriginalId`, `consultaId`, `dataHoraClinica`, `criadoEm`, `texto`, `humor`, `medicamentos`, `revisao`.
- `GeracaoAnalise`: todos os campos de `GeracaoAnaliseResponse`, incluindo `sequenciaRequest` e o vínculo mínimo de abertura histórica.
- `AnaliseClinica`: `id`, `geracaoId`, `pacienteId`, `geradaEm`, `modo`, `linhaDoTempo`, `padroes`, `pontosDeAtencao`, `limitacoes`.
- `ItemAnalise`/`EvidenciaAnalise`: todos os campos de D-11/D-12.
- `Pagina<T>` e `ErroApi`: campos completos do contrato, sem colapsar `null` em ausência.

### Endpoints de produto

| ID | Método | Contrato consumido |
|---|---|---|
| E-01 | POST `/pacientes` | cadastro e paciente criado |
| E-02 | GET `/pacientes` | `nome`, `pagina`, `tamanho`, `Pagina<Paciente>` |
| E-03 | GET `/pacientes/{id}` | paciente completo |
| E-04 | POST `/pacientes/{pacienteId}/consultas` | consulta criada |
| E-05 | GET `/consultas` | `de`, `ate`, `pacienteId`, paginação, consultas |
| E-06 | POST `/consultas/{id}/status` | consulta atualizada |
| E-07 | POST `/pacientes/{pacienteId}/registros-clinicos` | registro + geração |
| E-08 | POST `/pacientes/{pacienteId}/registros-clinicos/{parecerOriginalId}/complementos` | complemento + geração |
| E-09 | GET `/pacientes/{pacienteId}/registros-clinicos` | histórico paginado |
| E-10 | GET `/pacientes/{pacienteId}/registros-clinicos/{registroId}` | fonte integral |
| E-11 | GET `/pacientes/{pacienteId}/estado-analise` | estado atual/ativo/último |
| E-12 | GET `/pacientes/{pacienteId}/geracoes-analise` | histórico paginado completo |
| E-13 | GET `/pacientes/{pacienteId}/analises/{analiseId}` | análise histórica integral |
| E-14 | POST `/pacientes/{pacienteId}/geracoes-analise` | regeneração idempotente |

E-15 `GET /health`, E-16 `GET /health/readiness` e E-17 `GET /openapi` permanecem disponíveis sob `/api/v1` e são validados em teste operacional; não precisam virar controles clínicos da interface.

## 7. Ajuste mínimo de contrato histórico

O backend deve adicionar ao `GeracaoAnaliseResponse` uma referência estável à análise concluída correspondente, sem mudar tabela, snapshot, conteúdo ou regras. A referência pode ser nula para estados não concluídos. O endpoint E-13 continua responsável por retornar a análise integral.

Regras:

1. geração, análise e paciente devem ser validados como pertencentes ao mesmo contexto;
2. geração falha/em execução não deve abrir análise inexistente;
3. a análise selecionada fica na URL/estado navegável;
4. retornar ao histórico preserva página e seleção;
5. contrato OpenAPI e testes de integração devem cobrir concluída, falha, nula e paciente incompatível.

## 8. Persistência e backend

Não haverá migration ou alteração de persistência. O backend continua fonte de verdade para ordenação, paginação, isolamento, status, snapshots e validação de evidências. A alteração é somente de DTO/projeção e controller/use case estritamente necessária para expor o vínculo histórico já existente ou resolvê-lo de modo determinístico.

## 9. Tratamento de erros e resiliência

- Abort de busca/polling é silencioso e não substitui a resposta vigente.
- Requests concorrentes são protegidos por `AbortController` ou token de versão.
- Mutations usam idempotência e não são repetidas automaticamente sem a mesma chave.
- Falha da IA mantém `registro` persistido, apresenta geração em falha/retentativa e não apaga análise anterior.
- 404 de paciente/registro/análise oferece retorno contextual.
- 409 e erro de campo permitem correção/reenvio seguro.
- `X-Request-Id`/`idRequisicao` fica disponível em detalhe operacional, não em conteúdo clínico.

## 10. Segurança clínica e privacidade

O redesign não pode apresentar análise como verdade clínica. Natureza relato/interpretação, limitações, evidências e fonte devem permanecer distinguíveis. A fonte é sempre um registro do mesmo paciente e snapshot. Não são permitidos diagnóstico fechado, prescrição, dose ou informação inventada.

Somente dados fictícios serão usados em fixtures, testes e screenshots. O frontend não adiciona autenticação neste escopo e não deve sugerir prontidão para dados reais. CPF é mascarado; logs usam minimização.

## 11. Estratégia de testes

### Unitários

- normalização de `sequenciaRequest` e compatibilidade legada;
- paginação, filtros, estados nulos e labels de status;
- descarte de resposta obsoleta e cancelamento;
- preservação de rascunho e idempotency key;
- renderização de todos os campos D-01 a D-15;
- isolamento de evidência e paciente no view model.

### Contrato/integrados

- um teste por E-01 a E-14 verificando método, URL, query/body, status e payload completo;
- E-15 a E-17 e OpenAPI/readiness;
- Problem Details, `X-Request-Id`, `Location`, 201/202 e repetição idempotente;
- geração histórica concluída com vínculo, vínculo nulo e análise ausente;
- paginação real em pelo menos duas páginas para pacientes, registros e gerações.

### E2E/visuais

- Pacientes: buscar, paginar, cadastrar, erro, abrir paciente homônimo;
- Agenda: filtrar por período/paciente, agendar, mudar status;
- Prontuário: parecer com consulta, complemento, histórico integral e fonte fora da primeira página;
- IA: estado ativo, retorno à aba, falha, regenerar, todas as listas, evidência e histórico correto;
- teclado/foco e screenshots nas larguras 375, 768, 1024 e 1440 px;
- cenários de volume: 100–500 pacientes, 20–100 registros/paciente e 200+ registros.

### Gate de paridade

O QA deve entregar `parity-matrix.md` com uma linha para cada D-01–D-15 e E-01–E-17, contendo campo/capacidade, consumidor, arquivo/componente, teste, evidência visual/funcional e status. Qualquer linha sem evidência bloqueia o aceite de RF-019.

## 12. Sequenciamento recomendado

1. Contrato histórico mínimo e testes backend/OpenAPI.
2. ClienteApi, modelos completos, adaptadores e testes de contrato.
3. Shell/rotas, Pacientes e paginação.
4. Prontuário, histórico, fonte, parecer e complemento.
5. Agenda e status.
6. Estado/polling, painel atual, regeneração, histórico e análise histórica.
7. Evidências de paridade, acessibilidade, responsividade, volume e visual.
8. QA, clinical-safety-reviewer, feature-reviewer e manutenção documental.

## 13. Decisões e trade-offs

- Manter serviços/React/CSS existentes reduz risco e preserva testes; uma biblioteca de UI ou estado global não oferece benefício comprovado para este escopo.
- Paginação explícita é preferida a carregar tudo: preserva desempenho e torna `total`/continuidade honestos.
- Detalhe contextual preserva legibilidade sem ocultar dados; campos nunca serão removidos apenas por baixa prioridade visual.
- O ajuste histórico é mínimo e orientado a vínculo; não será criado endpoint paralelo nem duplicado conteúdo de análise.
- Alias de nomenclatura só pode existir na borda de compatibilidade; o domínio do frontend segue o contrato efetivo.

## 14. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| protótipo omitir campos | TS-014 e gate por campo |
| primeira página parecer conjunto completo | paginação, total e testes de segunda página |
| geração histórica abrir análise atual | vínculo explícito, URL de versão e teste de isolamento |
| divergência de nomes descartar sequência | TS-012 e contrato com payload real |
| polling misturar pacientes | abort/token de paciente e testes de troca rápida |
| erro da IA apagar registro | teste de persistência independente e UI de estado derivado |
| fonte de outro paciente | validação backend + teste E2E de isolamento |
| aparência sugerir uso real | aviso persistente e somente dados fictícios |

## 15. Conformidade com Rules

Atende às Rules de invariantes de produto, segurança clínica, privacidade, limites arquiteturais, qualidade e manutenção documental. Não introduz broker, RAG, embeddings, autenticação, persistência nova ou provider novo. A IA continua derivada dos registros clínicos e o frontend não altera o conteúdo clínico.

## 16. Arquivos/módulos impactados

Prováveis módulos de implementação, a confirmar nas Tasks:

- `apps/frontend/src/app/*`, `styles.css` e componentes compartilhados;
- `features/pacientes/*`, `features/consultas/*`, `features/registros-clinicos/*`, `features/analises/*`;
- `apps/frontend/src/shared/api/*` e idempotência;
- DTO/controller/use case de geração histórica em `apps/backend/src/main/java/com/psiqapp/adapter/in/web` e testes de contrato;
- `tasks/prd-redesign-ux-ui/parity-matrix.md`, a criar durante Tasks/QA.

## 17. Definition of Ready

- [x] PRD e spec-review aprovados e lidos.
- [x] Stack e contratos reais explorados.
- [x] RF/RNF cobertos por IDs TS.
- [x] D-01–D-15 e E-01–E-17 mapeados com destino e evidência exigida.
- [x] Paginação, histórico, erros, idempotência e campos opcionais explicitados.
- [x] Riscos clínicos, privacidade e isolamento tratados.
- [x] Nenhuma implementação executada nesta etapa.

