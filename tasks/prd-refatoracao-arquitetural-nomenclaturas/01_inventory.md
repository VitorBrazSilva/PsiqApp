# Inventário e matriz de nomenclatura — Task 01

## 1. Baseline e escopo

Este documento congela o estado observado em 21/09/2026 para orientar as tasks seguintes da feature `prd-refatoracao-arquitetural-nomenclaturas`. Ele não altera produção, contratos, persistência ou documentação viva.

Fontes normativas: `prd.md`, `techspec.md` (TS-001 e TS-011), `01_task.md` e Rules de arquitetura, privacidade, documentação e qualidade. As referências abaixo são caminhos relativos ao repositório.

### Convenções aprovadas

- Conceitos de negócio, clínicos e operacionais: português.
- Papéis arquiteturais convencionais: inglês (`Domain`, `Model`, `UseCase`, `Controller`, `Repository`, `Adapter`, `Port`, `Entity`, `DTO`, `Mapper`, `Configuration`, `Worker`, `Service`).
- Exceções técnicas: HTTP, JSON, UUID, JPA, JDBC, OpenAPI, Problem Details, `Idempotency-Key`, `X-Request-Id` e OpenAI.
- Nomes antigos são permitidos apenas nas migrations históricas V001–V003 e em testes explícitos de upgrade. Não há testes de upgrade no estado atual.

## 2. Matriz principal

| atual | final | tipo | papel | decisão | requisito | TS relacionado | consumidores | evidência esperada |
|---|---|---|---|---|---|---|---|---|
| `Paciente` / `patient` / `patients` | `Paciente` / `paciente` / `pacientes` | domínio, tabela, rota | Model, Entity, Controller | RENOMEAR | RF-001, RF-003, RF-004 | TS-001, TS-005, TS-006 | domínio, JPA, SQL, frontend `patients`, testes, OpenAPI | scan sem referência ativa antiga; testes HTTP e migration |
| `Consulta` / `appointment` / `appointments` | `Consulta` / `consulta` / `consultas` | domínio, tabela, rota | Model, Entity, Controller | RENOMEAR | RF-001, RF-003, RF-004 | TS-001, TS-005, TS-006 | domínio, JPA, API, frontend `appointments`, testes | contrato e integração atualizados |
| `RegistroClinico` / `clinical_record` / `clinical-records` | `RegistroClinico` / `registro_clinico` / `registros-clinicos` | domínio, tabela, rota | Model, Entity, Controller | RENOMEAR | RF-001, RF-003, RF-004 | TS-001, TS-005, TS-006 | domínio, persistence, API, frontend, testes | append-only e isolamento preservados |
| `AnaliseClinica` / `clinical_analysis` / `analysis` | `AnaliseClinica` / `analise_clinica` / `analises` | domínio, tabela, rota | Model, Entity, Controller | RENOMEAR | RF-001, RF-003, RF-004 | TS-001, TS-005, TS-006 | worker, persistence, API, frontend | leitura/escrita JSONB e API consistentes |
| `GeracaoAnalise` / `analysis_generation` / `analysis-generations` | `GeracaoAnalise` / `geracao_analise` / `geracoes-analise` | domínio, tabela, rota | Model, Entity, Controller, Worker | RENOMEAR | RF-001, RF-003, RF-004 | TS-001, TS-005, TS-006 | worker, polling frontend, testes | estados, retry e idempotência preservados |
| `EvidenciaAnalise` / `analysis_evidence` | `EvidenciaAnalise` / `evidencia_analise` | domínio, tabela | Model, Entity | RENOMEAR | RF-001, RF-004 | TS-001, TS-006 | JSONB, JDBC, SQL, testes | vínculo paciente–registro preservado |
| `TentativaGeracao` / `analysis_attempt` | `TentativaGeracao` / `tentativa_geracao` | domínio, tabela | Model, Entity | RENOMEAR | RF-001, RF-004 | TS-001, TS-006 | worker, JDBC, SQL | retry e unicidade preservados |
| `Idempotencia` / `idempotency_record` | `Idempotencia` / `idempotencia` | domínio, tabela | Model, Entity, Service | RENOMEAR | RF-001, RF-004 | TS-001, TS-006 | casos de uso, JPA, API, frontend | mesma chave e payload continuam idempotentes |
| `adaptador` / `Adaptador*` | `adapter` / `*Adapter` | pacote e classes | Adapter | RENOMEAR | RF-002 | TS-002, TS-008 | imports, testes de arquitetura | direção de dependências aprovada |
| `controlador` / `*Controlador` | `controller` / `*Controller` | pacote e classes | Controller | RENOMEAR | RF-002 | TS-002, TS-008 | rotas, Spring, testes | nenhum comportamento HTTP alterado |
| `Repositorio*` | `*Repository` | ports e adapters | Repository, Port | SEPARAR | RF-002, RF-005 | TS-002, TS-008 | aplicação, persistence, testes | port sem framework; adapter Spring/JDBC isolado |
| `*CasoDeUso` | `*UseCase` | aplicação | UseCase | RENOMEAR | RF-002 | TS-002, TS-008 | controllers, configuração, testes | uma responsabilidade principal por caso |
| `configuracao` / `*Configuracao` | `configuration` / `*Configuration` | configuração | Configuration | RENOMEAR | RF-002 | TS-002, TS-008 | Spring, worker, clock, testes | wiring preservado |
| `PacienteResposta`, `Criar*Requisicao` | `*Response`, `*Request` ou `*DTO` | contrato HTTP | DTO | RENOMEAR | RF-002, RF-003 | TS-001, TS-005 | controllers, frontend, OpenAPI, testes | payload e validação equivalentes |
| `Paciente`/`Consulta` em `features/patients`/`appointments` | features em português | frontend | componente/serviço | RENOMEAR | RF-001, RF-007 | TS-005, TS-011 | rotas, imports, testes Vitest/E2E | build e E2E sem referências antigas ativas |

### Componentes avaliados quanto a responsabilidade

| componente atual | decisão | justificativa |
|---|---|---|
| `CriarRegistroClinicoServico` | SEPARAR | mistura validação/orquestração e criação de parecer/complemento; manter persistência clínica independente da IA. |
| `ProcessarGeracaoAnaliseCasoDeUso` | SEPARAR | orquestra reserva, provider, retry, tentativa e persistência; separar responsabilidades nas fronteiras previstas em TS-008. |
| `AdaptadorAnaliseClinicaJdbc` | SEPARAR | concentra SQL, serialização JSONB, leitura de payload e persistência de evidências. |
| `AnaliseResposta` | SEPARAR | contrato HTTP e transformação de modelo de análise devem deixar explícita a fronteira DTO/Mapper. |
| `ValidadorRespostaAnalise` | MANTER | responsabilidade coesa de validar resposta externa, evidências e segurança; não fragmentar sem nova evidência. |
| `CatalogoSegurancaClinica` | MANTER | catálogo de regras de segurança, sem persistência ou chamada externa. |
| `ClienteApi` e serviços de feature | MANTER | cliente HTTP e serviços de domínio de tela já possuem motivos de mudança distintos; confirmar nomes na task frontend. |

## 3. Mapeamento JSONB de análise

Origem ativa: `AdaptadorAnaliseClinicaJdbc.jsonb()` e `lerAnalise()`. O payload persistido atualmente é:

| legado ativo | canônico final | significado | consumidor | decisão |
|---|---|---|---|---|
| `timeline` | `linhaDoTempo` | itens da leitura longitudinal | provider, JDBC, API, frontend | RENOMEAR |
| `patterns` | `padroes` | padrões observados | provider, JDBC, API, frontend | RENOMEAR |
| `attentionPoints` | `pontosAtencao` | pontos que exigem atenção | provider, JDBC, API, frontend | RENOMEAR |
| `limitations` | `limitacoes` | limitações persistentes da análise | provider, JDBC, API, frontend | RENOMEAR |
| `text` | `texto` | texto do item | provider, JDBC, API, frontend | RENOMEAR |
| `nature` | `natureza` | natureza do item | provider, validador, JDBC | RENOMEAR |
| `evidence` | `evidencias` | evidências do item | provider, JDBC, API, frontend | RENOMEAR |
| `recordAlias` | `apelidoRegistro` | alias do registro-fonte | snapshot, validador, API | RENOMEAR |
| `registroId` | `registroId` | identificador do registro-fonte | JDBC, API, frontend | MANTER |
| `field` | `campo` | campo clínico citado | validador, JDBC, API | RENOMEAR |
| `quote` | `citacao` | trecho citado | validador, JDBC, API | RENOMEAR |

Regra de serialização: nenhum campo deve ser descartado; leitura deve aceitar somente o formato canônico após a migração, salvo compatibilidade explicitamente prevista por teste de upgrade. A semântica de `registroId`, isolamento por paciente, evidência e limitações permanece invariável.

## 4. Enums persistidos e checks

| conceito | coluna/enum atual | valores atuais | valores canônicos | decisão |
|---|---|---|---|---|
| tipo de registro | `clinical_record.type` / `TipoRegistroClinico` | `ORIGINAL`, `COMPLEMENT` | `PARECER`, `COMPLEMENTO` | RENOMEAR |
| estado da geração | `analysis_generation.state` / `EstadoGeracaoAnalise` | `QUEUED`, `RUNNING`, `RETRY_WAIT`, `COMPLETED`, `FAILED` | `ENFILEIRADA`, `EXECUTANDO`, `AGUARDANDO_RETRY`, `CONCLUIDA`, `FALHA` | RENOMEAR |
| gatilho | `analysis_generation.trigger` / `GatilhoGeracaoAnalise` | `AUTO`, `MANUAL` | `AUTOMATICO`, `MANUAL` | RENOMEAR |
| modo | `analysis_generation.mode`, `clinical_analysis.mode` / `ModoAnalise` | `SUMMARY_ONLY`, `LONGITUDINAL` | `RESUMO`, `LONGITUDINAL` | RENOMEAR |
| seção | `analysis_evidence.section` / `SecaoAnalise` | `TIMELINE`, `PATTERNS`, `ATTENTION_POINTS` | `LINHA_DO_TEMPO`, `PADROES`, `PONTOS_ATENCAO` | RENOMEAR |
| campo | `analysis_evidence.field` / `CampoEvidencia` | `TEXT`, `MOOD`, `MEDICATIONS` | `TEXTO`, `HUMOR`, `MEDICAMENTOS` | RENOMEAR |
| natureza | `ItemAnaliseClinica.nature` / `NaturezaObservacao` | `REPORTED`, `INTERPRETATION` | `RELATADO`, `INTERPRETACAO` | RENOMEAR |
| status de consulta | `appointment.status` / `StatusConsulta` | `AGENDADA`, `REALIZADA`, `CANCELADA`, `FALTA` | mesmos valores | MANTER |

Os valores finais devem ser aplicados simultaneamente ao código, checks, queries, JSON/DTOs, fixtures e testes. V001–V003 continuam sendo registro histórico; uma eventual atualização de banco deverá preservar registros e índices e ser coberta por teste de upgrade.

## 5. Rotas, parâmetros, headers e contratos

| atual | final planejado | tipo | consumidores | evidência |
|---|---|---|---|---|
| `POST/GET /patients`, `GET /patients/{id}` | `POST/GET /pacientes`, `GET /pacientes/{pacienteId}` | rota | `PacienteControlador`, frontend, API tests | contrato HTTP e scan |
| `POST/GET /appointments`, `/appointments/{id}/status` | `/consultas`, `/consultas/{consultaId}/status` | rota | `ConsultaControlador`, frontend, API tests | contrato HTTP e scan |
| `/clinical-records` | `/registros-clinicos` | rota | `RegistroClinicoControlador`, frontend, API tests | contrato HTTP e scan |
| `/analysis-generations` | `/geracoes-analise` | rota | `AnaliseControlador`, polling frontend | contrato HTTP e scan |
| `/analysis-state` | `/estado-analise` | rota | `AnaliseControlador`, frontend | contrato HTTP e scan |
| `/analyses` | `/analises` | rota | `AnaliseControlador`, frontend | contrato HTTP e scan |
| `patientId` | `pacienteId` | query/path/JSON | backend, frontend, testes | contrato e referências coordenadas |
| `currentAnalysis`, `latestGeneration`, `activeGeneration`, `canRegenerate` | `analiseAtual`, `ultimaGeracao`, `geracaoAtiva`, `podeRegenerar` | JSON | DTO, frontend, testes | contrato e build |
| `page`, `size`, `items`, `total` | `pagina`, `tamanho`, `itens`, `total` | JSON/query | paginação backend/frontend | contrato e testes |
| `Idempotency-Key`, `X-Request-Id` | manter | header técnico | cliente HTTP, filtros, testes | allowlist de exceção técnica |

Parâmetros e colunas seguem o mapeamento normativo de TS-005/TS-006: `q`→`nome`, `page`→`pagina`, `size`→`tamanho`, `from`→`de`, `to`→`ate`, `patientId`→`pacienteId`; `name`→`nome`, `search_name`→`nome_busca`, `birth_date`→`data_nascimento`, `initial_complaint`→`queixa_inicial`, `clinical_revision`→`revisao_clinica`, `request_sequence`→`sequencia_requisicao`, `scheduled_at`→`agendada_para`, `created_at`→`criada_em`/`criado_em`, `status_changed_at`→`status_alterado_em`, `patient_id`→`paciente_id`, `original_id`→`parecer_original_id`, `appointment_id`→`consulta_id`, `clinical_datetime`→`data_hora_clinica`, `validated_payload`→`conteudo_validado`, `safety_rules_version`→`versao_regras_seguranca`, `generation_id`→`geracao_id`, `analysis_id`→`analise_id`, `record_id`→`registro_id`, `trigger_record_id`→`registro_disparador_id` e `failure_code`→`codigo_falha`.

## 6. Scan de resíduos e allowlist

### Escopo do scan

Pesquisar referências em `apps/`, `infra/`, `docs/`, `.github/`, `README.md` e artefatos da feature, excluindo `target/`, `node_modules/`, `dist/` e arquivos gerados. O scan deve considerar nomes de arquivos, pacotes, classes, imports, strings de rota, query params, headers próprios, chaves JSON, SQL, migrations, fixtures, OpenAPI, testes e documentação.

Comando baseline/repetível:

```powershell
rg -n --hidden --glob '!**/target/**' --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!01_inventory.md' "patient|patients|appointment|appointments|clinical_record|clinical-records|analysis_generation|analysis-generations|clinical_analysis|analysis_evidence|analysis_attempt|idempotency_record|currentAnalysis|latestGeneration|activeGeneration|canRegenerate|attentionPoints|limitations|recordAlias|field|quote|patterns|timeline|ORIGINAL|COMPLEMENT|QUEUED|RUNNING|RETRY_WAIT|COMPLETED|FAILED|AUTO|SUMMARY_ONLY|TIMELINE|PATTERNS|ATTENTION_POINTS|TEXT|MOOD|MEDICATIONS|REPORTED|INTERPRETATION" .
```

### Allowlist explícita

1. `apps/backend/src/main/resources/db/migration/V001__*.sql`, `V002__*.sql`, `V003__*.sql`: histórico imutável, até a criação de migrations de renomeação.
2. Testes de upgrade que sejam criados nas tasks de persistência: somente os nomes necessários para provar a conversão.
3. Tabelas deste documento e futuras tabelas de mapeamento da própria documentação: referências deliberadamente históricas, sempre rotuladas como legado.
4. Padrões técnicos `HTTP`, `JSON`, `UUID`, `JPA`, `JDBC`, `OpenAPI`, `Problem Details`, `Idempotency-Key`, `X-Request-Id`, `OpenAI` e identificadores de bibliotecas/frameworks.

Qualquer ocorrência fora da allowlist é funcional até prova em contrário. Falsos positivos esperados: termos de documentação que descrevem o legado, nomes de APIs de terceiros e nomes Java de bibliotecas. Eles devem ser classificados individualmente, não incluídos por regex ampla.

## 7. Matriz de rastreabilidade

| requisito | TS | task | teste/evidência desta task | evidência futura |
|---|---|---|---|---|
| RF-001, RF-002 | TS-001 | 01 | matriz principal e decisões de papel | scan sem resíduos + testes de compilação |
| RF-003, RF-007 | TS-005, TS-011 | 01 | matriz de rotas/contratos e allowlist | testes de contrato, frontend e scan |
| RF-004 | TS-006 | 01 | inventário de tabelas, colunas, checks e triggers | migration/upgrade e integração PostgreSQL |
| RF-005 | TS-002, TS-008 | 01 | tabela de responsabilidades | testes de fronteira e arquitetura |
| RF-008, RNF-005 | TS-012 | 01 | validações de cobertura e privacidade abaixo | reviews, checks e evidências por task |
| RNF-004 | TS-001, TS-005, TS-006, TS-011 | 01 | matriz canônica e scan definido | scan final sem resíduos ativos |

## 8. Validações e casos de erro

- **Nome ambíguo:** ocorrência sem classificação em conceito de negócio, papel arquitetural ou exceção técnica deve falhar a revisão da matriz; não há entradas ambíguas aceitas.
- **Exceção não justificada:** qualquer nome inglês fora da allowlist exige localização, motivo e decisão `JUSTIFICAR_MANUTENCAO`; caso contrário, falha.
- **Histórico classificado como ativo:** ocorrência em V001–V003 é histórica por definição; ocorrência igual em código ativo, testes comuns ou frontend é resíduo funcional.
- **JSONB sem mapeamento:** toda chave de seção, item, natureza, evidência, campo, citação e limitação está listada na seção 3; chave nova exige atualização da matriz antes da implementação.
- **Privacidade:** este inventário contém somente nomes técnicos e IDs de arquivos; não contém dados de pacientes, conteúdo clínico, secrets ou credenciais.

## 9. Evidência do levantamento

Levantamento executado com `rg --files` e `rg -n` sobre backend, frontend, infra, documentação, migrations e workflows. A conferência direta incluiu as migrations V001–V003, `AnaliseClinica`, enums do domínio, `AdaptadorAnaliseClinicaJdbc`, controllers e serviços frontend. O estado detalhado reproduzido acima é o baseline para as tasks 02–08.
