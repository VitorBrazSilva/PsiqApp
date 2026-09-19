# TechSpec — Refatoração arquitetural e padronização de nomenclaturas

## 1. Resumo executivo

Esta TechSpec define a refatoração transversal do PsiqApp para alinhar nomenclaturas de domínio, papéis arquiteturais, API, JSON, persistência, frontend, testes e documentação, sem alterar comportamento funcional ou regras clínicas.

O sistema é um monorepo local composto por backend Java 21/Spring Boot 3.5.16, frontend React 19.2.8/TypeScript 6/Vite 8, PostgreSQL 18.6 com Flyway, worker assíncrono de análise no mesmo processo do backend e testes JUnit, Testcontainers, Vitest e Playwright. Essas tecnologias permanecem inalteradas.

A mudança será coordenada entre todos os consumidores internos. Não serão mantidas rotas, campos JSON, nomes de tabelas ou aliases de compatibilidade em inglês, pois o PRD declara que não existem clientes externos nem versões antigas da API em operação. A migração de banco será incremental, por uma nova migration Flyway, preservando registros, vínculos, constraints e histórico.

**Premissa de processo:** o `spec-review.md` da feature foi executado e aprovado. As decisões técnicas desta TechSpec devem permanecer dentro do escopo do PRD e das Rules aplicáveis.

Esta execução cria somente a TechSpec. Nenhum código, migration ou documento vivo do projeto é alterado nesta etapa.

## 2. Requisitos de origem

| Requisito | Cobertura técnica |
|---|---|
| RF-001 | TS-001, TS-003, TS-004, TS-005, TS-007, TS-011 |
| RF-002 | TS-001, TS-002, TS-003, TS-004, TS-008 |
| RF-003 | TS-005, TS-010, TS-011 |
| RF-004 | TS-006, TS-009 |
| RF-005 | TS-002, TS-008 |
| RF-006 | TS-009 |
| RF-007 | TS-005, TS-011, TS-012 |
| RF-008 | TS-012 |
| RNF-001 | TS-009 |
| RNF-002 | TS-006, TS-009 |
| RNF-003 | TS-002, TS-008 |
| RNF-004 | TS-001, TS-005, TS-006, TS-011 |
| RNF-005 | TS-001, TS-011, TS-012 |
| RNF-006 | TS-009, TS-010 |

## 3. Arquitetura e fluxo de dados

### 3.1 Fronteiras finais do backend

O backend continuará usando arquitetura hexagonal pragmática, com nomes de papéis arquiteturais convencionais em inglês e conceitos de negócio em português:

```text
com.psiqapp
├── domain
│   ├── model
│   ├── service
│   ├── validation
│   └── exception
├── application
│   ├── port
│   │   ├── in
│   │   └── out
│   ├── service
│   └── usecase
├── adapter
│   ├── in
│   │   └── web
│   └── out
│       ├── persistence
│       └── ai
└── config
```

A direção permitida permanece:

```text
adapter.in / adapter.out / config -> application -> domain
```

`domain` não depende de Spring, JPA, PostgreSQL, Jackson, SDK de IA ou classes HTTP. `application` depende somente de modelos de domínio, portas e serviços próprios. Adapters implementam portas e fazem conversões nas bordas. `config` somente compõe dependências e configura runtime.

### 3.2 Fluxo HTTP

```text
React SPA
  -> ApiClient centralizado
  -> Vite /api
  -> adapter.in.web (Controller + Request/Response DTO)
  -> application.usecase
  -> application.port.out
  -> adapter.out.persistence ou adapter.out.ai
  -> PostgreSQL ou provider de IA
```

Controllers não conterão regra de negócio, SQL, entidades JPA ou transformação de payload de provider. DTOs HTTP não serão usados como modelos de domínio.

### 3.3 Fluxo de análise

O salvamento de parecer ou complemento continuará independente da IA:

1. O use case valida e persiste o registro clínico, a solicitação de geração e a idempotência na mesma transação.
2. O commit torna o registro clínico disponível mesmo que o provider esteja indisponível.
3. O worker local reivindica a geração depois do commit.
4. O worker monta o snapshot completo, chama o provider por uma `Port`, valida a resposta e publica análise/evidências em uma transação separada.
5. Falha, timeout ou resposta inválida altera apenas o estado da geração e a auditoria da tentativa.

Não serão introduzidos broker, microservice, event bus, RAG, embeddings, banco vetorial ou nova tecnologia de infraestrutura.

## 4. Componentes

### TS-001 — Convenção de nomenclatura e inventário

**Responsabilidade:** definir uma matriz única de nomenclatura antes da alteração dos arquivos e contratos.

**Requisitos relacionados:** RF-001, RF-002, RF-003, RF-004, RF-007, RNF-004.

**Decisões:**

- Conceitos de negócio, clínicos e operacionais permanecem em português: `Paciente`, `Consulta`, `RegistroClinico`, `Parecer`, `Complemento`, `GeracaoAnalise`, `AnaliseClinica`, `EvidenciaAnalise`, `Idempotencia`.
- Papéis arquiteturais e padrões convencionais usam os termos de mercado em inglês: `Domain`, `Model`, `UseCase`, `Controller`, `Repository`, `Adapter`, `Port`, `Entity`, `DTO`, `Mapper`, `Configuration`, `Worker`, `Service`.
- O nome final combina o conceito de negócio em português com o papel quando ambos forem necessários, por exemplo `PacienteController`, `CriarPacienteUseCase`, `PacienteJpaEntity`, `PacienteRepository`.
- Termos externos e padrões HTTP permanecem como exceções documentadas: `HTTP`, `JSON`, `UUID`, `JPA`, `JDBC`, `OpenAPI`, `Problem Details`, `Idempotency-Key`, `X-Request-Id`, `OpenAI` e chaves reservadas do RFC 9457.
- Os nomes antigos podem aparecer somente nas migrations históricas V001–V003 e em testes explícitos de upgrade, nunca em referências funcionais ativas.

### TS-002 — Fronteiras arquiteturais e dependências

**Responsabilidade:** consolidar a separação entre domínio, aplicação, adapters e configuração.

**Requisitos relacionados:** RF-002, RF-005, RF-006, RNF-003.

**Decisões:**

- Renomear os pacotes atuais `dominio`, `aplicacao`, `adaptador` e `configuracao` para `domain`, `application`, `adapter` e `config`.
- Dividir `aplicacao.port` em `application.port.in` e `application.port.out` quando a porta representar claramente entrada ou saída. As interfaces de entrada serão usadas pelos Controllers; as de saída serão implementadas por adapters.
- Separar `domain.validation` de `domain.exception`: normalizadores e validadores ficam em `validation`; exceções de negócio ficam em `exception`.
- Manter `application.usecase` para orquestrações de caso de uso e `application.service` para serviços compartilhados de aplicação, sem criar interfaces ou classes apenas para satisfazer uma convenção nominal.
- Manter o frontend em `app`, `features` e `shared`, pois são papéis estruturais convencionais. Os nomes dos módulos de negócio dentro de `features` serão portugueses.
- Atualizar o teste ArchUnit para proteger os nomes e as dependências finais, incluindo ausência de dependência de framework no domínio e ausência de dependência de adapters/configuração pela aplicação.

### TS-003 — Nomenclatura do backend

**Responsabilidade:** aplicar os papéis convencionais aos componentes backend sem traduzir conceitos de domínio para inglês.

**Requisitos relacionados:** RF-001, RF-002, RF-005, RF-007.

Mapeamentos representativos:

| Atual | Final |
|---|---|
| `PacienteControlador` | `PacienteController` |
| `CriarPacienteRequisicao` | `CriarPacienteRequest` |
| `PacienteResposta` | `PacienteResponse` |
| `...CasoDeUso` | `...UseCase` |
| `...Servico` | `...Service` quando o componente for um serviço de aplicação/domínio |
| `Adaptador...` | `...Adapter` |
| `Entidade...Jpa` | `...JpaEntity` |
| `Repositorio...JpaSpring` | `...SpringDataRepository` |
| `FiltroRequestId` | `RequestIdFilter` |
| `TratadorDeErrosHttp` | `HttpErrorHandler` |
| `PaginaResposta` | `PageResponse` |
| `ChaveIdempotencia` | `IdempotencyKey` |
| `MontadorSnapshotAnalise` | `SnapshotAnaliseAssembler` |
| `ValidadorRespostaAnalise` | `AnaliseResponseValidator` |

O mapeamento completo será mantido no inventário da task de nomenclatura e deverá incluir classes, arquivos, imports, testes e referências em documentação. Classes de domínio como `Paciente`, `Consulta`, `RegistroClinico` e `AnaliseClinica` permanecerão em português.

### TS-004 — Estrutura e nomenclatura do frontend

**Responsabilidade:** alinhar módulos frontend aos conceitos de negócio e manter papéis React/técnicos reconhecíveis.

**Requisitos relacionados:** RF-001, RF-002, RF-003, RF-005, RF-007.

Estrutura final:

```text
apps/frontend/src/
├── app/
├── features/
│   ├── pacientes/
│   ├── consultas/
│   ├── registros-clinicos/
│   └── analises/
└── shared/
    ├── api/
    ├── componentes/
    ├── formularios/
    └── idempotencia/
```

Decisões:

- Renomear diretórios de negócio `patients`, `appointments`, `clinical-records` e `analyses` para `pacientes`, `consultas`, `registros-clinicos` e `analises`.
- Manter `features`, `app`, `shared`, `api` e hooks React como termos estruturais convencionais.
- Renomear serviços para `pacientesService`, `consultasService`, `registrosClinicosService` e `analisesService`; componentes de tela continuam usando nomes de negócio como `PaginaPacientes`.
- Preservar tipos de domínio em português e usar camelCase português nos campos: `pacienteId`, `dataNascimento`, `agendadaPara`, `dataHoraClinica`, `geracaoId`, `analiseAtual`, `pontosDeAtencao`.
- O `ApiClient` centralizado continuará sendo o único ponto de acesso HTTP. Nenhum componente fará `fetch` diretamente.

### TS-005 — Contrato HTTP público em português

**Responsabilidade:** substituir os nomes públicos em inglês por uma convenção portuguesa única, sem alterar semântica, status ou regras.

**Requisitos relacionados:** RF-003, RF-006, RF-007, RNF-001, RNF-004.

Base: `/api/v1`.

| Método e rota final | Resultado |
|---|---|
| `POST /pacientes` | Cria paciente; 201; exige `Idempotency-Key`. |
| `GET /pacientes?nome&pagina&tamanho` | Lista/busca pacientes; paginação padrão. |
| `GET /pacientes/{pacienteId}` | Retorna paciente. |
| `POST /pacientes/{pacienteId}/consultas` | Cria consulta `AGENDADA`; 201; exige `Idempotency-Key`. |
| `GET /consultas?de&ate&pacienteId&pagina&tamanho` | Lista agenda. |
| `POST /consultas/{consultaId}/status` | Transiciona status final; 200. |
| `GET /pacientes/{pacienteId}/registros-clinicos?pagina&tamanho` | Lista timeline clínica. |
| `POST /pacientes/{pacienteId}/registros-clinicos` | Cria parecer; 201; exige `Idempotency-Key`. |
| `POST /pacientes/{pacienteId}/registros-clinicos/{parecerOriginalId}/complementos` | Cria complemento; 201; exige `Idempotency-Key`. |
| `GET /pacientes/{pacienteId}/registros-clinicos/{registroId}` | Retorna fonte clínica/evidência. |
| `GET /pacientes/{pacienteId}/estado-analise` | Retorna estado atual da análise. |
| `GET /pacientes/{pacienteId}/geracoes-analise?pagina&tamanho` | Lista histórico de gerações. |
| `POST /pacientes/{pacienteId}/geracoes-analise` | Solicita regeneração manual; 202; exige `Idempotency-Key`. |
| `GET /pacientes/{pacienteId}/analises/{analiseId}` | Retorna análise histórica. |
| `GET /health/readiness` | Health técnico; permanece em inglês por ser endpoint operacional convencional. |

Não serão mantidas rotas antigas, aliases ou redirects. Referências a `/patients`, `/appointments`, `/clinical-records`, `/analysis-state`, `/analysis-generations` e `/analyses` devem desaparecer dos consumidores ativos; testes de contrato devem confirmar que essas rotas não são mais expostas.

### TS-006 — Modelo de persistência e migration Flyway

**Responsabilidade:** padronizar tabelas e colunas em português preservando dados existentes e histórico de migrations.

**Requisitos relacionados:** RF-004, RF-006, RNF-002, RNF-004.

Não editar V001, V002 ou V003. Criar uma migration nova, por exemplo `V004__padronizacao_nomenclaturas.sql`, aplicável tanto a uma base que já executou V003 quanto a uma base nova que executará todas as migrations.

Convenção final de tabelas:

| Atual | Final |
|---|---|
| `patient` | `paciente` |
| `appointment` | `consulta` |
| `clinical_record` | `registro_clinico` |
| `analysis_generation` | `geracao_analise` |
| `clinical_analysis` | `analise_clinica` |
| `analysis_evidence` | `evidencia_analise` |
| `analysis_attempt` | `tentativa_geracao_analise` |
| `idempotency_record` | `idempotencia` |

Colunas técnicas e de domínio devem seguir `snake_case` português, por exemplo:

| Atual | Final |
|---|---|
| `name` | `nome` |
| `search_name` | `nome_busca` |
| `birth_date` | `data_nascimento` |
| `initial_complaint` | `queixa_inicial` |
| `clinical_revision` | `revisao_clinica` |
| `request_sequence` | `sequencia_requisicao` |
| `scheduled_at` | `agendada_para` |
| `created_at` | `criada_em` ou `criado_em`, conforme a tabela |
| `status_changed_at` | `status_alterado_em` |
| `patient_id` | `paciente_id` |
| `original_id` | `parecer_original_id` |
| `appointment_id` | `consulta_id` |
| `clinical_datetime` | `data_hora_clinica` |
| `validated_payload` | `conteudo_validado` |
| `safety_rules_version` | `versao_regras_seguranca` |
| `generation_id` | `geracao_id` |
| `analysis_id` | `analise_id` |
| `record_id` | `registro_id` |
| `trigger_record_id` | `registro_disparador_id` |
| `snapshot_revision` | `revisao_snapshot` |
| `attempt_count` | `contagem_tentativas` |
| `next_attempt_at` | `proxima_tentativa_em` |
| `lease_token` | `token_reserva` |
| `lease_expires_at` | `reserva_expira_em` |
| `failure_code` | `codigo_falha` |

A migration deverá:

1. renomear tabelas e colunas com `ALTER TABLE ... RENAME`, sem recriar tabelas nem copiar dados;
2. renomear índices, constraints, funções e triggers para a convenção portuguesa;
3. atualizar valores persistidos dos enums de domínio (`ORIGINAL` para `PARECER`, `COMPLEMENT` para `COMPLEMENTO`, estados/gatilhos/modos/seções/campos conforme TS-007) em ordem segura, removendo e recriando checks quando necessário;
4. converter as chaves do JSONB de análises existentes para o schema canônico português, preservando todos os itens, evidências, citações e limitações;
5. manter FKs compostas, unicidades, `ON DELETE RESTRICT`, triggers append-only, índices de busca, locks por paciente e ordenação da timeline;
6. validar a contagem de linhas, relações, ids, hashes de payload e conteúdo lógico antes/depois em teste de migration.

O histórico Flyway permanecerá reproduzível: V001–V003 representam o estado histórico e V004 representa a transição para o estado canônico. Não haverá rollback destrutivo automático; qualquer rollback operacional deverá usar backup/snapshot aprovado.

### TS-007 — Modelo de domínio, enumerações e payload de análise

**Responsabilidade:** uniformizar nomes internos e o contrato estruturado de análise sem alterar as regras clínicas.

**Requisitos relacionados:** RF-001, RF-003, RF-004, RF-006.

Enumerações finais no domínio e na persistência:

| Conceito | Valores finais |
|---|---|
| Tipo de registro clínico | `PARECER`, `COMPLEMENTO` |
| Estado da geração | `ENFILEIRADA`, `EM_EXECUCAO`, `AGUARDANDO_RETENTATIVA`, `CONCLUIDA`, `FALHA` |
| Gatilho | `AUTOMATICA`, `MANUAL` |
| Modo de análise | `RESUMO`, `LONGITUDINAL` |
| Seção de análise | `LINHA_DO_TEMPO`, `PADROES`, `PONTOS_DE_ATENCAO` |
| Campo de evidência | `TEXTO`, `HUMOR`, `MEDICAMENTOS` |
| Natureza da observação | `RELATO`, `INTERPRETACAO` |

O payload canônico de análise, tanto na resposta HTTP quanto no JSONB novo, será:

```json
{
  "linhaDoTempo": [
    {
      "texto": "string",
      "natureza": "RELATO",
      "evidencias": [
        {
          "apelidoRegistro": "string",
          "registroId": "uuid",
          "campo": "TEXTO",
          "citacao": "string"
        }
      ]
    }
  ],
  "padroes": [],
  "pontosDeAtencao": [],
  "limitacoes": ["string"]
}
```

O adapter de IA mapeará o contrato do SDK/provider para esse modelo interno. O domínio não dependerá dos nomes ou tipos do provider. O provider fake usará o mesmo significado sem rede externa. Nenhuma análise anterior será usada como fonte clínica.

### TS-008 — Separação de responsabilidades confirmadas

**Responsabilidade:** reorganizar componentes somente quando houver mais de um motivo de mudança real.

**Requisitos relacionados:** RF-002, RF-005, RNF-003.

Decisões para os pontos identificados na exploração:

- `CriarRegistroClinicoServico` será separado em use cases explícitos para criação de parecer e criação de complemento, compartilhando somente a validação/orquestração comprovadamente comum. A regra de append-only e a criação transacional da geração permanecem no fluxo de aplicação.
- `AdaptadorRegistroClinicoJpa`, que hoje mistura JPA, SQL de timeline e estatísticas de snapshot, será dividido entre o adapter de persistência do registro e um componente de consulta de snapshot/estatísticas. Ambos implementam portas pequenas e continuam usando a mesma transação quando o caso de uso exigir.
- `AdaptadorAnaliseClinicaJdbc`, que persiste análise, JSONB e evidências, será dividido em responsabilidades de análise persistida e evidência persistida se a implementação final mantiver motivos de mudança independentes. A decisão de manter um adapter coeso será aceita se o teste de fronteira demonstrar que a separação criaria apenas indireção.
- `ProcessarGeracaoAnaliseCasoDeUso` continuará sendo o orquestrador de uma tentativa, mas a política de retry/backoff, montagem de snapshot, validação de resposta e chamada do provider permanecerá em serviços/ports distintos. O Controller/scheduler não conhecerá essas etapas.
- `WorkerAnaliseScheduler` será renomeado como componente de scheduling/configuração e não receberá SQL, regras clínicas ou detalhes do provider.
- Mappers HTTP e persistence não serão compartilhados com o domínio. Conversões de DTO/JPA ocorrerão nas bordas.

Para cada componente inventariado, a task deverá registrar `MANTER`, `RENOMEAR`, `SEPARAR` ou `JUSTIFICAR_MANUTENÇÃO`, com requisito, motivo e teste associado.

### TS-009 — Preservação de transações, idempotência e invariantes

**Responsabilidade:** impedir que a refatoração nominal altere comportamento clínico, concorrência ou isolamento.

**Requisitos relacionados:** RF-004, RF-006, RNF-001, RNF-002, RNF-006.

Devem permanecer inalterados:

- registros clínicos, análises e evidências append-only, com proteção na aplicação e nos triggers PostgreSQL;
- persistência de parecer/complemento independente da IA;
- geração automática após commit clínico e processamento fora da transação clínica;
- idempotência por operação, paciente, chave e hash de payload;
- revisão e sequência monotônicas reservadas sob lock da linha do paciente;
- snapshot limitado por revisão e composto por todos os registros clínicos, sem análises anteriores;
- FKs compostas por paciente para bloquear mistura de dados;
- lease, retry, backoff, expiração de reserva e resultado tardio do worker;
- seleção da análise atual pela regra existente, sem sobrescrever histórico;
- mascaramento de CPF, datas/instantes, paginação, status HTTP e validações de domínio, exceto nomes explicitamente alterados.

### TS-010 — Erros e contratos técnicos

**Responsabilidade:** manter tratamento seguro de falhas enquanto atualiza os campos próprios do projeto.

**Requisitos relacionados:** RF-003, RF-006, RF-007, RNF-006.

Problem Details continuará usando `application/problem+json` e os campos reservados do RFC (`type`, `title`, `status`, `detail`, `instance`) por interoperabilidade do padrão. Campos próprios serão portugueses:

```json
{
  "type": "urn:psiqapp:erro-validacao",
  "title": "Requisição inválida",
  "status": 400,
  "detail": "Entrada inválida.",
  "instance": "urn:uuid:...",
  "codigo": "VALIDACAO",
  "errosDeCampo": [{ "campo": "texto", "mensagem": "Obrigatório." }],
  "idRequisicao": "uuid"
}
```

O frontend converterá o envelope para `ApiError` com `status`, `codigo`, `idRequisicao` e `errosDeCampo`, sem reter `detail`, valores rejeitados, conteúdo clínico ou mensagens brutas do provider/banco.

Headers convencionais `Idempotency-Key`, `X-Request-Id` e `Accept` permanecem como exceções técnicas documentadas. Falhas da IA depois de 202 continuam sendo estado da geração, não erro HTTP retroativo.

### TS-011 — Atualização coordenada e eliminação de referências antigas

**Responsabilidade:** garantir que backend, frontend, testes, fixtures, documentação, OpenAPI, migrations ativas e configuração usem o estado final.

**Requisitos relacionados:** RF-001, RF-003, RF-004, RF-007, RNF-004.

Após cada bloco de alteração, executar busca por identificadores antigos e manter uma allowlist somente para V001–V003 e testes de upgrade. A busca deve abranger `apps`, `infra`, `docs`, `README.md`, workflows e artefatos da feature. O scan deve detectar nomes antigos de:

- pacotes e classes backend;
- rotas, query params, headers próprios e campos JSON;
- tabelas, colunas, enums, SQL e nomes de migrations novas;
- diretórios, imports, tipos e mocks frontend;
- testes, fixtures, OpenAPI e documentação.

Não criar contratos duplos, aliases de DTO ou período de convivência. A ordem de atualização será backend interno/persistência, contrato HTTP, frontend e documentação, com compilação e testes após cada fronteira.

### TS-012 — Configuração, documentação e CI

**Responsabilidade:** refletir a convenção final nos pontos operacionais sem criar incompatibilidade acidental.

**Requisitos relacionados:** RF-007, RF-008, RNF-004, RNF-005.

Renomear as propriedades próprias de análise para a forma portuguesa, por exemplo `psiqapp.analise.worker.*` e variáveis `PSIQAPP_ANALISE_*`. Manter nomes obrigatórios de integrações externas (`OPENAI_API_KEY`, `OPENAI_MODEL`), propriedades do Spring/Actuator, comandos de ferramentas e nomes de padrões técnicos quando não forem conceitos do produto.

Atualizar `README.md`, `docs/BUSINESS.md`, `docs/TECHNICAL.md`, OpenAPI gerado/validado, workflows e documentos da feature para descrever somente o estado final. PDFs/HTML derivados só serão regenerados se fizerem parte do fluxo de documentação da task; não devem ser tratados como fonte canônica.

A CI continuará com jobs separados de backend, frontend e E2E. Os comandos existentes e versões de Java/Node não serão trocados.

## 5. Interfaces e contratos

### 5.1 DTOs HTTP finais

Os DTOs devem usar nomes de classes com papéis em inglês e campos de negócio em português:

- `CriarPacienteRequest`: `nome`, `cpf`, `dataNascimento`, `telefone`, `email`, `queixaInicial`.
- `PacienteResponse`: `id`, `nome`, `cpf` mascarado, `dataNascimento`, `telefone`, `email`, `queixaInicial`, `criadoEm`.
- `CriarConsultaRequest`: `agendadaPara`, `observacoes`.
- `ConsultaResponse`: `id`, `pacienteId`, `agendadaPara`, `status`, `observacoes`, `criadaEm`, `statusAlteradoEm`.
- `CriarRegistroClinicoRequest`: `texto`, `humor`, `medicamentos`, `dataHoraClinica`, `consultaId`.
- `CriarRegistroClinicoResponse`: `registro`, `geracaoId`, `geracao`.
- `GeracaoAnaliseResponse`: campos portugueses de geração e estado.
- `EstadoAnaliseResponse`: `analiseAtual`, `ultimaGeracao`, `geracaoAtiva`, `podeRegenerar`, `motivo`.
- `AnaliseResponse`: `id`, `geracaoId`, `pacienteId`, `geradaEm`, `modo`, `linhaDoTempo`, `padroes`, `pontosDeAtencao`, `limitacoes`.
- `PageResponse<T>`: `itens`, `pagina`, `tamanho`, `total`.

### 5.2 Datas, paginação e headers

- `pagina` começa em 0; `tamanho` padrão 25 e máximo 100.
- Ordenação permanece estável com desempate por UUID.
- Instantes entram como ISO 8601 com offset e saem em UTC; `LocalDate` permanece para nascimento.
- A UI continua exibindo instantes em `America/Sao_Paulo`.
- `createdAt`/`created_at` passam a `criadoEm`/`criado_em` quando forem campos do produto; o servidor continua sendo a fonte do instante.
- `Idempotency-Key` permanece obrigatório nas criações protegidas e o chamador mantém a mesma chave e corpo ao repetir.
- `X-Request-Id` continua sendo o identificador técnico de correlação; seu valor nunca conterá dados clínicos.

## 6. Modelo de dados e persistência

O modelo final mantém as mesmas entidades e relações do estado atual, com nomes portugueses. `paciente` é a raiz de isolamento; toda consulta, registro, geração, análise e evidência deve carregar `paciente_id` e respeitar FKs compostas quando aplicável.

As migrations novas não podem usar `DROP TABLE`, recriação destrutiva, `ON DELETE CASCADE` ou perda silenciosa de colunas. Índices de `nome_busca`, timeline, estado de geração, snapshot e análise atual devem ser renomeados e preservados.

O JSONB `analise_clinica.conteudo_validado` será versionado implicitamente pelo contrato da TechSpec. A migration V004 fará conversão determinística dos objetos históricos para `linhaDoTempo`, `padroes`, `pontosDeAtencao`, `limitacoes`, `texto`, `natureza`, `evidencias`, `apelidoRegistro`, `registroId`, `campo` e `citacao`. A conversão deverá ser coberta por teste com dados fictícios.

Não haverá alteração de significado de `revisao_clinica`, `sequencia_requisicao`, snapshot, append-only, constraints de paciente ou auditoria de tentativas.

## 7. APIs / entradas e saídas

As entradas, saídas, estados e códigos de validação serão atualizados coordenadamente nos DTOs backend, adapters, OpenAPI, serviços TypeScript, componentes, mocks, fixtures e E2E. A semântica de cada operação deve permanecer idêntica.

O frontend não fará tradução em tempo de execução entre contrato antigo e novo. Ele consumirá diretamente o contrato final em português. Isso evita dois modelos concorrentes e permite que o compilador e os testes revelem referências não atualizadas.

Os recursos clínicos permanecem append-only. Uma resposta de criação de parecer/complemento continuará retornando o registro criado e a geração enfileirada; a indisponibilidade do provider não muda o status da criação clínica.

## 8. Integrações externas

- PostgreSQL permanece local, em `127.0.0.1:5432`, via Docker Compose.
- Flyway continua responsável pela evolução do schema.
- JPA/Hibernate e `JdbcTemplate` permanecem restritos a `adapter.out.persistence`.
- OpenAI continua atrás de `ProvedorAnaliseClinicaPort` (ou equivalente final), com provider fake determinístico para testes.
- O adapter de IA faz o mapeamento entre o formato do SDK/provedor e o contrato interno português. O domínio não importa SDK externo.
- Testes comuns usam fake/mock; nenhuma chamada real de provider é necessária ou permitida sem autorização explícita.
- Nenhuma dependência externa nova será introduzida pela refatoração.

## 9. Tratamento de erros e resiliência

Falhas de compilação, referências antigas, inconsistências de migration e contrato serão tratadas como bloqueadores da task correspondente. Não será usado fallback silencioso para nomes antigos.

Falhas de banco durante V004 devem interromper a migration de forma transacional sempre que o PostgreSQL permitir. Antes da aplicação em uma base com dados, registrar contagens e validações de integridade; depois, repetir as mesmas consultas e comparar ids, relacionamentos e conteúdo lógico.

Falhas do worker, timeout, erro do provider, schema inválido ou resposta insegura continuam sendo estados da geração e tentativas auditadas, nunca rollback do registro clínico. A migração de nomes não pode alterar retry, lease, seleção de geração, idempotência ou encerramento terminal.

## 10. Segurança, privacidade e compliance

- O MVP continua restrito a dados fictícios.
- Nenhum nome de paciente, CPF, telefone, e-mail, queixa, observação de consulta, ID interno ou análise anterior será enviado ao provider de IA.
- Logs não conterão texto clínico, prontuário, resposta integral da IA, CPF completo, tokens, cookies, secrets ou credenciais.
- Erros expostos ao cliente não ecoarão dados sensíveis, mensagens brutas do provider, SQL ou conteúdo clínico.
- O CPF continuará mascarado nas respostas de paciente.
- Toda operação clínica continuará isolada por paciente; as FKs e os testes de evidência cruzada devem permanecer ativos.
- Nenhuma mudança desta feature habilita autenticação, autorização, exposição remota ou uso com dados reais.

## 11. Observabilidade

Os logs estruturados usarão somente allowlist técnica, com nomes finais preferencialmente em português: `idRequisicao`, `geracaoId`, `estado`, `tentativa`, `duracaoMs`, `codigoResultado` e contagens agregadas. `X-Request-Id` continuará como header técnico de correlação.

A instrumentação não deve registrar nomes antigos como parte de mensagens operacionais, exceto em diagnóstico explícito de migration. Actuator permanece restrito a health/readiness local, sem conteúdo de IA ou prontuário.

## 12. Estratégia de testes

### Unitários

- Testar normalizadores, enumerações, mapeamentos DTO/domínio/JPA, `ApiError`, paginação e contratos de análise com os nomes finais.
- Testar os novos serviços/use cases separados sem depender de Spring, PostgreSQL ou provider real.
- Testar que a criação de parecer/complemento continua aceitando os mesmos dados válidos, rejeitando os mesmos inválidos e calculando o mesmo modo de análise.
- Testar que o validador de análise rejeita evidência inexistente, outro paciente, registro fora do snapshot, campo inválido, citação inexistente, diagnóstico/prescrição/invenção e tendência indevida em `RESUMO`.

### Integração

- Executar `./mvnw verify` com Testcontainers PostgreSQL.
- Aplicar V001–V004 a banco vazio e V004 sobre um banco preparado em V003 com dados fictícios.
- Comparar antes/depois: contagens por tabela, ids, FKs, unicidades, índices essenciais, estados, enumerações, JSONB, citações e vínculos paciente-registro-análise.
- Validar triggers append-only, locks por paciente, idempotência, retry/lease e resultado tardio.
- Atualizar testes de contrato HTTP para rotas e campos portugueses, statuses 201/202/200, Problem Details, paginação, datas UTC e CPF mascarado.
- Confirmar que rotas antigas retornam 404 e não são documentadas no OpenAPI.

### E2E / fluxos de sistema

- Atualizar fixtures Playwright para `/pacientes`, `/consultas`, `/registros-clinicos`, `/geracoes-analise` e campos portugueses.
- Executar cadastro/busca/abertura de paciente, criação de consulta, parecer, complemento, timeline, polling, evidência e regeneração.
- Validar isolamento entre dois pacientes e persistência do parecer com provider fake indisponível/falhando.
- Validar reload após análise concluída e preservação do aviso de dados fictícios.

### Contrato, segurança ou domínio específico

- Atualizar teste ArchUnit para as fronteiras `domain`, `application`, `adapter` e `config`.
- Criar scan automatizado de referências antigas com allowlist explícita para V001–V003 e testes de upgrade.
- Validar OpenAPI, conteúdo `application/problem+json`, headers técnicos e ausência de DTO/entity JPA exposta.
- Usar somente fixtures e seeds fictícios; testes não podem depender de rede externa.
- Manter a matriz `RF/RNF -> TS -> task -> teste/evidência` em cada task.

Checks finais esperados:

```text
apps/backend: ./mvnw --batch-mode --no-transfer-progress verify
apps/frontend: npm ci
apps/frontend: npm run typecheck
apps/frontend: npm run lint
apps/frontend: npm test -- --run
apps/frontend: npm run build
apps/frontend: npm run e2e
raiz: docker compose --env-file .env.example -f infra/compose.yaml config --quiet
```

## 13. Sequenciamento recomendado

1. **Inventário e matriz de nomenclatura:** congelar o mapeamento antigo/final, allowlist histórica, componentes e requisitos.
2. **Fronteiras backend:** renomear pacotes, classes, imports e teste ArchUnit; separar somente componentes confirmados em TS-008.
3. **Persistência:** criar V004, atualizar entidades/adapters/SQL e validar upgrade com dados fictícios.
4. **Domínio e worker:** atualizar enumerações, payload JSONB, provider fake/OpenAI adapter, scheduler e configuração mantendo invariantes.
5. **API:** renomear rotas, query params, DTOs e Problem Details; atualizar OpenAPI e testes de contrato.
6. **Frontend:** renomear features, serviços, tipos, componentes, cliente HTTP e mocks para o contrato final.
7. **Documentação e CI:** atualizar README, BUSINESS, TECHNICAL, workflows e artefatos canônicos, sem declarar comportamento inexistente.
8. **Validação integrada:** executar scan de resíduos, migration upgrade, backend, frontend e E2E; registrar evidências e rastreabilidade.

Dependências: persistência e domínio devem estar estáveis antes do contrato; o frontend depende do contrato HTTP final; documentação e scan final dependem de todos os consumidores atualizados.

## 14. Decisões e trade-offs

### Renomear migrations históricas ou criar V004

**Decisão:** criar V004 e manter V001–V003 imutáveis.

**Motivo:** preserva o histórico Flyway e permite atualizar uma base já existente sem perda. Editar migrations aplicadas faria o checksum divergir e não resolveria a atualização de dados existentes.

### Manter compatibilidade com endpoints antigos

**Decisão:** não manter aliases, redirects ou DTOs duplos.

**Motivo:** o PRD confirma sistema único sem clientes externos. Compatibilidade dupla manteria nomenclatura divergente e aumentaria o risco de caminhos não testados.

### Usar nomes portugueses também para papéis arquiteturais

**Decisão:** não traduzir papéis convencionais; usar `Controller`, `UseCase`, `Adapter`, `Repository`, `Entity`, `Port`, `Service` e `Worker`.

**Motivo:** atende RF-002, melhora reconhecimento arquitetural e evita termos locais ambíguos como `Controlador`/`Adaptador` misturados com nomes de domínio.

### Traduzir campos reservados de Problem Details e headers

**Decisão:** manter campos RFC 9457 e headers técnicos padronizados; traduzir todos os campos próprios do projeto.

**Motivo:** preserva interoperabilidade do media type e da correlação HTTP sem abrir exceção para conceitos de negócio.

### Dividir todos os componentes grandes

**Decisão:** separar somente quando houver motivos de mudança independentes demonstrados por inventário e teste.

**Motivo:** o PRD e as Rules proíbem abstração/fragmentação sem benefício comprovado; coesão é preferível à quantidade de arquivos.

## 15. Riscos técnicos e mitigação

| Risco | Mitigação |
|---|---|
| Migration perde ou desvincula dados | V004 por rename, sem cópia destrutiva; comparação de ids, contagens, FKs e JSONB antes/depois. |
| Enumeração antiga quebra leitura de registros | Atualização explícita dos valores antes de recriar checks; teste de upgrade e banco vazio. |
| JSONB histórico perde evidências | Conversão determinística e teste semântico de cada item/citação/limitação. |
| Consumidor interno fica em contrato antigo | Atualização coordenada, compilação, contrato HTTP, E2E e scan de referências com allowlist. |
| Refatoração altera regra clínica | Testes de domínio, integração e cenários críticos das Rules; nenhum novo fluxo de produto. |
| Separação cria dependência indevida | ArchUnit, portas pequenas e revisão de responsabilidade por componente. |
| Configuração local deixa de iniciar | Atualizar `.env.example`, Compose, README, workflow e testes de contexto juntos. |
| Dados sensíveis aparecem em novos logs/erros | Revisão pela allowlist de logs, testes de privacidade e manutenção do `HttpErrorHandler` seguro. |

## 16. Conformidade com rules e skills

### Rules

- `architecture-boundaries.md`: preserva hexagonal pragmática, ports, worker no backend, ausência de broker e separação da IA.
- `product-invariants.md`: preserva fonte clínica, append-only, snapshots, histórico de análises, isolamento e independência da IA.
- `clinical-ai-safety.md`: mantém validação de schema/evidência/segurança e não publica respostas inseguras.
- `clinical-data-privacy.md`: mantém dados fictícios, minimização no provider, logs seguros, CPF mascarado e secrets fora do Git.
- `testing-quality.md`: cobre cenários críticos, migration, fronteiras arquiteturais, checks existentes e testes sem rede externa.
- `documentation-maintenance.md`: exige atualização localizada da documentação viva quando a implementação for realizada.

### Skills

Nenhuma skill disponível é necessária para criar esta TechSpec. A tarefa é documentação técnica Markdown; não envolve geração de imagem, documento Office, PDF, planilha, apresentação ou controle de aplicativo.

## 17. Arquivos/módulos impactados

### Artefatos SDD

- `tasks/prd-refatoracao-arquitetural-nomenclaturas/techspec.md` — criado nesta execução.
- `tasks/prd-refatoracao-arquitetural-nomenclaturas/tasks.md` e tasks numeradas — a criar posteriormente via `create_tasks` após revisão desta TechSpec.
- `tasks/prd-refatoracao-arquitetural-nomenclaturas/spec-review.md` — review do PRD e gate de entrada para a TechSpec.

### Backend

- `apps/backend/src/main/java/com/psiqapp/domain/**`
- `apps/backend/src/main/java/com/psiqapp/application/**`
- `apps/backend/src/main/java/com/psiqapp/adapter/**`
- `apps/backend/src/main/java/com/psiqapp/config/**`
- `apps/backend/src/main/resources/db/migration/V004__padronizacao_nomenclaturas.sql`
- `apps/backend/src/main/resources/application*.yaml`
- `apps/backend/src/test/**`

### Frontend

- `apps/frontend/src/app/**`
- `apps/frontend/src/features/pacientes/**`
- `apps/frontend/src/features/consultas/**`
- `apps/frontend/src/features/registros-clinicos/**`
- `apps/frontend/src/features/analises/**`
- `apps/frontend/src/shared/**`
- `apps/frontend/e2e/**`

### Documentação e configuração

- `README.md`
- `docs/BUSINESS.md`
- `docs/TECHNICAL.md`
- `.github/workflows/validacao.yml`
- `.env.example`
- `infra/compose.yaml`

### Definition of Ready da TechSpec

- [x] cobre RF/RNF aplicáveis do PRD;
- [x] decisões técnicas possuem IDs TS estáveis;
- [x] arquitetura, contratos e persistência estão descritos;
- [x] riscos e modos de falha estão descritos;
- [x] estratégia de testes cobre critérios de aceite críticos;
- [x] tecnologias foram derivadas do repositório existente;
- [x] solução evita compatibilidade dupla, broker e fragmentação sem justificativa;
- [x] `spec-review.md` da feature disponível e aprovado.
