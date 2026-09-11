# PsiqApp MVP - Documentação Técnica

## 1. Estado técnico atual

O repositório está na fase inicial de implementação do MVP. Existem PRD, spec-review aprovado, TechSpec aprovada, Rules do projeto, infraestrutura local de PostgreSQL via Docker Compose, bootstrap de backend e frontend, placeholders de configuração e CI por área.

O backend possui apenas a fundação da aplicação. O frontend possui SPA navegável, placeholders de pacientes/agenda/prontuário, aviso persistente e cliente HTTP testado. Não há endpoints de produto, migrations de negócio, fluxos clínicos ou worker de IA implementados nesta etapa.

Esta documentação descreve a arquitetura técnica aprovada para implementação do MVP e registra explicitamente os limites do estado atual. Quando as tasks forem implementadas, este documento deve ser atualizado para refletir o código real, removendo ou ajustando qualquer detalhe que deixe de ser verdadeiro.

Fontes técnicas principais:

- `tasks/prd-psiqapp-mvp/techspec.md`;
- `tasks/prd-psiqapp-mvp/prd.md`;
- `.agents/rules/architecture-boundaries.md`;
- `.agents/rules/product-invariants.md`;
- `.agents/rules/clinical-data-privacy.md`;
- `.agents/rules/clinical-ai-safety.md`;
- `.agents/rules/testing-quality.md`.

## 2. Stack aprovada

| Área | Decisão |
|---|---|
| Backend | Java 21 LTS, Spring Boot 3.5.16 e Maven Wrapper 3.9.16. |
| Arquitetura backend | Hexagonal pragmática: Domain, Application e Adapters. |
| Frontend | React 19.2.8, TypeScript 6.0.3, Vite 8.3.0 e CSS simples; Node.js 24.18.0 LTS e npm 11.16.0. |
| Roteamento frontend | React Router 8.3.1 declarativo. |
| Comunicação frontend | `fetch` nativo por cliente HTTP centralizado. |
| Banco | PostgreSQL 18.6 local. |
| Migrations | Flyway 11.20.3; nesta etapa apenas o histórico do Flyway é criado em banco vazio. |
| Persistência backend | Spring Data JPA/Hibernate no adapter de persistência. |
| IA | OpenAI atrás de port, SDK oficial Java, Responses API e Structured Outputs. |
| Modelo inicial | `OPENAI_MODEL=gpt-5.6-terra`, configurado por ambiente. |
| Execução local | PostgreSQL via Docker Compose; backend e frontend executados diretamente na máquina. |
| Testes backend | JUnit 5, Spring Boot Test, Mockito, ArchUnit e Testcontainers PostgreSQL. |
| Testes frontend | Vitest 5.0.0, Testing Library React 16.3.3 e jsdom 30.0.1; ESLint 10.10.0. |
| E2E | Playwright. |
| Observabilidade | SLF4J/Logback e Actuator local apenas para health/readiness. |

Infraestrutura local já definida: `infra/compose.yaml` usa `postgres:18.6`, volume Docker nomeado `psiqapp-postgres-data`, healthcheck com `pg_isready` e publicação apenas em `127.0.0.1:5432`.

O frontend fixa dependências diretas no `package.json` e a árvore completa no `package-lock.json`; `.nvmrc` fixa o Node. TypeScript 6.0.3 está na faixa suportada pelo typescript-eslint 8.70.0 (`<6.1.0`); TypeScript 7 não integra esta combinação. O backend usa Maven Wrapper 3.9.16, Flyway 11.20.3 e o driver JDBC gerenciado pelo BOM do Spring Boot. A versão do SDK OpenAI permanece para a task de integração de IA.

## 3. Estrutura do monorepo

Estrutura aprovada para implementação:

```text
apps/
  backend/
  frontend/
infra/
  compose.yaml
tasks/
  prd-psiqapp-mvp/
.agents/
  rules/
```

`apps/backend` contém o bootstrap Spring Boot; `apps/frontend` contém o bootstrap React/Vite.

Backend previsto:

```text
apps/backend/src/main/java/com/psiqapp/
├── domain/
│   ├── model/
│   ├── service/
│   └── exception/
├── application/
│   ├── port/
│   │   ├── in/
│   │   └── out/
│   └── usecase/
├── adapter/
│   ├── in/
│   │   └── web/
│   └── out/
│       ├── persistence/
│       └── ai/
└── config/
```

Frontend implementado (`analyses` está apenas reservado, sem funcionalidade):

```text
apps/frontend/src/
├── app/
├── features/
│   ├── patients/
│   ├── appointments/
│   ├── clinical-records/
│   └── analyses/
└── shared/
```

Responsabilidades:

- `domain`: regras e modelos de negócio sem dependência de Spring, JPA, PostgreSQL ou OpenAI.
- `application`: casos de uso e ports.
- `adapter/in/web`: controllers, DTOs, validação estrutural HTTP e Problem Details.
- `adapter/out/persistence`: entidades JPA, repositórios Spring Data, mapeadores e implementação de ports de persistência.
- `adapter/out/ai`: integração com OpenAI por trás do `ClinicalAnalysisProviderPort`.
- `config`: composição das dependências.

A direção de dependência é `adaptador -> aplicacao -> dominio` (os pacotes de código usam os nomes portugueses da Task 02). Domain e Application não conhecem JPA, SDK da OpenAI, controllers ou DTOs HTTP.

O bootstrap inclui `FiltroRequestId` e `TratadorDeErrosHttp` na fronteira web. Erros usam Problem Details seguro com `code`, `fieldErrors` quando aplicável e `requestId`. O `Clock` de produção é `java.time.Clock.systemUTC()` e pode ser substituído por um relógio fixo nos testes.

## 4. Fluxo de dados geral

Fluxo aprovado:

```text
React SPA em 127.0.0.1:5173
  -> proxy Vite /api
  -> Spring Boot em 127.0.0.1:8080
  -> controllers/DTOs
  -> casos de uso
  -> ports de saída
  -> adapters de persistência ou IA
  -> PostgreSQL em 127.0.0.1:5432 ou OpenAI externo
```

O worker de IA roda no próprio backend. Não há broker externo, microservice separado, cloud, Kubernetes, RabbitMQ, Kafka, SQS, Pub/Sub, RAG, embeddings ou banco vetorial no MVP.

## 5. Fronteiras arquiteturais

### Persistência clínica independente da IA

Salvar um parecer ou complemento é uma operação independente da IA. A criação clínica deve concluir com sucesso mesmo se o provedor de IA estiver lento, indisponível ou retornando erro.

Regra central:

- transação clínica salva registro, solicitação de geração e idempotência;
- depois do commit, o registro fica disponível;
- a chamada externa de IA ocorre fora da transação clínica;
- falha da IA nunca desfaz dado clínico salvo.

### Adapter de IA isolado

O domínio e os casos de uso dependem de um port, não do SDK do provider. A implementação OpenAI fica restrita ao adapter `OpenAiClinicalAnalysisAdapter`.

Isso permite trocar modelo ou provider no futuro sem alterar regras de domínio, desde que o novo provider respeite o contrato de análise, evidências, segurança clínica e minimização de dados.

### Transações

A aplicação usará um único `TransactionRunnerPort` em `application/port/out`, implementado no adapter de persistência com `TransactionTemplate`.

Uso previsto:

- blocos atômicos de cadastro e criação de geração;
- reivindicação de geração pelo worker;
- finalização atômica de análise, evidências e estado `COMPLETED`;
- nunca envolvendo chamada externa de IA.

## 6. Modelo de dados técnico

Todas as tabelas usam `id uuid primary key` gerado pela aplicação quando aplicável. Tabelas históricas usam `created_at timestamptz not null`. FKs devem usar `ON DELETE RESTRICT` ou equivalente sem cascatas destrutivas.

### Visão geral das tabelas

| Tabela | Papel |
|---|---|
| `patient` | Cadastro do paciente e contadores transacionais por paciente. |
| `appointment` | Agenda interna e status de consultas. |
| `clinical_record` | Pareceres originais e complementos, fonte clínica de verdade. |
| `analysis_generation` | Fila persistente e estado operacional de cada geração de IA. |
| `analysis_attempt` | Auditoria de cada tentativa técnica de uma geração. |
| `clinical_analysis` | Análise validada e preservada historicamente. |
| `analysis_evidence` | Evidências literais que ligam itens da análise aos registros clínicos. |
| `idempotency_record` | Controle de repetição segura de criações e regeneração manual. |
| `worker_heartbeat` | Sinalização operacional do worker, sem conteúdo clínico. |

### `patient`

Representa o paciente cadastrado e guarda contadores usados para serialização por paciente.

Campos relevantes:

| Campo | Significado |
|---|---|
| `id` | Identificador técnico do paciente. |
| `name` | Nome preservado para exibição. |
| `search_name` | Nome normalizado para busca sem acentos e sem diferença de caixa. |
| `cpf` | CPF normalizado e único. |
| `birth_date` | Data de nascimento como `date`, sem fuso. |
| `phone` | Telefone validado e normalizado. |
| `email` | E-mail validado estruturalmente. |
| `initial_complaint` | Queixa inicial opcional. |
| `clinical_revision` | Revisão monotônica por paciente para congelar snapshots clínicos. |
| `request_sequence` | Sequência monotônica por paciente para ordenar solicitações de análise. |
| `created_at` | Momento de criação do cadastro. |

Invariantes:

- `cpf` é único.
- `clinical_revision` e `request_sequence` são atualizados sob `SELECT FOR UPDATE` na linha do paciente.
- A busca usa `search_name`, mas a exibição usa `name`.

### `appointment`

Representa uma consulta da agenda interna.

Campos relevantes:

| Campo | Significado |
|---|---|
| `id` | Identificador técnico da consulta. |
| `patient_id` | Paciente dono da consulta. |
| `scheduled_at` | Data/hora da consulta em `timestamptz`. |
| `status` | `AGENDADA`, `REALIZADA`, `CANCELADA` ou `FALTA`. |
| `notes` | Observações opcionais de consulta. |
| `created_at` | Momento de criação. |
| `status_changed_at` | Momento da mudança de status, quando houver. |

Invariantes:

- toda consulta pertence a um paciente;
- status inicial é `AGENDADA`;
- `REALIZADA`, `CANCELADA` e `FALTA` são finais no MVP;
- observações de consulta não entram no snapshot da IA.

### `clinical_record`

Representa a fonte clínica de verdade: parecer original ou complemento.

Campos relevantes:

| Campo | Significado |
|---|---|
| `id` | Identificador técnico do registro clínico. |
| `patient_id` | Paciente dono do registro. |
| `type` | `ORIGINAL` para parecer ou `COMPLEMENT` para complemento. |
| `original_id` | Parecer original referenciado por um complemento. |
| `appointment_id` | Consulta associada, quando houver. |
| `clinical_datetime` | Data/hora clínica usada na linha do tempo e na IA. |
| `created_at` | Data/hora real de criação no sistema. |
| `text` | Texto clínico obrigatório. |
| `mood` | Estado/humor opcional. |
| `medications` | Medicações em uso como texto livre opcional. |
| `revision` | Revisão clínica monotônica do paciente. |

Invariantes:

- `type` aceita apenas `ORIGINAL` ou `COMPLEMENT`;
- `ORIGINAL` não possui `original_id`;
- `COMPLEMENT` exige `original_id`;
- `original_id` deve apontar para um `ORIGINAL` do mesmo paciente;
- complemento de complemento é inválido;
- `UNIQUE(patient_id, revision)` garante revisão única por paciente;
- `clinical_record` é append-only: UPDATE/DELETE devem ser rejeitados por backend e trigger PostgreSQL;
- `appointment_id`, quando usado, deve respeitar o mesmo paciente.

### `analysis_generation`

Representa uma solicitação de análise e funciona como fila persistente do worker.

Campos relevantes:

| Campo | Significado |
|---|---|
| `id` | Identificador da geração. |
| `patient_id` | Paciente analisado. |
| `trigger` | `AUTO` para novo registro clínico ou `MANUAL` para regeneração solicitada. |
| `trigger_record_id` | Registro que disparou geração automática, quando aplicável. |
| `snapshot_revision` | Corte congelado da revisão clínica do paciente. |
| `request_sequence` | Sequência da solicitação no paciente. |
| `requested_at` | Momento da solicitação. |
| `state` | Estado operacional da geração. |
| contagens do snapshot | Total de registros, originais e complementos calculados pelo backend. |
| `last_clinical_record_id` | Último registro clínico considerado segundo a ordem clínica. |
| `attempt_count` | Quantidade de tentativas técnicas já adquiridas. |
| `next_attempt_at` | Quando a geração em retry volta a ser elegível. |
| `lease_token` | Token de reserva do worker. |
| `lease_expires_at` | Validade da reserva. |
| `completed_at` | Momento de conclusão terminal. |
| `failure_code` | Código de falha quando terminar como `FAILED`. |
| versões/modelo/mode | Auditoria de modelo, prompt, schema, regras e modo. |

Estados:

| Estado | Uso técnico |
|---|---|
| `QUEUED` | Aguardando processamento. |
| `RUNNING` | Tentativa reservada por worker. |
| `RETRY_WAIT` | Aguardando novo horário elegível após falha transitória. |
| `COMPLETED` | Análise validada e persistida. |
| `FAILED` | Geração encerrada sem análise válida. |

Invariantes:

- `COMPLETED` e `FAILED` são terminais;
- `QUEUED`, `RUNNING` e `RETRY_WAIT` bloqueiam regeneração manual para o paciente;
- `UNIQUE(patient_id, request_sequence)`;
- geração automática deve ser única por registro disparador;
- estado operacional pode mudar durante processamento;
- snapshot, contagens e metadados históricos não podem ser reescritos fora das transições previstas.

### `analysis_attempt`

Registra auditoria técnica de cada tentativa de uma geração.

Campos relevantes:

| Campo | Significado |
|---|---|
| `id` | Identificador da tentativa. |
| `generation_id` | Geração relacionada. |
| `attempt_number` | Número da tentativa dentro da geração. |
| `started_at` | Início da tentativa. |
| `finished_at` | Fim da tentativa, quando houver. |
| `outcome` | Resultado técnico. |
| `error_code` | Código de erro quando aplicável. |
| `duration_ms` | Duração observada. |
| tokens/request id | Metadados do provider quando disponíveis. |

Invariantes:

- tentativa é única por geração e número;
- não inventar tokens, request id ou duração quando indisponíveis;
- não persistir corpo clínico rejeitado, prontuário completo ou secrets.

### `clinical_analysis`

Armazena uma análise validada.

Campos relevantes:

| Campo | Significado |
|---|---|
| `id` | Identificador da análise. |
| `generation_id` | Geração que produziu a análise; relação única. |
| `patient_id` | Paciente da análise. |
| `generated_at` | Momento em que foi gerada/persistida. |
| `mode` | `SUMMARY_ONLY` ou `LONGITUDINAL`. |
| `validated_payload` | JSON validado com timeline, padrões, pontos de atenção e limitações. |
| `safety_rules_version` | Versão das regras determinísticas de segurança usadas. |

Invariantes:

- análise é append-only;
- nova análise nunca sobrescreve análise anterior;
- `generation_id` é único;
- análise deve pertencer ao mesmo paciente da geração;
- payload só é persistido depois de validação estrutural, evidencial, de isolamento e segurança.

### `analysis_evidence`

Normaliza as evidências da análise para rastreabilidade.

Campos relevantes:

| Campo | Significado |
|---|---|
| `id` | Identificador da evidência. |
| `analysis_id` | Análise relacionada. |
| `patient_id` | Paciente da evidência. |
| `section` | Seção da análise: timeline, patterns ou attentionPoints. |
| `item_index` | Índice do item dentro da seção. |
| `record_id` | Registro clínico usado como fonte. |
| `field` | Campo citado: `text`, `mood` ou `medications`. |
| `quote` | Trecho literal validado. |
| `created_at` | Momento de persistência da evidência. |

Invariantes:

- evidência deve pertencer ao mesmo paciente da análise;
- `record_id` deve pertencer ao mesmo paciente;
- registro citado deve estar dentro do snapshot da geração;
- `field` só pode ser campo permitido;
- `quote` deve existir literalmente no campo citado, permitindo apenas normalização de whitespace/quebras de linha para comparação;
- evidências são append-only.

### `idempotency_record`

Evita duplicação quando uma criação é reenviada após timeout, perda de resposta HTTP ou retry do cliente.

Campos relevantes:

| Campo | Significado |
|---|---|
| `id` | Identificador técnico do registro de idempotência. |
| `scope_operation` | Operação protegida. |
| `patient_id` | Escopo do paciente quando aplicável. |
| `key` | UUID recebido no header `Idempotency-Key`. |
| `payload_hash` | Hash SHA-256 do payload validado canônico. |
| `resource_type` | Tipo do recurso criado ou solicitado. |
| `resource_id` | Identificador do recurso original. |
| `original_status` | Status HTTP original. |
| `created_at` | Momento do registro. |

Operações protegidas:

- criação de paciente;
- criação de consulta;
- criação de parecer original;
- criação de complemento;
- regeneração manual de análise.

Invariantes:

- mesma chave, escopo e payload retornam o resultado original;
- mesma chave e payload diferente retornam conflito `409`;
- idempotência é persistida atomicamente com a operação;
- repetir criação de registro clínico não cria novo registro nem nova geração automática;
- não guardar conteúdo clínico redundante sem necessidade definida.

### `worker_heartbeat`

Registra estado operacional do worker.

Campos:

| Campo | Significado |
|---|---|
| `worker_id` | Identificador do worker. |
| `last_seen_at` | Última sinalização. |
| `state` | Estado operacional resumido. |

Não deve conter conteúdo clínico.

## 7. Índices e constraints principais

Índices aprovados:

- `patient(search_name, id)`;
- `appointment(patient_id, scheduled_at, id)`;
- `appointment(scheduled_at, id)`;
- `clinical_record(patient_id, clinical_datetime, created_at, id)`;
- `clinical_record(patient_id, revision)`;
- `analysis_generation(state, next_attempt_at, requested_at, id)`;
- `analysis_generation(patient_id, state)`;
- `analysis_generation(patient_id, snapshot_revision, request_sequence)`;
- evidências por `analysis_id`;
- evidências por `record_id`.

Constraints e triggers:

- CHECK de `clinical_record.type`;
- CHECK de presença/ausência de `original_id` conforme tipo;
- FK composta `(patient_id, original_id)` para `(patient_id, id)` em `clinical_record`;
- trigger garantindo que `original_id` aponte para `ORIGINAL`;
- vínculos entre consulta/registro e geração/análise incluindo `patient_id`;
- trigger `BEFORE UPDATE/DELETE` rejeitando alteração/exclusão de `clinical_record`, `clinical_analysis`, `analysis_evidence` e demais tabelas históricas;
- exceção para mudanças operacionais previstas em `analysis_generation`;
- exceção para fechamento de `analysis_attempt` nos campos previstos;
- trigger de evidência verificando `record.revision <= generation.snapshot_revision`;
- exclusões restritivas, sem cascatas destrutivas.

## 8. Snapshot, revisão e análise atual

Cada paciente possui uma revisão clínica monotônica. Ao criar parecer ou complemento:

1. o caso de uso bloqueia a linha do paciente com `SELECT FOR UPDATE`;
2. incrementa `clinical_revision`;
3. grava o registro clínico com a revisão atribuída;
4. cria a geração automática com `snapshot_revision` igual ao corte atual;
5. incrementa `request_sequence`;
6. grava tudo na mesma transação.

O snapshot de uma geração é o conjunto de registros do mesmo paciente com `revision <= snapshot_revision`.

Regras:

- revisão não deriva da data clínica;
- parecer retroativo recebe revisão nova no momento do cadastro;
- snapshot antigo continua reconstituível porque registros clínicos são append-only;
- paginação da UI não limita o snapshot enviado à IA;
- a IA recebe o snapshot em ordem clínica por `clinical_datetime`, `created_at` e ID.

A análise atual é selecionada assim:

1. considerar apenas análises válidas;
2. escolher a maior `snapshot_revision`;
3. em empate, escolher a maior `request_sequence`;
4. ignorar a ordem de conclusão.

Uma geração antiga que termina depois não substitui uma análise baseada em snapshot mais recente.

## 9. Worker de IA

### Objetivo

O worker processa gerações de IA fora do fluxo de salvamento clínico. Ele usa o PostgreSQL como fila persistente e roda no próprio backend.

### Ciclo de vida

1. Um parecer ou complemento é salvo.
2. Na mesma transação, o sistema cria uma `analysis_generation`.
3. Após commit, o worker encontra gerações elegíveis.
4. O worker reivindica a geração elegível mais antiga por `requested_at ASC, id ASC`.
5. A reivindicação usa `FOR UPDATE SKIP LOCKED` em transação curta.
6. O worker muda o estado para `RUNNING`, grava `lease_token`, `lease_expires_at` e incrementa tentativa.
7. A transação é encerrada.
8. O worker monta o snapshot, chama a IA e valida a resposta fora da transação.
9. Na finalização, grava análise, evidências e estado `COMPLETED` em uma única transação.
10. A finalização só é aceita se geração, estado, token e lease ainda forem válidos.

### Configuração operacional aprovada

| Item | Valor inicial |
|---|---|
| Quantidade de workers | Um worker no MVP. |
| Concorrência | Uma geração processada por vez. |
| Polling do worker | 2 segundos. |
| Timeout por chamada de IA | 120 segundos. |
| Orçamento por tentativa | 180 segundos. |
| TTL de reserva | 240 segundos. |
| Renovação automática de lease | Não implementar no MVP. |
| Tentativas por geração | Até 3, contando a primeira. |
| Backoff | Aproximadamente 5s antes da segunda tentativa e 20s antes da terceira, com jitter. |

### Estados

| Estado | Significado técnico | Estado público | Bloqueia regeneração manual |
|---|---|---|---|
| `QUEUED` | Aguardando execução. | Em geração. | Sim. |
| `RUNNING` | Reservada por worker. | Em geração. | Sim. |
| `RETRY_WAIT` | Aguardando próxima tentativa. | Em geração. | Sim. |
| `COMPLETED` | Análise validada e persistida. | Concluída. | Não, salvo outra geração ativa. |
| `FAILED` | Encerrada sem análise válida. | Falha. | Não, salvo outra geração ativa. |

### Retry

Falhas transitórias elegíveis para retry:

- timeout;
- falha de conexão;
- HTTP 429;
- HTTP 5xx.

Falhas que encerram a geração sem retry técnico automático:

- credenciais ou configuração inválida;
- contexto excedido;
- saída truncada ou limite de saída excedido;
- resposta inválida;
- resposta insegura;
- resposta incompatível com o contrato.

Retry técnico mantém o mesmo snapshot. Retry manual cria uma nova geração, se permitido pelas regras de negócio.

## 10. Integração com IA

### Entrada enviada ao provider

Enviar somente os dados necessários do snapshot:

- alias temporário do registro;
- tipo `ORIGINAL` ou `COMPLEMENT`;
- referência temporária ao original, quando for complemento;
- `clinicalDateTime`;
- texto clínico;
- humor;
- medicações.

Não enviar:

- nome do paciente;
- CPF;
- data de nascimento;
- telefone;
- e-mail;
- queixa inicial cadastral;
- observações de consulta;
- IDs internos;
- análises anteriores;
- dados de outro paciente;
- secrets ou configuração interna.

O backend mantém o mapeamento entre aliases temporários e registros reais para validar evidências.

### Saída esperada

Contrato estrutural:

```json
{
  "timeline": [
    {
      "text": "string",
      "nature": "REPORTED",
      "evidence": [
        { "recordAlias": "string", "field": "text", "quote": "string" }
      ]
    }
  ],
  "patterns": [],
  "attentionPoints": [],
  "limitations": ["string"]
}
```

`nature` aceita:

- `REPORTED`: conteúdo explicitamente registrado;
- `INTERPRETATION`: leitura/interpretação da IA sustentada por evidência.

`field` aceita apenas:

- `text`;
- `mood`;
- `medications`.

`timeline`, `patterns` e `attentionPoints` exigem evidência válida por item. `limitations` não exige evidência.

### Modos de análise

| Modo | Condição | Regras |
|---|---|---|
| Sem geração | Zero pareceres originais. | Não há fonte mínima para análise. |
| `SUMMARY_ONLY` | Exatamente um parecer original. | Pode organizar/resumir, mas `patterns` deve ficar vazio e deve haver limitação explícita de insuficiência longitudinal. |
| `LONGITUDINAL` | Dois ou mais pareceres originais. | Pode produzir leitura longitudinal usando todos os registros do snapshot. |

Complementos entram no snapshot, mas não aumentam a contagem de pareceres originais.

### Validação antes da persistência

Mesmo com Structured Outputs, o backend valida:

- schema esperado;
- existência do alias no snapshot;
- pertencimento ao mesmo paciente;
- campo permitido;
- citação literal existente no campo;
- registro dentro do corte `snapshot_revision`;
- regras de segurança clínica;
- ausência de diagnóstico, prescrição, conduta terapêutica e invenção de informação;
- ausência de tendência indevida em `SUMMARY_ONLY`.

A comparação de citação pode normalizar whitespace e quebras de linha apenas para comparação. Não há fuzzy matching, equivalência semântica, remoção de acentos ou reescrita de conteúdo clínico.

Política do MVP: rejeição integral. Se parte relevante falhar, a geração vira `FAILED` e nenhuma análise parcial é publicada.

## 11. API HTTP

Base: `/api/v1`.

Contratos:

- REST/JSON;
- OpenAPI para documentação;
- DTOs separados do domínio;
- entidades JPA nunca expostas;
- datas conforme a política temporal;
- erros em Problem Details.

Rotas propostas:

| Método e rota | Resultado |
|---|---|
| `POST /patients` | Cria paciente. Retorna 201. Exige `Idempotency-Key`. |
| `GET /patients?q&page&size` | Busca/lista pacientes paginados. |
| `GET /patients/{id}` | Retorna dados cadastrais. |
| `POST /patients/{id}/appointments` | Cria consulta `AGENDADA`. Retorna 201. Exige `Idempotency-Key`. |
| `GET /appointments?from&to&patientId&page&size` | Lista agenda por intervalo. |
| `POST /appointments/{id}/status` | Executa transição final de status. Retorna 200. |
| `GET /patients/{id}/clinical-records?page&size` | Retorna timeline descendente. |
| `POST /patients/{id}/clinical-records` | Cria parecer original. Retorna 201 e `generationId`. Exige `Idempotency-Key`. |
| `POST /patients/{id}/clinical-records/{originalId}/complements` | Cria complemento. Retorna 201. Exige `Idempotency-Key`. |
| `GET /patients/{id}/clinical-records/{recordId}` | Retorna fonte/evidência. |
| `POST /patients/{id}/analysis-generations` | Solicita regeneração manual. Retorna 202. Exige `Idempotency-Key`. |
| `GET /patients/{id}/analysis-state` | Retorna análise atual, geração ativa e permissões. |
| `GET /patients/{id}/analysis-generations?page&size` | Histórico de gerações. |
| `GET /patients/{id}/analyses/{analysisId}` | Análise histórica. |
| `GET /health/readiness` | Health local sem IA. |

DTOs citados na TechSpec:

- `PatientCreateRequest`: `name`, `cpf`, `birthDate`, `phone`, `email`, `initialComplaint`;
- `ClinicalRecordCreateRequest`: `text`, `mood`, `medications`, `clinicalDateTime`, `appointmentId`;
- complemento recebe `originalId` na rota;
- `AnalysisStateResponse`: `currentAnalysis`, `latestGeneration`, `activeGeneration`, `canRegenerate`, `reason` e cobertura.

## 12. Erros, paginação e datas

### Problem Details

Erros HTTP devem usar Problem Details com:

- `code`;
- `fieldErrors`, quando aplicável;
- `requestId`.

Não ecoar:

- dados clínicos;
- CPF, telefone ou valores sensíveis rejeitados;
- secrets;
- mensagens brutas do provider;
- mensagens brutas do banco.

Categorias:

| HTTP | Uso |
|---|---|
| 400 | Entrada inválida. |
| 404 | Recurso inexistente no contexto consultado. |
| 409 | Conflito de negócio ou idempotência. |
| 503 | Indisponibilidade técnica temporária. |

Falhas da IA após aceite da solicitação aparecem como estado da geração, não como erro HTTP retroativo.

### Paginação

Padrão:

- `page` começa em 0;
- `size` padrão é 25;
- `size` máximo é 100;
- ordenação estável com desempate por ID.

A paginação da UI nunca limita o snapshot completo usado pela IA.

### Datas e horários

Política aprovada:

- persistir instantes como PostgreSQL `timestamptz`;
- representar instantes no backend como `Instant`;
- receber datas/horas na API como ISO 8601 com offset;
- responder instantes em UTC;
- exibir na interface em `America/Sao_Paulo`;
- nascimento usa `DATE`/`LocalDate`;
- `createdAt` é gerado pelo servidor;
- `clinicalDateTime` permanece separado de `createdAt`;
- usar `java.time.Clock` injetável para testes.

## 13. Validações cadastrais e busca

Paciente:

- nome obrigatório após `trim`;
- CPF aceita entrada com ou sem máscara;
- CPF é normalizado para 11 dígitos;
- CPF é validado por dígitos verificadores;
- sequências repetidas são rejeitadas;
- CPF normalizado é único, inclusive sob concorrência;
- e-mail recebe `trim` e validação básica de formato;
- nascimento não pode estar no futuro considerando `America/Sao_Paulo`;
- opcionais vazios são persistidos como `null`;
- telefone brasileiro com DDD, 10 ou 11 dígitos nacionais, máscara permitida e normalização para `+55`.

Busca:

- por substring de nome;
- sem distinção de maiúsculas/minúsculas;
- sem distinção de acentos;
- usando `search_name`;
- consulta parametrizada;
- curingas escapados;
- ordenação por nome normalizado e ID;
- busca vazia retorna lista paginada.

## 14. Frontend

Capacidades implementadas:

- `src/app` compõe bootstrap, layout e rotas declarativas; `features` contém páginas placeholder; `shared` contém aviso, estado vazio, cliente HTTP, erros e idempotência.
- `/` redireciona para `/pacientes`; `/pacientes`, `/agenda` e `/prontuario` são navegáveis, sem dados nem requisições reais. Rotas desconhecidas têm mensagem e link de retorno.
- Aviso de uso exclusivo de dados fictícios no layout comum, sem dispensa e com posicionamento sticky; CSS responsivo simples, navegação semântica e foco visível.
- `ClienteApi.requisitar<T>` usa base relativa `/api/v1`, JSON, `Accept` comum, `Idempotency-Key` opcional e `AbortSignal`. Não mantém cache de paciente, não faz retry automático e usa `cache: no-store`.
- O chamador cria a chave UUID com `chaveDeIdempotencia()` uma vez por operação e mantém a mesma chave e corpo ao repetir um envio. A persistência de idempotência no backend não faz parte do bootstrap frontend.
- `ErroApi` contém status HTTP e metadados de Problem Details (`code`, `requestId` UUID e `fieldErrors` com formato restrito). Mensagens locais substituem texto remoto; `title`, `detail`, `instance`, mensagens de campo e valores rejeitados não são retidos. O cliente trata falha de transporte, JSON inválido e sucesso 204.
- A configuração de desenvolvimento fixa 127.0.0.1:5173, `strictPort` e proxy `/api` para 127.0.0.1:8080. Nenhum secret ou acesso a provider é necessário para iniciar a SPA.

Responsabilidades especificadas para as tasks funcionais, ainda não implementadas:

- cadastro e busca de pacientes;
- agenda;
- prontuário com dados, timeline, análise atual e histórico;
- formulários de parecer e complemento;
- evidências clicáveis para a fonte;
- estados vazios compreensíveis;
- estados de IA em geração, concluída e falha;
- mensagens fixas para seções vazias;
- limitação explícita em `SUMMARY_ONLY`.

Polling de análise especificado para a Task 10, ainda não implementado:

- a cada 3 segundos enquanto houver geração ativa e aba visível;
- atualização imediata ao retornar à aba;
- atualização após ações que possam iniciar geração;
- sem requisições sobrepostas;
- descarte de resposta atrasada de outro paciente;
- não sobrescrever formulários clínicos em edição;
- manter última análise válida visível durante geração ou falha.

Não usar Redux, framework CSS pesado ou biblioteca de cache/estado de servidor no MVP.

## 15. Segurança, privacidade e configuração

### Uso local

O MVP roda localmente e sem autenticação:

- backend em `127.0.0.1:8080`;
- frontend em `127.0.0.1:5173`;
- PostgreSQL em `127.0.0.1:5432` via `infra/compose.yaml`;
- Vite faz proxy de `/api` para o backend;
- não habilitar CORS amplo;
- backend e banco não devem ser publicados em interfaces externas por padrão.

Publicação ou acesso remoto futuro exige nova decisão explícita sobre segurança.

### Dados fictícios

O MVP deve usar somente dados fictícios. Não usar dados reais em:

- seed;
- fixture;
- mock;
- snapshot;
- teste;
- documentação;
- demo.

### Secrets

Backend lê por ambiente:

- credenciais do PostgreSQL;
- `OPENAI_API_KEY`;
- `OPENAI_MODEL`;
- parâmetros de worker;
- timeout;
- orçamento;
- TTL;
- retry;
- limites;
- URLs locais.

Frontend recebe apenas configuração pública. Nunca expor `OPENAI_API_KEY`, credenciais de banco ou secrets no bundle, logs, Problem Details, fixtures, testes ou documentação.

Versionar somente `.env.example` com placeholders. Arquivos reais de ambiente ficam fora do Git. O Compose local deve ser executado com `--env-file .env` após criação local desse arquivo a partir do template.

## 16. Observabilidade

Logs estruturados devem usar allowlist:

- `requestId`;
- identificador de geração;
- estado;
- tentativa;
- duração;
- códigos de resultado;
- contagens agregadas.

Não registrar:

- conteúdo integral de pareceres;
- prontuário completo;
- resposta integral da IA;
- CPF completo sem necessidade operacional explícita;
- bodies HTTP clínicos;
- secrets;
- credenciais;
- dados clínicos sensíveis em mensagens de erro.

Actuator expõe somente health/readiness local no MVP. Não há plataforma externa de observabilidade aprovada.

## 17. Testes e qualidade

Backend:

- JUnit 5;
- Spring Boot Test;
- Mockito;
- Testcontainers PostgreSQL;
- cobertura de migrations, constraints, triggers, locks, `SKIP LOCKED` e idempotência.

Frontend:

- Vitest;
- Testing Library;
- timers controlados para polling;
- testes de cliente HTTP, Problem Details e idempotência.

E2E:

- Playwright para principais fluxos.

CI:

- job backend em `.github/workflows/validacao.yml`, executando `./mvnw verify` com Java 21;
- job frontend em `.github/workflows/validacao.yml`, com Node fixado por `.nvmrc`, `npm ci`, typecheck, lint, testes Vitest e build;
- job integrado E2E em `.github/workflows/validacao.yml`, validando o Compose e executando E2E quando o script existir;
- sem job separado apenas para Compose.

Cenários críticos:

- persistência clínica mesmo com IA indisponível;
- append-only de pareceres;
- complemento preservando original;
- append-only de análises;
- análise anterior não sobrescrita;
- IA nunca usando outra análise como fonte;
- complemento como fonte e evidência;
- isolamento entre pacientes;
- zero, um e dois ou mais pareceres originais;
- ausência de falsa tendência em `SUMMARY_ONLY`;
- timeout, erro, resposta inválida e schema inválido do provider;
- retry controlado;
- evidência apontando para registro existente;
- ausência de diagnóstico, prescrição, recomendação de dose e invenção de informação;
- falha da IA sem perda ou alteração de dados clínicos.

Testes automatizados do bootstrap não dependem de provider externo; Testcontainers usa PostgreSQL 18.6 localmente. Provider OpenAI deve ser mock/fake nos testes comuns. Testes reais contra provider exigem autorização explícita.

## 18. Sequenciamento de implementação

Sequência de tasks aprovada:

1. `infra-bootstrap`;
2. `backend-bootstrap`;
3. `frontend-bootstrap`;
4. `backend-patient-appointment`;
5. `frontend-patient-appointment`;
6. `backend-clinical-records`;
7. `backend-analysis-worker`;
8. `backend-api-integration`;
9. `frontend-clinical-analysis`;
10. `qa-integration`.

Dependências principais:

- `infra-bootstrap` habilita backend; o bootstrap frontend é independente do banco/backend;
- `backend-clinical-records` depende de backend e infra;
- `backend-analysis-worker` depende de clinical records e infra;
- `backend-api-integration` depende de patient/appointment, clinical records e worker;
- `frontend-clinical-analysis` depende da integração de API, embora possa iniciar com mocks;
- `qa-integration` depende dos fluxos completos.

## 19. Limites técnicos do MVP

Não implementar no MVP sem nova decisão:

- autenticação/autorização;
- acesso remoto;
- cloud;
- Kubernetes;
- backend/frontend containerizados;
- broker externo;
- microservices;
- RAG;
- embeddings;
- banco vetorial;
- busca semântica;
- sumarização incremental como fonte clínica principal;
- segunda chamada de IA para revisão semântica;
- remoção parcial/recomposição de resposta da IA;
- CORS amplo;
- logs com conteúdo clínico;
- uso de dados reais.

## 20. Pontos pendentes para bootstrap/tasks

Ainda precisam ser definidos durante implementação:

- versão do SDK OpenAI; versões de Maven, Node.js, TypeScript, Flyway e driver JDBC estão definidas nos bootstraps;
- SQL final das migrations;
- nomes finais de propriedades e variáveis de ambiente da aplicação além dos placeholders iniciais;
- detalhes de cancelamento/timeout do SDK;
- limites concretos de entrada/saída e contagem de tokens;
- catálogo versionado de padrões textuais de segurança;
- mensagens finais de UX;
- envelopes finais de resposta/paginação;
- política concreta para requisições concorrentes de idempotência;
- comandos de execução dos fluxos funcionais futuros; os checks dos bootstraps já estão no README.
