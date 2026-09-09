# TechSpec — PsiqApp MVP

**Status: APROVADA E FECHADA — decisões técnicas aprovadas pelo usuário em 2026-09-09.**

## 1. Resumo executivo

Fonte: [PRD](prd.md) e [spec-review aprovado](spec-review.md). O repositório contém documentação SDD e Rules, sem aplicação, stack implementada, persistência, testes ou infraestrutura existentes.

Diretrizes confirmadas pelo usuário:

- Backend em Java 21 LTS, Spring Boot 3.5.16 e Maven.
- Arquitetura hexagonal pragmática: Domain / Application / Adapters; ports apenas nas fronteiras relevantes.
- Frontend SPA com React 19.2, TypeScript, Vite 8 e CSS simples; componentes por responsabilidade, sem Redux inicial nem framework CSS pesado.
- PostgreSQL 18.6 e migrations com Flyway.
- Spring Data JPA/Hibernate no adapter de persistência, entidades JPA separadas do domínio e mapeamento manual inicial.
- Fila persistente no PostgreSQL e worker agendado no próprio backend; solicitação gravada na mesma transação do registro clínico, chamada externa após commit e retomada de pendências após restart.
- Tabela `clinical_record` com `type = ORIGINAL | COMPLEMENT`; complemento referencia obrigatoriamente um ORIGINAL do mesmo paciente.
- Append-only protegido pelo backend e por triggers PostgreSQL para registros clínicos, análises concluídas e evidências; estado operacional das gerações atualizável durante processamento.
- Snapshot lógico por revisão monotônica por paciente, com `snapshotRevision` congelada na geração.
- Análise atual: maior `(snapshotRevision, requestSequence)` entre análises válidas, independentemente da ordem de conclusão.
- Worker único, uma geração por vez, polling inicial de 2 segundos e reserva persistida com token/validade; resultado condicionado à reserva ainda válida.
- Até 3 tentativas por geração para falhas transitórias, backoff aproximado de 5s/20s com jitter e respeito ao Retry-After; retry manual cria nova geração.
- Idempotency-Key persistida atomicamente para cadastro de paciente/consulta, parecer, complemento e regeneração manual.
- Ambiente local, PostgreSQL via Docker Compose, sem cloud, Kubernetes ou broker externo.
- IA externa atrás de port, processamento assíncrono persistente e sem RAG.
- OpenAI inicial com `OPENAI_MODEL=gpt-5.6-terra` externalizado; domínio/casos de uso independentes do modelo.
- Estados QUEUED/RUNNING/RETRY_WAIT/COMPLETED/FAILED; espera libera o worker; COMPLETED/FAILED terminais.
- Tentativa contada ao adquirir a reserva, inclusive em crash anterior ao envio; retries internos do SDK desativados.
- SDK oficial Java no OpenAiClinicalAnalysisAdapter, Responses API e Structured Outputs com JSON Schema; validação obrigatória no backend antes da persistência.
- Limites externalizados iniciais: 120s por chamada, 180s por tentativa e TTL de 240s, sem renovação automática; resultados com reserva inválida são descartados.
- Rejeição integral de resposta inválida no MVP, sem publicação parcial e preservando a última análise válida.
- Contexto mínimo exclusivo do snapshot, identificadores temporários e mapeamento mantido no backend, sem cadastro/observações de consulta/IDs internos no payload.
- Contrato com timeline, patterns, attentionPoints e limitations; padrões/pontos de atenção distinguem relato/interpretação e possuem evidências com identificador temporário, campo permitido e trecho literal validado.
- Uma geração por tentativa, com prompt restritivo e validações determinísticas; sem segunda chamada de revisão semântica no MVP. Reavaliar após testes adversariais e validação clínica.
- Observações `{text, nature, evidence[]}`, nature REPORTED/INTERPRETATION; evidências `{recordAlias, field, quote}`, field text/mood/medications; comparação permite normalização de whitespace/quebras de linha, sem fuzzy matching ou equivalência semântica.
- Modo calculado pelo backend: zero originais não gera; um original usa SUMMARY_ONLY com patterns vazio e limitação explícita; dois ou mais usam LONGITUDINAL. Complementos não aumentam essa contagem.
- Excesso de contexto ou saída truncada/excedida causa FAILED com motivo específico; sem cortar, selecionar, resumir silenciosamente ou dividir o snapshot em múltiplas chamadas.
- Timeline usa o mesmo contrato das observações e exige evidências por item; limitations é lista de textos, com aviso fixo inserido pelo backend em SUMMARY_ONLY; seções vazias recebem mensagem fixa na UI.
- Catálogo versionado e conservador de padrões textuais de segurança, com rejeição integral de sinalizações e testes de falsos positivos; camada complementar sem garantia semântica completa.
- Auditoria de modelo/versões/snapshot por geração e horários/resultado/request ID/tokens por tentativa; falhas guardam apenas metadados necessários, sem resposta clínica rejeitada completa ou secrets.
- Integridade relacional por paciente via constraints, referência de complemento validada como ORIGINAL e exclusões restritivas sem cascatas destrutivas.
- Serialização por SELECT FOR UPDATE na linha do paciente para revisão/sequência e verificação/criação concorrente de gerações, sem IA na transação.
- Reivindicação da geração elegível mais antiga por requestedAt/id com FOR UPDATE SKIP LOCKED; finalização atômica de análise/evidências/COMPLETED sob reserva válida.
- TransactionRunnerPort único em application/port/out, implementado via TransactionTemplate no adapter de persistência, somente para blocos atômicos e nunca envolvendo IA externa.
- API REST/JSON sob /api/v1, controllers/DTOs separados do domínio, contratos OpenAPI; 201 para criações, 202 para regeneração assíncrona e 200 para alterações síncronas de estado.
- Erros Problem Details com code, fieldErrors quando aplicável e requestId; 400/404/409/503 conforme categoria, sem eco de dados sensíveis; falha de IA após aceite pertence ao estado da geração.
- Idempotência obrigatória com UUID, escopo por operação/paciente, hash SHA-256 de payload validado canônico, referência/status original e retenção durante a vida do banco do MVP.
- Paginação page/size: início 0, padrão 25, máximo 100; ordenação estável com desempate por ID; paginação de UI não limita snapshot.
- Instantes em timestamptz/Instant; entrada ISO 8601 com offset, saída UTC e exibição America/Sao_Paulo; nascimento DATE/LocalDate; java.time.Clock injetável, sem ClockPort próprio.
- Execução local: PostgreSQL via Docker Compose com volume persistente; backend pelo Maven Wrapper e frontend pelo Vite diretamente na máquina; portas 127.0.0.1:8080, :5173 e :5432; proxy Vite de /api para o backend.
- MVP sem autenticação, restrito a loopback e dados fictícios; não habilitar CORS amplo. Acesso remoto/publicação exige nova decisão explícita de segurança.
- Configuração sensível por variáveis de ambiente no backend; somente .env.example com placeholders versionado; frontend recebe apenas configuração pública e nunca OPENAI_API_KEY.
- Cadastro: nome obrigatório após trim, CPF normalizado/validado/único, e-mail com trim e validação básica, nascimento não futuro no fuso escolhido e opcionais vazios como null.
- Telefone inicialmente apenas brasileiro, com DDD e 10/11 dígitos, aceitando máscara e normalizando para +55; validação estrutural.
- Busca por substring de nome normalizado, ignorando caixa/acentos, preservando nome para exibição; SQL parametrizado, curingas escapados, ordenação por nome normalizado/ID e busca vazia paginada.
- SPA em apps/frontend, PostgreSQL em infra/compose.yaml; src/app para bootstrap/rotas/configuração, src/features por capacidade e src/shared apenas para itens realmente compartilhados.
- React Router declarativo, fetch em cliente HTTP centralizado, hooks simples e estado local; sem biblioteca de cache/estado de servidor no MVP.
- Polling de IA a cada 3s somente com geração ativa/aba visível; atualização ao retornar e após ações de geração, sem sobreposição de requests, respostas de paciente anterior ou sobrescrita de formulários.
- Monorepo.
- Tasks separadas em back, front e infra.
- Todas as decisões técnicas devem ser discutidas com o usuário antes de fechar a TechSpec. Ausência de resposta não constitui escolha.

As propostas anteriores de Python/Django, SQLite, templates de servidor e Anthropic foram retiradas como decisões da solução. Nenhuma implementação foi realizada.

## 2. Requisitos de origem

Todos os RF-001 a RF-020 e RNF-001 a RNF-008 permanecem obrigatórios. A matriz RF/RNF -> TS será finalizada após as decisões. O PRD e as Rules não foram alterados.

| Grupo de origem | Aspectos a especificar |
|---|---|
| RF-001 a RF-003 | cadastro, validação, busca e dados do paciente |
| RF-004 a RF-006 | consultas, agenda e estados finais |
| RF-007 a RF-009 | pareceres/complementos append-only, datas e linha do tempo |
| RF-010 e RF-011 | processamento automático e regeneração manual |
| RF-012 a RF-016 | conteúdo, fonte, suficiência, evidências e limites da IA |
| RF-017 a RF-020 | histórico, auditoria, falhas e isolamento |
| RNF-001 a RNF-008 | usabilidade, independência da IA, auditoria, privacidade, limites e volume |

## 3. Arquitetura e fluxo de dados

### TS-001 — Backend Java com Spring Boot

**Responsabilidade:** implementar os casos de uso do backend.
**Requisitos relacionados:** RF-001 a RF-020; RNF-002, RNF-003, RNF-006, RNF-007.
**Status:** Java 21 LTS, Spring Boot 3.5.16 e Maven confirmados. A versão específica 3.5.16 prevalece sobre a referência resumida à família 3.5.x. Patch/distribuição do JDK e versão do Maven ainda serão definidos.

A documentação oficial confirma a compatibilidade do Spring Boot 3.5.16 com Java 21: [requisitos do Spring Boot](https://docs.spring.io/spring-boot/3.5/system-requirements.html). Isso não representa verificação de todas as dependências transitivas, que ainda serão selecionadas.

### TS-002 — Monorepo e separação das tasks

**Responsabilidade:** manter back, front e infra no mesmo repositório, com tasks identificadas por área e dependências explícitas.
**Requisitos relacionados:** decisão de organização do usuário; suporte transversal à implementação dos RF/RNF.
**Status:** monorepo, categorias, caminhos `apps/backend/`, `apps/frontend/` e `infra/compose.yaml` confirmados. CI com backend/frontend separados e integração E2E confirmada; Compose será validado no job integrado, sem job de infra separado.

Fluxo geral confirmado: SPA React em 127.0.0.1:5173 -> proxy Vite `/api` -> adaptador web Spring Boot em 127.0.0.1:8080 -> casos de uso -> ports de saída -> adaptadores de persistência/IA -> PostgreSQL em 127.0.0.1:5432 ou OpenAI externo. O worker agendado executará no próprio backend. Apenas PostgreSQL é containerizado no MVP; backend/frontend usam Maven Wrapper/Vite na máquina.

### TS-003 — Arquitetura hexagonal pragmática

**Responsabilidade:** isolar regras e casos de uso dos mecanismos de transporte, persistência e provedor de IA.
**Requisitos relacionados:** RF-001 a RF-020; RNF-002, RNF-003, RNF-007; `architecture-boundaries.md`.
**Status:** confirmado pelo usuário.

O backend utilizará Hexagonal Architecture, com separação entre Domain, Application e Adapters. Ports serão utilizados apenas para dependências externas ou fronteiras relevantes, evitando abstrações sem benefício concreto.

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

Direção das dependências: `adapter -> application -> domain`, nunca inversa. Application e Domain não conhecem JPA, PostgreSQL ou SDK do provider. O adapter implementa o port de saída consumido pelo caso de uso; a chamada em tempo de execução ao adapter não implica dependência de compilação do caso de uso sobre sua implementação. Config realiza a composição das dependências.

Ports concretos de exemplo: `PatientRepositoryPort` e `ClinicalAnalysisProviderPort`. O fluxo de cadastro apresentado pelo usuário é `PatientController -> CreatePatientUseCase -> PatientRepositoryPort -> JpaPatientRepositoryAdapter -> PostgreSQL`, com acesso JPA confirmado. Para IA: `GeneratePatientAnalysisUseCase -> ClinicalAnalysisProviderPort -> OpenAiClinicalAnalysisAdapter`, com OpenAI, modelo externalizado, SDK oficial Java e Responses API confirmados em TS-014. O schema concreto ainda será discutido.

Não criar `PatientValidatorPort`, `DateFormatterPort` ou `StringNormalizerPort` sem fronteira real. Usar `java.time.Clock` injetável conforme TS-027, sem criar ClockPort próprio. Interfaces de entrada devem representar fronteiras úteis, não duplicar automaticamente cada classe.

Domínio simples, com DDD tático apenas onde ajuda: Patient, Appointment, ClinicalRecord, OriginalOpinion, Complement, ClinicalAnalysis e AnalysisGeneration. Regras importantes nas entidades ou domain services quando fizer sentido; sem aggregates complexos, eventos para tudo ou proliferação de Value Objects. Essa lista não determina herança Java nem modelo físico de tabelas.

### TS-004 — Frontend SPA

**Responsabilidade:** oferecer os fluxos do médico com componentização por responsabilidade.
**Requisitos relacionados:** RF-001 a RF-012, RF-015, RF-017, RF-019; RNF-001, RNF-004, RNF-005.
**Status:** React 19.2, TypeScript, Vite 8, CSS simples, React Router declarativo e fetch centralizado confirmados. Sem Redux, framework CSS pesado ou biblioteca de cache/estado de servidor no MVP.

Versões exatas de TypeScript, Node.js, gerenciador de pacotes e patches de React/Vite permanecem pendentes. O [Vite 8](https://v8.vite.dev/blog/announcing-vite8) informa requisitos de Node.js 20.19+ ou 22.12+; escolher e fixar uma versão compatível será uma decisão explícita. Referência da versão escolhida: [React 19.2](https://react.dev/blog/2025/10/01/react-19-2).

### TS-005 — Persistência e infraestrutura local

**Responsabilidade:** persistir dados e histórico no PostgreSQL local com evolução de schema versionada.
**Requisitos relacionados:** RF-001 a RF-011, RF-017 a RF-020; RNF-002, RNF-003, RNF-004, RNF-008.
**Status:** PostgreSQL 18.6 via Docker Compose e Flyway confirmados; sem cloud, Kubernetes ou broker externo.

A versão do banco foi verificada nas [release notes do PostgreSQL 18.6](https://www.postgresql.org/docs/release/18.6/). Flyway, driver JDBC, imagem/tag/digest e compatibilidade da combinação final ainda serão verificados e discutidos. O fato de o banco estar em Compose não define automaticamente containerização da aplicação.

## 4. Componentes

TS-001 a TS-038 registram decisões confirmadas ou propostas para aprovação. Os demais componentes e IDs TS serão detalhados após discussão. Controllers/DTOs pertencem à fronteira web; modelos de persistência e mapeamento ficam no adapter de persistência; implementação de provider fica no adapter de IA. Demarcação transacional definida em TS-023.

### TS-006 — Adapter de persistência JPA

**Responsabilidade:** implementar os ports de persistência com Spring Data JPA/Hibernate, preservando a independência do domínio e dos casos de uso.
**Requisitos relacionados:** RF-001 a RF-011, RF-017 a RF-020; RNF-003; `architecture-boundaries.md`.
**Status:** confirmado pelo usuário.

Entidades JPA, repositórios Spring Data e mapeadores manuais ficam em `adapter/out/persistence/`. Modelos de domínio são separados das entidades JPA, sem anotações de persistência. Ports recebem/retornam tipos independentes de JPA; não expõem entidades JPA ou interfaces de repositório Spring Data ao domínio/application. O mapeamento inicial será manual; não há biblioteca de mapeamento selecionada.

### TS-007 — Gerações persistentes e worker no backend

**Responsabilidade:** processar a IA fora do salvamento clínico e retomar solicitações pendentes após reinício.
**Requisitos relacionados:** RF-008, RF-010, RF-011, RF-013, RF-018, RF-019; RNF-002, RNF-003.
**Status:** fila no PostgreSQL, worker no backend, estados, reservas, prazos, reivindicação e finalização transacionais confirmados. Detalhes de implementação e configuração restantes indicados abaixo.

Ao salvar parecer ou complemento, persistir também a solicitação de geração na mesma transação do banco. Após commit, o registro clínico fica disponível e o worker pode processar a solicitação. Montagem/chamada externa de IA não participa da transação de salvamento; falha do provedor não desfaz dado clínico confirmado. A fila é durável e pendências são retomadas após restart, sem broker externo.

O corte do snapshot está definido em TS-010. Worker único no MVP, processando uma geração por vez, com polling inicial de 2 segundos. Cada execução adquire uma reserva temporária persistida, identificada por token e prazo de validade, em transação curta. A chamada à IA ocorre fora dessa transação.

Reservas expiradas podem ser recuperadas após falha/restart. O resultado só pode ser persistido se a geração ainda estiver sob a reserva válida correspondente: verificar geração, token e validade atomicamente na finalização, impedindo que execução antiga grave após perda da reserva. Não se considera uma chamada assíncrona apenas em memória suficiente para essa decisão.

Token, TTL da reserva e timeout da chamada à IA devem ser coerentes. Limites iniciais confirmados e externalizados: máximo de 120 segundos por chamada, orçamento de 180 segundos por tentativa e TTL da reserva de 240 segundos. São limites operacionais ajustáveis do MVP, não SLA nem promessa de latência do modelo.

O orçamento da tentativa abrange preparação, chamadas e validação; cada chamada respeita também o tempo restante da tentativa. Os 60 segundos entre orçamento e TTL constituem margem para finalização. Não implementar renovação automática da reserva neste MVP. Interromper trabalho ao esgotar seu orçamento; resultados após perda/expiração da reserva são descartados, mesmo que a chamada tenha começado com token válido. Toda finalização permanece condicionada à reserva válida correspondente. Nomes das propriedades e configuração concreta de cancelamento do SDK ainda serão definidos.

Estados internos confirmados:

| Estado | Significado | Estado público | Bloqueia regeneração manual |
|---|---|---|---|
| QUEUED | aguardando execução | em geração | sim |
| RUNNING | tentativa com reserva | em geração | sim |
| RETRY_WAIT | aguardando nova tentativa elegível | em geração | sim |
| COMPLETED | análise validada e persistida | concluída | não, salvo outra geração ativa |
| FAILED | processamento encerrado sem análise válida | falha | não, salvo outra geração ativa |

COMPLETED e FAILED são terminais. RETRY_WAIT não ocupa o worker: outra geração elegível pode ser processada durante a espera. Regeneração manual continua exigindo pelo menos um parecer original, além de ausência de geração ativa.

Reivindicar a geração elegível mais antiga por `requestedAt ASC, id ASC`, usando `FOR UPDATE SKIP LOCKED` em transação curta. QUEUED é imediatamente elegível; RETRY_WAIT somente após `nextAttemptAt`. Reservas expiradas podem retornar à elegibilidade enquanto houver tentativas disponíveis, conforme TS-012. A transação de reivindicação altera estado/reserva e contabiliza a tentativa atomicamente antes da chamada externa.

Na conclusão, persistir análise, evidências e estado COMPLETED em uma única transação, condicionada a RUNNING, token correspondente e reserva ainda válida. Nenhum resultado parcial pode sobreviver ao rollback dessa finalização. O mecanismo concreto de SQL/ORM deverá preservar essas condições atomicamente. Idempotência em TS-013. Não introduzir optimistic locking, broker ou coordenação distribuída no MVP.

### TS-008 — Registro clínico, original e complemento

**Responsabilidade:** representar atributos clínicos comuns e preservar as regras específicas de original/complemento sem acoplar domínio ao schema relacional.
**Requisitos relacionados:** RF-007, RF-008, RF-009, RF-013, RF-014, RF-015, RF-018, RF-020; RNF-003.
**Status:** tabela única e invariantes de associação confirmados pelo usuário.

Original e Complement são especializações do conceito de domínio Registro Clínico e compartilham os principais atributos. A representação Java pode preservar essa distinção independentemente da entidade JPA e da tabela; a forma concreta de especialização ainda será discutida, sem exigir herança ORM.

Persistir ambos em `clinical_record`, com discriminador `type = ORIGINAL | COMPLEMENT`. Para COMPLEMENT, a referência ao registro original é obrigatória, deve apontar para um ORIGINAL existente e ambos devem pertencer ao mesmo paciente. Referência a complemento ou a original de outro paciente é inválida. Integridade relacional definida em TS-021; proteção append-only em TS-009.

### TS-009 — Proteção append-only em duas camadas

**Responsabilidade:** impedir alteração ou exclusão de fontes clínicas e artefatos históricos preservados.
**Requisitos relacionados:** RF-008, RF-017, RF-019; RNF-003; `product-invariants.md`.
**Status:** confirmado pelo usuário.

O backend impede UPDATE/DELETE de registros clínicos, análises concluídas e evidências. O PostgreSQL reforça a invariância com triggers, versionadas pelas migrations Flyway. Correção clínica é novo complemento, nunca alteração do registro anterior. Nova geração não substitui conteúdo de análise anterior.

O estado operacional das gerações permanece atualizável durante o processamento. Essa mutabilidade não permite reescrever registros clínicos, análises concluídas ou evidências, nem alterar o conjunto do snapshot. Detalhes do ciclo de vida operacional e permissões do banco ainda serão discutidos.

### TS-010 — Snapshot por revisão monotônica do paciente

**Responsabilidade:** congelar a fonte clínica de cada solicitação, incluindo corretamente registros retroativos.
**Requisitos relacionados:** RF-004, RF-008, RF-010, RF-011, RF-013, RF-018, RF-020; RNF-003.
**Status:** confirmado pelo usuário.

Cada novo registro clínico recebe uma revisão sequencial monotônica do paciente. A atribuição de revisão é serializada por paciente na transação de cadastro. A geração armazena `snapshotRevision`; seu conjunto é composto exclusivamente por registros daquele paciente com revisão menor ou igual ao corte. A revisão não deriva da data clínica.

A IA considera todos os registros desse conjunto em ordem clínica por `clinicalDateTime`, depois `createdAt` e ID como desempate final. Registros retroativos recebem nova revisão quando cadastrados e entram apenas em snapshots posteriores ao cadastro. O snapshot antigo continua reconstituível porque os registros são append-only. Paginação da interface nunca restringe o conjunto enviado à IA (TS-026).

Serialização por lock da linha do paciente definida em TS-022. Constraints de unicidade de revisão/sequência e proteção dos metadados de corte ainda serão detalhadas. Não usar sequência global isoladamente como substituto da revisão por paciente aprovada.

### TS-011 — Seleção da análise atual

**Responsabilidade:** selecionar deterministicamente a análise válida que cobre o snapshot mais recente e resolver regenerações do mesmo snapshot.
**Requisitos relacionados:** RF-010, RF-011, RF-017, RF-019; RNF-003.
**Status:** confirmado pelo usuário.

A análise atual é a válida com maior `snapshotRevision`. Havendo mais de uma válida para esse corte, vence a de maior `requestSequence`, sequência de solicitação por paciente. A ordem de conclusão nunca participa dessa escolha. Toda análise concluída anterior permanece no histórico.

Gerações em andamento ou falhas não concorrem como análise válida. Se uma geração falhar, a seleção continua entre as análises válidas preservadas. Exemplo: uma geração da revisão 7 não substitui uma análise válida da revisão 8 mesmo terminando depois; duas válidas da revisão 8 são comparadas por `requestSequence`.

### TS-012 — Retry controlado das gerações

**Responsabilidade:** recuperar falhas transitórias sem repetir indefinidamente chamadas ou alterar o snapshot da geração.
**Requisitos relacionados:** RF-011, RF-018, RF-019; RNF-002, RNF-003.
**Status:** política confirmada pelo usuário; detalhes operacionais restantes explicitados abaixo.

Até 3 tentativas por geração, contando a primeira. Backoff aproximado de 5 segundos antes da segunda e 20 segundos antes da terceira, com pequena variação aleatória e respeito ao Retry-After do provedor.

Falhas transitórias elegíveis: timeout, conexão, HTTP 429 e HTTP 5xx. Credenciais/configuração inválida, contexto excedido e respostas inválidas ou inseguras encerram a geração como falha. Retry manual cria nova geração, sujeito às condições de RF-011; não reabre a geração anterior.

Retry técnico mantém o snapshot da solicitação original. Contar cada tentativa ao adquirir a reserva. Desativar retries automáticos do SDK do provider para que a fila controle o orçamento efetivo. Uma reserva expirada volta a ser elegível enquanto ainda houver tentativas; sem orçamento restante, a geração passa a FAILED. O MVP aceita que crash após reserva e antes da chamada consuma uma tentativa, privilegiando simplicidade e determinismo.

Persistir a espera em RETRY_WAIT e liberar o worker para outra geração elegível. O estado operacional é persistido sem comprometer o dado clínico ou análise válida anterior. Ainda serão definidos: faixa do jitter e tratamento de Retry-After excessivo/malformado. A política não garante cobrança externa exatamente uma vez após crash; a proteção da reserva impede persistência de resultado obsoleto.

### TS-013 — Idempotência persistida das criações

**Responsabilidade:** evitar duplicação após repetição de envio ou perda da resposta HTTP.
**Requisitos relacionados:** RF-001, RF-004, RF-007, RF-008, RF-010, RF-011; RNF-003.
**Status:** confirmado pelo usuário.

Usar `Idempotency-Key` UUID obrigatória nas cinco operações: criação de paciente, consulta, parecer original, complemento e regeneração manual. Escopo por operação e por paciente quando houver patientId. Persistir hash SHA-256 do payload validado em representação canônica, referência ao resultado e status HTTP original. Mesma chave/escopo e mesmo payload retornam o resultado original; payload diferente retorna 409.

Persistir chave e resultado/referência atomicamente com a operação. Repetir o salvamento de um registro com a mesma chave não cria outro registro nem outra geração automática. Repetir a regeneração com a mesma chave resolve a solicitação original, sem iniciar uma segunda geração.

Manter os registros de idempotência durante toda a vida do banco do MVP. A canonicalização deve ser determinística e não alterar semanticamente campos clínicos. A normalização de whitespace usada para comparar evidências não autoriza aplicar a mesma transformação ao conteúdo clínico da chave de idempotência. Não guardar conteúdo clínico redundante na auditoria de idempotência sem necessidade definida.

Ainda serão discutidos: serialização canônica exata, inclusão de identificadores da rota, relação entre campos temporais omitidos e valores padrão do servidor, resposta durante requisições concorrentes e representação do resultado original para recursos operacionais mutáveis. Extensão a mudanças de status não foi solicitada/aprovada.

### TS-014 — OpenAI com modelo externalizado

**Responsabilidade:** implementar a fronteira externa de análise sem acoplar domínio/casos de uso ao provider ou ao modelo.
**Requisitos relacionados:** RF-010, RF-012, RF-013, RF-016, RF-019; RNF-002, RNF-005, RNF-007.
**Status:** OpenAI, gpt-5.6-terra externalizado, SDK oficial Java, Responses API e Structured Outputs com JSON Schema confirmados; schema concreto, versão do SDK e parâmetros do modelo pendentes.

Configuração inicial: `OPENAI_MODEL=gpt-5.6-terra`. O adapter recebe o modelo por configuração externa, permitindo trocá-lo sem alteração de domínio ou casos de uso. Isso não dispensa verificar suporte ao contrato e qualidade antes de usar outro modelo. Não substituir o modelo escolhido automaticamente.

A [documentação oficial do gpt-5.6-terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), consultada em 2026-09-09, lista o identificador e suporte a Structured Outputs. Acesso efetivo da conta não foi testado. Nenhuma API key foi lida e nenhuma chamada de inferência foi realizada.

O SDK oficial Java fica restrito ao `OpenAiClinicalAnalysisAdapter`. Usar Responses API e Structured Outputs baseado em JSON Schema. A port da aplicação permanece independente de OpenAI e tipos do SDK. O backend valida schema, referências de evidência, isolamento do paciente e regras de segurança antes de persistir a análise; schema estruturado não dispensa validação de domínio.

Referências documentais já consultadas: [SDKs oficiais](https://developers.openai.com/api/docs/libraries) e [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). A versão Java do SDK e suas configurações concretas serão verificadas antes do bootstrap da integração, com retries desativados conforme TS-012.

Timeout/TTL seguem os limites confirmados em TS-007, sem infraestrutura extra. Usar uma chamada de geração por tentativa, sem segunda chamada de revisão semântica no MVP. Retry técnico permanece conforme TS-012. Contexto, contrato, suficiência e tratamento de limites seguem TS-016 a TS-019; auditoria em TS-020. Ainda serão discutidos limites finais do schema, parâmetros do modelo e valores/mecanismo de contagem de tokens.

### TS-015 — Validação obrigatória e rejeição integral da IA

**Responsabilidade:** impedir publicação de análise estruturalmente inválida, sem evidência válida, com isolamento violado ou conteúdo inseguro.
**Requisitos relacionados:** RF-012, RF-015, RF-016, RF-019, RF-020; RNF-003, RNF-005.
**Status:** rejeição integral, geração única e catálogo versionado conservador de segurança confirmados pelo usuário; padrões concretos do catálogo pendentes de revisão.

Mesmo com Structured Outputs, validar no backend a estrutura, referências de evidência, pertencimento ao snapshot/paciente e regras de segurança antes da persistência. Se qualquer parte relevante falhar em uma dessas validações, encerrar a geração como FAILED. Nenhuma análise parcial será publicada; a última análise válida permanece como atual, segundo TS-011.

No MVP, não implementar remoção/recomposição parcial de observações ou evidências. Esse recurso pode ser reconsiderado posteriormente; a política de rejeição integral é permitida pelo RF-019 e reduz a necessidade de reavaliar a consistência do conteúdo restante.

Adotar uma única geração com prompt restritivo, Structured Outputs e validações determinísticas de schema, fontes, evidências, isolamento e regras de segurança. Qualquer violação detectada nessas validações causa falha integral. Não implementar segunda chamada ao modelo para revisão semântica nem pipeline de múltiplos agentes clínicos neste MVP. A necessidade de revisão adicional será reavaliada após testes adversariais e validação clínica.

O catálogo inicial deve conter padrões textuais conservadores e versionados para sinalizar linguagem prescritiva, diagnóstico apresentado como conclusão própria da IA e linguagem de evolução/tendência em SUMMARY_ONLY. Qualquer sinalização reprova integralmente a geração no MVP. O catálogo exige testes de falsos positivos, incluindo citações clínicas legítimas. Regras, expressões e exceções concretas serão apresentadas para revisão antes de fechar a especificação; não se presume que esses padrões já estejam definidos ou implementados.

Limite explícito: identificar uma citação literal existente demonstra origem, não que ela sustenta semanticamente a conclusão. Validação estrutural, correspondência de trechos e regras determinísticas não provam ausência de toda alucinação ou recomendação indevida. O catálogo concreto de regras, testes de falsos positivos/negativos e evidências de validação clínica ainda precisam ser definidos. Esse risco não relaxa RF-016/RNF-005 nem permite aprovar saída sabidamente insegura; falhas identificadas nos gates exigem correção antes da aprovação do MVP.

### TS-016 — Contexto mínimo com identificadores temporários

**Responsabilidade:** construir a entrada de IA exclusivamente a partir dos registros do snapshot, com minimização de dados e isolamento por paciente.
**Requisitos relacionados:** RF-004, RF-008, RF-013, RF-020; RNF-007; `clinical-data-privacy.md`.
**Status:** campos enviados e exclusões confirmados pelo usuário.

Enviar somente: identificador temporário do registro, tipo ORIGINAL/COMPLEMENT, referência temporária ao original quando aplicável, clinicalDateTime, texto, humor e medicações. Todos os registros devem pertencer ao paciente e ao corte snapshotRevision, em ordem clínica. O backend mantém o mapeamento entre identificadores temporários e registros reais, utilizado para validar e resolver evidências.

Não enviar nome, CPF, nascimento, telefone, e-mail, queixa inicial cadastral, observações de consulta ou IDs internos. Análises anteriores não entram no contexto. Identificadores temporários não podem servir para resolver registros fora do snapshot. Formato, escopo de unicidade e forma de reconstruir/persistir o mapeamento serão detalhados com o usuário.

A exclusão de campos cadastrais é minimização estrutural, não anonimização garantida de texto livre: o conteúdo clínico pode conter identificadores digitados. A restrição de uso exclusivo de dados fictícios continua válida.

### TS-017 — Estrutura da análise e evidências literais

**Responsabilidade:** organizar a análise e permitir rastreabilidade das observações aos registros do snapshot.
**Requisitos relacionados:** RF-012, RF-014, RF-015, RF-018, RF-020; RNF-003, RNF-005.
**Status:** quatro áreas, campos das observações/evidências, cardinalidade mínima e política de comparação confirmados pelo usuário.

O contrato possui `timeline`, `patterns`, `attentionPoints` e `limitations`. Cada item de timeline/patterns/attentionPoints tem `{text, nature, evidence[]}`, com `nature = REPORTED | INTERPRETATION`. Cada evidência tem `{recordAlias, field, quote}`, com `field` restrito a `text`, `mood` ou `medications`. Cada item dessas três listas exige pelo menos uma evidência válida. `limitations` permanece como lista de textos.

Antes de persistir a análise, o backend verifica que o identificador resolve um registro do snapshot/paciente, que o campo é permitido e que o trecho existe efetivamente nesse campo da fonte. A comparação pode normalizar quebras de linha e whitespace em fonte e citação para evitar diferenças irrelevantes de representação, preservando acentos e conteúdo textual. Não usar fuzzy matching, equivalência semântica, remoção de acentos ou reescrita do conteúdo. A normalização é apenas de comparação; não modifica o registro clínico append-only.

Falha em qualquer parte relevante provoca rejeição integral conforme TS-015. A aplicação não deve aceitar referência de outro paciente, registro posterior ao corte, campo ausente ou trecho inventado.

Se uma seção estiver vazia, a interface apresenta mensagem fixa apropriada sem gerar conteúdo clínico adicional. Ainda serão discutidos: limites máximos/cardinalidades restantes, algoritmo exato de whitespace e textos das mensagens fixas. A auditoria e as contagens de fonte são responsabilidade do backend, não fatos confiados ao modelo. Suficiência definida em TS-018 e auditoria em TS-020.

### TS-018 — Modos de análise por quantidade de originais

**Responsabilidade:** respeitar suficiência longitudinal sem contar complementos como novos pontos independentes.
**Requisitos relacionados:** RF-012, RF-014, RF-016; RNF-005.
**Status:** confirmado pelo usuário.

O backend calcula o modo a partir da quantidade de pareceres originais do snapshot. Com zero originais, não gerar análise. Com exatamente um, usar `SUMMARY_ONLY`: patterns deve estar vazio, timeline e pontos de atenção sustentados por evidências podem ser apresentados, e limitations deve informar explicitamente ausência de histórico suficiente para avaliar evolução ou tendência. Não permitir afirmação de tendência nesse modo.

Com dois ou mais originais, usar `LONGITUDINAL`. Complementos entram integralmente no snapshot e podem ser evidências, mas não incrementam a contagem de originais. O modelo não determina a contagem ou redefine a suficiência. Em SUMMARY_ONLY, o backend acrescenta obrigatoriamente uma limitação fixa sobre insuficiência de histórico longitudinal, sem depender de o modelo produzi-la. O texto exato será discutido junto às mensagens de UX. Inserir esse aviso não torna válida uma resposta com tendência indevida ou outro conteúdo reprovado.

### TS-019 — Histórico integral e limites de contexto/saída

**Responsabilidade:** impedir que uma análise de cobertura parcial seja apresentada como análise do snapshot completo.
**Requisitos relacionados:** RF-013, RF-018, RF-019; RNF-002, RNF-003, RNF-008.
**Status:** comportamento de falha e limites configuráveis confirmados pelo usuário; valores e contagem concreta pendentes.

Se o snapshot completo ultrapassar a capacidade de entrada do modelo, ou a resposta for truncada/exceder o limite de saída, encerrar a geração como FAILED com motivo específico. Preservar prontuário e última análise válida. Esses casos não recebem retry técnico automático, conforme TS-012.

No MVP, não truncar histórico, resumir silenciosamente, dividir em múltiplas chamadas ou selecionar apenas parte dos registros para caber. Limites configuráveis devem considerar prompt, snapshot e reserva necessária para a saída. A contagem e a checagem dos limites não podem limitar indevidamente o salvamento clínico; pertencem ao processamento derivado de IA.

Ainda serão definidos: valores de entrada/saída, mecanismo de contagem, margem operacional, tratamento dos metadados de término da Responses API e códigos de falha. Nenhum limite rígido de quantidade de registros substitui a avaliação do volume textual/tokens.

### TS-020 — Auditoria técnica mínima das gerações

**Responsabilidade:** permitir reconstrução do processamento e diagnóstico de falhas sem persistir conteúdo sensível desnecessário.
**Requisitos relacionados:** RF-018, RF-019; RNF-003, RNF-006, RNF-007.
**Status:** metadados confirmados pelo usuário; tipos físicos e política de logs ainda serão definidos.

Por geração, persistir modelo solicitado e retornado quando disponível, versões de prompt/schema/regras, modo, snapshotRevision, requestSequence, contagens e último registro considerado. Contagens e último registro são calculados a partir do snapshot pelo backend, conforme critérios do PRD, nunca confiados à IA.

Por tentativa, persistir horários, duração, código de resultado, request ID do provider e uso de tokens quando disponível. Não inventar valores ausentes em falhas de conexão ou crash. Como representar retornos de modelo divergentes entre tentativas e congelar a configuração da geração ainda será detalhado.

Em falhas, guardar apenas código/categoria/caminho necessário ao diagnóstico. Não persistir resposta clínica rejeitada completa, cópia do prontuário, secrets ou outros dados sensíveis desnecessários em artefatos de diagnóstico. Esses metadados não autorizam logging de bodies de requisição/resposta. Registros clínicos de origem e análises válidas continuam nas respectivas entidades, conforme o PRD e append-only.

### TS-021 — Integridade relacional por paciente

**Responsabilidade:** reforçar no PostgreSQL as associações válidas entre dados clínicos e artefatos do mesmo paciente.
**Requisitos relacionados:** RF-004, RF-007, RF-008, RF-015, RF-017, RF-020; RNF-003.
**Status:** confirmado pelo usuário.

Para complementos, utilizar vínculo que garanta o mesmo `patient_id`: FK composta de `(patient_id, original_id)` para `(patient_id, id)` em `clinical_record`, com chave única de suporte. CHECK exige `original_id` preenchido para COMPLEMENT e ausente para ORIGINAL. Validar também que o alvo é ORIGINAL, reforçando essa condição com trigger, conforme proposta aprovada. O conjunto dessas proteções não permite complemento de complemento ou referência cruzada de paciente.

Aplicar invariantes equivalentes entre registro/consulta e análise/geração quando necessário, incluindo o paciente na integridade do vínculo. Exclusões devem ser restritivas, sem cascatas destrutivas. As constraints não substituem a validação de negócio no backend nem as triggers append-only. Detalhamento completo das chaves e do vínculo das evidências ao snapshot ainda será apresentado no modelo físico.

### TS-022 — Serialização transacional por paciente

**Responsabilidade:** atribuir revisões/sequências e verificar/criar gerações sem corridas entre operações do mesmo paciente.
**Requisitos relacionados:** RF-007, RF-008, RF-010, RF-011, RF-013, RF-020; RNF-002, RNF-003.
**Status:** confirmado pelo usuário.

Utilizar `SELECT FOR UPDATE` na linha do paciente, em transações curtas, para operações que atribuem `clinicalRevision` ou `requestSequence` e para verificar/criar gerações concorrentes. Atualizar os contadores e criar registro/geração aplicáveis dentro da mesma transação e sob o mesmo lock.

O lock é por paciente e permite paralelismo entre pacientes diferentes. O limite de uma geração processada por vez continua pertencendo ao worker, não a todas as requisições HTTP. Chamadas à IA nunca ocorrem dentro dessa transação. A regeneração manual verifica ausência de QUEUED/RUNNING/RETRY_WAIT sob o lock antes de criar a solicitação; a criação automática por novo registro continua permitida mesmo com geração ativa.

Não sofisticar com optimistic locking ou coordenação distribuída no MVP. Demarcação transacional em TS-023. Ordem global de aquisição de locks e política de falha de lock ainda serão explicitadas para evitar deadlocks e transações longas.

### TS-023 — Fronteira de execução transacional

**Responsabilidade:** permitir que casos de uso delimitem atomicidade sem depender da API transacional do Spring.
**Requisitos relacionados:** RF-007, RF-008, RF-010, RF-011, RF-017, RF-019; RNF-002, RNF-003; `architecture-boundaries.md`.
**Status:** confirmado pelo usuário.

Adotar um único `TransactionRunnerPort` em `application/port/out`, implementado no adapter de persistência com `TransactionTemplate`. Casos de uso utilizam a port somente nos blocos que realmente precisam ser atômicos. Não criar um wrapper transacional para cada classe. Os tipos da port não expõem TransactionTemplate ou outros tipos Spring.

Nenhuma chamada externa de IA permanece dentro da transação. A geração é orquestrada em etapas separadas: reivindicação transacional, processamento externo sem transação e finalização transacional protegida. Cadastro clínico inclui registro/solicitação/idempotência na mesma transação, conforme decisões anteriores. Assinatura concreta, política de rollback, isolamento e timeouts de banco ainda serão detalhados.

### TS-024 — Fronteira HTTP e documentação de contratos

**Responsabilidade:** expor casos de uso por contratos HTTP independentes do modelo de domínio.
**Requisitos relacionados:** RF-001 a RF-011, RF-015, RF-017 a RF-020; RNF-001, RNF-002.
**Status:** confirmado pelo usuário.

API REST/JSON versionada sob `/api/v1`. Controllers e DTOs ficam no adapter web e são separados do domínio. Validação estrutural/de entrada ocorre nessa fronteira; regras de negócio permanecem em application/domain. Documentar os contratos com OpenAPI.

Criações retornam 201; solicitações assíncronas de regeneração retornam 202; alterações síncronas de estado retornam 200. Salvar parecer/complemento retorna sucesso da criação clínica após commit, sem aguardar IA. Paginação definida em TS-026. Rotas detalhadas, envelopes de sucesso e ferramenta/versão para OpenAPI ainda serão discutidos.

### TS-025 — Erros HTTP seguros e estado assíncrono

**Responsabilidade:** fornecer erros consistentes sem expor dados clínicos e distinguir falha de requisição de falha posterior da IA.
**Requisitos relacionados:** RF-001, RF-004, RF-006 a RF-008, RF-011, RF-019, RF-020; RNF-001, RNF-002, RNF-006.
**Status:** confirmado pelo usuário.

Padronizar respostas com Problem Details, incluindo `code`, `fieldErrors` quando aplicável e `requestId`. Não ecoar dados clínicos ou sensíveis, valores rejeitados, segredos ou mensagens brutas de provider/banco. DTOs de erro pertencem à fronteira HTTP; exceções de domínio não dependem de tipos HTTP.

| HTTP | Categoria |
|---|---|
| 400 | entrada inválida |
| 404 | recurso inexistente no contexto consultado |
| 409 | conflito de negócio ou idempotência |
| 503 | indisponibilidade técnica temporária |

Falhas de IA após uma solicitação aceita são representadas pelo estado da geração, nunca por erro HTTP retroativo. A resposta da consulta de status pode ser bem-sucedida mesmo quando a geração retornada está FAILED. Códigos específicos de negócio, formato de fieldErrors e tratamento de erros inesperados ainda serão definidos.

### TS-026 — Paginação e ordenação estável

**Responsabilidade:** limitar carregamento das listas na interface sem alterar cobertura do snapshot da IA.
**Requisitos relacionados:** RF-002, RF-005, RF-009, RF-013, RF-017; RNF-001, RNF-008.
**Status:** confirmado pelo usuário.

Usar `page/size`, com página inicial 0, tamanho padrão 25 e máximo 100. Todas as listas possuem ordenação estável e desempate por ID. A timeline preserva `clinicalDateTime` e `createdAt` como critérios principais, mais recentes primeiro conforme PRD, e ID como desempate final. Direções e critérios das outras listas, envelope de paginação e rejeição de parâmetros fora do intervalo serão detalhados.

A montagem do snapshot para IA considera todos os registros do paciente até snapshotRevision, independentemente da paginação usada pela interface. Ordem estável não significa congelamento de resultados entre requisições de páginas: a estratégia aprovada ainda pode refletir inserções concorrentes na UI; o snapshot clínico da geração permanece imutável por revisão.

### TS-027 — Datas, horários e relógio testável

**Responsabilidade:** preservar distinção entre data clínica e criação real, com representação temporal consistente e testável.
**Requisitos relacionados:** RF-001, RF-004, RF-007, RF-008, RF-009, RF-018; RNF-003.
**Status:** confirmado pelo usuário.

Persistir instantes com PostgreSQL `timestamptz`, representados por `Instant` no backend. API recebe ISO 8601 com offset e responde em UTC. Interface exibe em `America/Sao_Paulo`. Nascimento usa `LocalDate`/`DATE`, sem tratá-lo como instante.

`createdAt` é gerado exclusivamente pelo servidor; `clinicalDateTime` permanece separado e segue os comportamentos do PRD. Injetar `java.time.Clock` para testes de regras temporais, sem abstração própria de clock. Precisão temporal, defaults de campos omitidos e política para data clínica futura serão discutidos no contrato de validação.

### TS-028 — Validação e normalização cadastral

**Responsabilidade:** cadastrar pacientes com dados obrigatórios válidos e normalização explícita.
**Requisitos relacionados:** RF-001, RF-003; RNF-001.
**Status:** confirmado pelo usuário.

Nome obrigatório após trim. CPF aceita entrada com ou sem máscara, é normalizado para 11 dígitos e validado pelos dígitos verificadores; rejeitar sequências repetidas. Garantir unicidade do CPF normalizado no banco, inclusive em cadastros concorrentes. A validação não consulta cadastro externo nem comprova titularidade.

E-mail recebe trim e validação básica de formato, sem verificar existência/entrega. Não foi definida transformação adicional de caixa do e-mail. Nascimento não pode estar no futuro, considerando a data corrente em America/Sao_Paulo com Clock injetável. Campos opcionais vazios são persistidos como null; isso não autoriza alterar o conteúdo de campos clínicos preenchidos.

No MVP, suportar somente telefones brasileiros: DDD obrigatório, 10 ou 11 dígitos nacionais, separadores comuns de máscara permitidos e normalização para formato +55. Validação apenas estrutural, sem comprovar existência de linha/titularidade. Suporte genérico a números internacionais não faz parte desta decisão. A lista exata de separadores e a aceitação de entrada já prefixada por +55 ainda serão explicitadas no contrato final.

Campos obrigatórios continuam os definidos no PRD: nome, CPF, nascimento, telefone e e-mail; queixa inicial opcional. Mensagens de erro de campo não ecoam CPF/telefone ou outros valores sensíveis. As regras de formato do adapter web e as invariantes do cadastro devem continuar coerentes com TS-024.

### TS-029 — Busca por nome normalizado

**Responsabilidade:** localizar pacientes por parte do nome com resultados previsíveis e paginados.
**Requisitos relacionados:** RF-002, RF-003; RNF-001, RNF-008.
**Status:** confirmado pelo usuário.

Buscar por substring sem distinção de maiúsculas/minúsculas ou acentos. Preservar o nome original para exibição e manter representação normalizada para busca, conforme proposta de coluna search_name aprovada. Normalizar o termo de consulta de forma compatível com essa representação.

Escapar curingas e parametrizar a consulta, de modo que caracteres de entrada não sejam interpretados como comandos ou curingas escolhidos implicitamente pelo usuário. Ordenar por nome normalizado e ID para estabilidade. Busca vazia retorna pacientes paginados conforme TS-026. Algoritmo Unicode concreto, limites de termo e índices serão detalhados junto ao schema/contrato final.

### TS-030 — Organização da SPA, navegação e cliente HTTP

**Responsabilidade:** organizar capacidades do frontend e centralizar comunicação com a API sem abstrações ou bibliotecas de estado desnecessárias.
**Requisitos relacionados:** RF-001 a RF-012, RF-015, RF-017, RF-019; RNF-001.
**Status:** confirmado pelo usuário.

SPA em `apps/frontend/`. `src/app/` concentra bootstrap, rotas e configuração global; `src/features/` agrupa `patients`, `appointments`, `clinical-records` e `analyses`; `src/shared/` contém somente componentes, tipos e utilitários realmente compartilhados entre features. Infraestrutura do PostgreSQL local em `infra/compose.yaml`.

Usar React Router em modo declarativo. Acesso à API via fetch nativo, por cliente HTTP centralizado que trata Problem Details, headers comuns e Idempotency-Key. Hooks simples por funcionalidade; estado local nos componentes quando possível. Não adicionar biblioteca de cache/estado de servidor no MVP. O cliente não pode gerar uma nova chave de idempotência inadvertidamente ao repetir a mesma operação após falha de transporte.

Rotas visuais, detalhes de formulários, timeouts HTTP, tratamento de cancelamento e versões das dependências complementares ainda serão detalhados.

### TS-031 — Atualização de análises no frontend

**Responsabilidade:** apresentar o progresso assíncrono e resultados sem misturar pacientes ou interferir na edição clínica.
**Requisitos relacionados:** RF-010, RF-011, RF-017, RF-019, RF-020; RNF-001, RNF-002.
**Status:** confirmado pelo usuário.

Polling a cada 3 segundos enquanto houver geração ativa e a aba estiver visível. Atualizar imediatamente ao retornar à aba e após ações que possam iniciar nova geração. Evitar requisições sobrepostas e descartar respostas associadas a paciente que não esteja mais aberto. A proteção deve valer também ao navegar enquanto uma requisição está pendente.

Durante geração ou falha, manter a última análise válida visível. Atualizações assíncronas não sobrescrevem conteúdo dos formulários clínicos em edição. A disponibilidade da regeneração manual segue os estados e critérios do backend, conforme TS-007/RF-011. Cancelamento concreto, comportamento diante de falha no polling e mensagens visuais ainda serão detalhados.

### TS-032 — Execução local e proxy de desenvolvimento

**Responsabilidade:** definir o ambiente local reproduzível do MVP.
**Requisitos relacionados:** RNF-001, RNF-004, RNF-008.
**Status:** confirmado pelo usuário.

PostgreSQL executa via `infra/compose.yaml`, com volume persistente. Backend executa diretamente pela máquina com Maven Wrapper em `127.0.0.1:8080`; frontend executa pelo Vite em `127.0.0.1:5173`; PostgreSQL publica `127.0.0.1:5432`. O Vite encaminha `/api` para o backend durante desenvolvimento local, evitando CORS de desenvolvimento e mantendo a URL relativa da SPA.

Não containerizar backend/frontend no MVP. Não usar cloud, Kubernetes ou broker externo. A imagem/tag/digest do PostgreSQL, nome do volume, healthcheck do Compose e comandos de inicialização serão definidos na task de infra sem alterar estes limites.

### TS-033 — Acesso local sem autenticação

**Responsabilidade:** restringir o protótipo de validação ao uso local controlado.
**Requisitos relacionados:** RNF-004; restrições de compliance do PRD; `clinical-data-privacy.md`.
**Status:** confirmado pelo usuário.

Não implementar autenticação ou autorização no MVP. Restringir backend e banco a loopback e manter o banner persistente de dados fictícios. Não habilitar CORS amplo; o acesso esperado ocorre pelo proxy Vite local. Publicação ou acesso remoto futuro exige decisão explícita sobre autenticação, autorização, criptografia, hospedagem e demais controles, antes de qualquer uso com dados reais.

Esta ausência de login não é uma permissão para dados reais. O README deve declarar o limite e o Compose não deve publicar o banco em interfaces externas por padrão.

### TS-034 — Configuração e secrets fora do repositório

**Responsabilidade:** fornecer configuração operacional sem expor credenciais no frontend ou no Git.
**Requisitos relacionados:** RNF-004, RNF-006, RNF-007; `clinical-data-privacy.md`.
**Status:** confirmado pelo usuário.

Backend lê variáveis de ambiente para credenciais do PostgreSQL, `OPENAI_API_KEY`, `OPENAI_MODEL` e parâmetros operacionais (worker, timeout, orçamento, TTL, retry, limites e URLs locais). Versionar somente `.env.example` com placeholders. Arquivos locais com valores reais ficam fora do Git por regra do `.gitignore` e são carregados explicitamente pelos scripts locais.

Frontend recebe apenas configuração pública, como base URL relativa e porta de desenvolvimento; nunca recebe `OPENAI_API_KEY`, credenciais do banco ou secrets de infraestrutura. Não embutir secrets em bundle, logs, Problem Details, fixtures, testes ou documentação. A forma de carregar `.env` local no backend/Compose e nomes finais das variáveis serão definidos na task de infra.

Versões-base mantidas nesta TechSpec: Java 21 LTS, Spring Boot 3.5.16, React 19.2, Vite 8 e PostgreSQL 18.6. Maven, Node.js, TypeScript, Flyway, driver JDBC PostgreSQL e SDK OpenAI Java devem ser versões estáveis e compatíveis, sem snapshot, beta ou release candidate; serão selecionadas no bootstrap e registradas nos arquivos do projeto. Node.js deve ser uma versão LTS. A TechSpec não fixa esses complementos antes da verificação de compatibilidade.

### TS-035 — Observabilidade local segura

**Responsabilidade:** oferecer diagnóstico operacional sem expor dados clínicos.
**Requisitos relacionados:** RF-018, RF-019; RNF-003, RNF-006, RNF-008.
**Status:** confirmado pelo usuário.

Usar SLF4J/Logback para logs estruturados com allowlist de requestId, geração, estado, tentativa, duração, códigos e contagens. Não registrar prontuário, conteúdo clínico completo, CPF completo, secrets, bodies HTTP ou resposta integral da IA. Spring Boot Actuator expõe apenas health/readiness local. Não integrar plataforma externa no MVP.

### TS-036 — Testes e CI por área

**Responsabilidade:** validar domínio, PostgreSQL, frontend e jornadas integradas.
**Requisitos relacionados:** todos os RF/RNF aplicáveis; `testing-quality.md`.
**Status:** confirmado pelo usuário.

Backend usa JUnit 5, Spring Boot Test, Mockito e Testcontainers PostgreSQL, cobrindo migrations, constraints, triggers, locks, SKIP LOCKED e idempotência. Frontend usa Vitest e Testing Library. Playwright cobre os principais fluxos E2E.

CI terá jobs independentes para backend e frontend, mais um job integrado E2E. Não haverá job de infra separado apenas para Compose; o Compose será validado no fluxo integrado. Tasks devem permanecer pequenas e coesas, conforme a sequência definida, sem guarda-chuvas extensos.

### TS-037 — Schema físico PostgreSQL do MVP

**Responsabilidade:** definir as tabelas e invariantes necessárias para implementação Flyway.
**Requisitos relacionados:** RF-001 a RF-020; RNF-002, RNF-003, RNF-006, RNF-007.
**Status:** detalhado conforme solicitação; migrations ficam nas tasks.

Todas as tabelas usam `id uuid primary key` gerado pela aplicação, `created_at timestamptz not null` quando aplicável e FKs com `ON DELETE RESTRICT`/sem cascatas destrutivas.

| Tabela | Campos relevantes e constraints |
|---|---|
| `patient` | `id`, `name`, `search_name`, `cpf` UNIQUE, `birth_date date`, `phone`, `email`, `initial_complaint null`, `clinical_revision bigint not null default 0`, `request_sequence bigint not null default 0`, `created_at` |
| `appointment` | `id`, `patient_id`, `scheduled_at timestamptz`, `status` CHECK em AGENDADA/REALIZADA/CANCELADA/FALTA, `notes null`, `created_at`, `status_changed_at null`; FK paciente |
| `clinical_record` | `id`, `patient_id`, `type` CHECK ORIGINAL/COMPLEMENT, `original_id null`, `appointment_id null`, `clinical_datetime timestamptz`, `created_at`, `text`, `mood null`, `medications null`, `revision bigint`; `UNIQUE(patient_id, revision)` |
| `analysis_generation` | `id`, `patient_id`, `trigger` AUTO/MANUAL, `trigger_record_id null`, `snapshot_revision`, `request_sequence`, `requested_at`, `state` QUEUED/RUNNING/RETRY_WAIT/COMPLETED/FAILED, contagens do snapshot, `last_clinical_record_id null`, `attempt_count`, `next_attempt_at null`, `lease_token null`, `lease_expires_at null`, `completed_at null`, `failure_code null`, versões/modelo/mode; UNIQUE `(patient_id, request_sequence)` e UNIQUE de trigger automático por registro |
| `analysis_attempt` | `id`, `generation_id`, `attempt_number`, `started_at`, `finished_at null`, `outcome`, `error_code null`, `duration_ms null`, tokens/request id null; UNIQUE geração/tentativa |
| `clinical_analysis` | `id`, `generation_id UNIQUE`, `patient_id`, `generated_at`, `mode`, `validated_payload jsonb`, `safety_rules_version`; FK geração/paciente |
| `analysis_evidence` | `id`, `analysis_id`, `patient_id`, `section`, `item_index`, `record_id`, `field`, `quote`, `created_at`; FKs e trigger que exige mesmo paciente e registro no snapshot |
| `idempotency_record` | `id`, `scope_operation`, `patient_id null`, `key uuid`, `payload_hash bytea`, `resource_type`, `resource_id`, `original_status smallint`, `created_at`; UNIQUE `(scope_operation, patient_id, key)` com tratamento explícito de escopo global quando patient_id null |
| `worker_heartbeat` | `worker_id`, `last_seen_at`, `state`; sem conteúdo clínico |

Índices: `patient(search_name,id)`; `appointment(patient_id,scheduled_at,id)` e `appointment(scheduled_at,id)`; `clinical_record(patient_id,clinical_datetime,created_at,id)` e `(patient_id,revision)`; `analysis_generation(state,next_attempt_at,requested_at,id)`, `(patient_id,state)` e `(patient_id,snapshot_revision,request_sequence)`; evidências por `analysis_id` e `record_id`.

Invariantes: CHECK de tipo/original_id; FK composta `(patient_id, original_id)` para `(patient_id,id)`; trigger exige alvo ORIGINAL. Vínculo consulta/registro e geração/análise inclui patient_id. Trigger BEFORE UPDATE/DELETE rejeita `clinical_record`, `clinical_analysis`, `analysis_evidence` e demais tabelas históricas; permite somente mudanças operacionais de `analysis_generation` e fechamento de `analysis_attempt` nos campos previstos. Trigger de evidência verifica `record.revision <= generation.snapshot_revision`. `analysis_generation` guarda metadados calculados pelo backend; payload validado é inserido uma vez e nunca atualizado.

Serialização de revisão/requestSequence usa SELECT FOR UPDATE na linha do paciente. Reivindicação usa SELECT FOR UPDATE SKIP LOCKED na geração elegível mais antiga. Finalização exige estado RUNNING, token e lease válidos e grava análise/evidências/COMPLETED atomicamente. Flyway deve criar constraints/triggers em ordem que permita carga e restauração consistentes.

### TS-038 — API, UX funcional e decomposição de tasks

**Responsabilidade:** transformar os requisitos em contratos e unidades de implementação revisáveis.
**Requisitos relacionados:** RF-001 a RF-020; RNF-001 a RNF-008.
**Status:** proposta concreta para aprovação; ajustes de rotas/textos ainda possíveis.

Rotas REST propostas sob `/api/v1`:

| Método/rota | Resultado |
|---|---|
| `POST /patients` | cria paciente, 201; Idempotency-Key |
| `GET /patients?q&page&size` | busca/lista paginada |
| `GET /patients/{id}` | dados cadastrais |
| `POST /patients/{id}/appointments` | cria consulta AGENDADA, 201; Idempotency-Key |
| `GET /appointments?from&to&patientId&page&size` | agenda por intervalo |
| `POST /appointments/{id}/status` | transição final, 200 |
| `GET /patients/{id}/clinical-records?page&size` | timeline descendente |
| `POST /patients/{id}/clinical-records` | parecer original, 201; Idempotency-Key; retorna generationId |
| `POST /patients/{id}/clinical-records/{originalId}/complements` | complemento, 201; Idempotency-Key |
| `GET /patients/{id}/clinical-records/{recordId}` | fonte/evidência |
| `POST /patients/{id}/analysis-generations` | regeneração manual, 202; Idempotency-Key |
| `GET /patients/{id}/analysis-state` | análise atual, geração ativa e permissões |
| `GET /patients/{id}/analysis-generations?page&size` | histórico de gerações |
| `GET /patients/{id}/analyses/{analysisId}` | análise histórica |
| `GET /health/readiness` | health local sem IA |

DTOs de entrada/saída não expõem entidades JPA. `PatientCreateRequest` contém name/cpf/birthDate/phone/email/initialComplaint; `ClinicalRecordCreateRequest` contém text/mood/medications/clinicalDateTime/appointmentId; complemento recebe originalId na rota e não aceita paciente divergente. `AnalysisStateResponse` contém currentAnalysis, latestGeneration, activeGeneration, canRegenerate, reason e cobertura. Todas as respostas de data seguem TS-027. Erros usam Problem Details com `code`, `fieldErrors` e `requestId`.

UX funcional: banner persistente de dados fictícios; busca/cadastro; agenda; prontuário com dados, timeline, análise atual/histórico; formulários de parecer/complemento; evidências clicáveis para fonte; estados vazios fixos; estados IA em geração/concluída/falha; limitação de SUMMARY_ONLY inserida pelo backend. O frontend aplica polling TS-031 e mantém análise anterior/formulários em edição.

Dependências iniciais das tasks, sem task guarda-chuva: `infra-bootstrap` -> `backend-bootstrap` e `frontend-bootstrap`; ambos habilitam `backend-patient-appointment` e `frontend-patient-appointment`; `backend-clinical-records` depende de backend-bootstrap e infra-bootstrap; `backend-analysis-worker` depende de clinical-records e infra-bootstrap; `backend-api-integration` depende de patient-appointment, clinical-records e analysis-worker; `frontend-clinical-analysis` depende de frontend-bootstrap e backend-api-integration (pode iniciar mocks antes, mas integração depende da API); `qa-integration` depende de todos os fluxos e valida Compose/Testcontainers/Playwright. Cada task deve listar RF/AC, arquivos e checks próprios.

## 5. Interfaces e contratos

Confirmados: idempotência (TS-013), REST/JSON/OpenAPI (TS-024), Problem Details (TS-025), page/size (TS-026), datas/fuso/Clock (TS-027), cliente fetch/polling (TS-030/TS-031), execução/proxy (TS-032), acesso local sem autenticação (TS-033), secrets (TS-034) e rotas/DTOs/UX funcionais propostas em TS-038. Permanecem apenas ajustes de implementação e textos sujeitos à revisão das tasks.

Invariantes já exigidos: createdAt automático e imutável; clinicalDateTime distinto; vínculos pertencentes ao mesmo paciente; saída de IA validada antes de apresentação.

## 6. Modelo de dados e persistência

Confirmados: PostgreSQL/Flyway/JPA com entidades separadas (TS-006), append-only (TS-009), snapshot por revisão (TS-010), constraints relacionais (TS-021), locks por paciente (TS-022) e schema físico detalhado em TS-037. A versão/configuração de Flyway e SQL das migrations ficam nas tasks.

Entidades conceituais do PRD: paciente, consulta, parecer original, complemento, geração, análise e evidência. O schema necessário está detalhado em TS-037; migrations completas não fazem parte desta TechSpec.

## 7. APIs / entradas e saídas

Base confirmada: `/api/v1`, REST/JSON, OpenAPI e códigos de sucesso/erro em TS-024/TS-025. Rotas, DTOs e fluxos funcionais propostos em TS-038. Ajustes de nomenclatura ou envelope devem preservar os invariantes e ser registrados antes das tasks.

## 8. Integrações externas

Confirmados: OpenAI atrás de `ClinicalAnalysisProviderPort`, `OPENAI_MODEL=gpt-5.6-terra`, SDK oficial Java, Responses API, Structured Outputs, retries SDK desativados e geração única sem revisão por segunda chamada (TS-012/TS-014/TS-015). Contexto mínimo e evidências seguem TS-016/TS-017; detalhes finais do schema e parâmetros restantes permanecem pendentes. Nenhuma chamada paga ou teste real foi realizado.

São obrigatórios: isolamento por paciente, envio mínimo de dados, fonte exclusivamente nos registros do snapshot e nenhuma análise anterior como fonte clínica. RAG, embeddings, banco vetorial e resumo incremental como fonte principal estão fora de escopo.

## 9. Tratamento de erros e resiliência

Confirmados: fila PostgreSQL, worker único/polling 2s, SKIP LOCKED por requestedAt/id, reserva, recuperação, finalização atômica condicionada e prazos 120s/180s/240s (TS-007); retry (TS-012); idempotência (TS-013); rejeição integral (TS-015); lock por paciente (TS-022). Pendentes: SQL final, detalhes operacionais enumerados nesses componentes e comportamento de falha de persistência.

Invariantes: falha de IA não desfaz dado clínico salvo; análises anteriores permanecem; geração antiga não substitui análise baseada em snapshot mais recente. Regeneração manual exige original e ausência de geração em andamento; novos registros devem disparar geração automática mesmo havendo outra em andamento.

## 10. Segurança, privacidade e compliance

Uso exclusivamente com dados fictícios e aviso persistente são requisitos aprovados. Logs não podem expor conteúdo clínico ou secrets. Ambiente local em loopback sem autenticação está confirmado para o MVP; não habilitar CORS amplo. A IA externa não altera a restrição a dados fictícios. Publicação/acesso remoto exigirá nova decisão explícita. Nenhum ambiente está autorizado para dados reais.

## 11. Observabilidade

Auditoria por geração/tentativa confirmada em TS-020, incluindo uso de tokens quando disponível. Execução local e secrets seguem TS-032/TS-034. Logs estruturados usam SLF4J/Logback e allowlist de identificadores/metadados operacionais, sem prontuário, conteúdo clínico completo, CPF completo ou secrets. Spring Boot Actuator expõe somente health/readiness local no MVP. Não integrar plataforma externa de observabilidade. Métricas ficam limitadas a metadados agregados necessários à validação do RNF-008; detalhes de nomes e retenção ainda serão definidos.

## 12. Estratégia de testes

TS-030/TS-031: verificar tratamento centralizado de Problem Details/headers/idempotência, chave preservada na repetição e hooks sem mistura de contexto. Usar timers controlados para polling de 3s, pausa com aba oculta, consulta imediata ao retornar/após criação, ausência de sobreposição e descarte de resposta atrasada de outro paciente. Comprovar que atualização/falha mantém análise válida anterior e não sobrescreve formulário clínico em edição.

TS-028/TS-029: validar nome vazio após trim, CPF com/sem máscara, verificadores inválidos, sequência repetida e colisão concorrente no CPF normalizado; e-mail estruturalmente inválido e opcionais vazios como null; nascimento futuro/próximo da virada de dia no fuso definido. Cobrir telefone brasileiro com DDD, tamanhos inválidos e máscara; busca parcial, caixa/acentos, curingas literais, homônimos/ordenação e busca vazia paginada.

TS-013/TS-026/TS-027: testar UUID obrigatório, isolamento do escopo de idempotência por operação/paciente, hash canônico determinístico sem reescrita clínica e preservação do status/resultado original. Validar page/size padrão/máximo, desempates completos, leitura integral do snapshot apesar da paginação, equivalência de instantes recebidos com offsets diferentes, saída UTC, exibição no fuso escolhido, nascimento sem deslocamento e createdAt controlado pelo servidor com Clock fixo.

TS-023 a TS-025: verificar rollback conjunto dos blocos atômicos e ausência de transação durante chamada externa; contratos de criações 201, regeneração 202 e alterações síncronas 200; erros 400/404/409/503 com code/requestId e fieldErrors quando aplicável, sem valores sensíveis. Uma geração que falha após aceite deve ser consultável como FAILED sem alterar retroativamente a resposta aceita. Ferramentas e forma de teste da conformidade OpenAPI ainda serão discutidas.

TS-007/TS-021/TS-022: testar SQL direto rejeitando vínculo entre pacientes, original_id inválido e complemento apontando para complemento; exclusões restritivas; corrida entre regenerações manuais; revisões e sequências sem duplicação no mesmo paciente; independência dos locks de pacientes diferentes; seleção ordenada somente de jobs elegíveis, respeito a nextAttemptAt e SKIP LOCKED. Simular falha ao persistir evidências para comprovar rollback de análise e COMPLETED, além de rejeição de finalização com estado/token/prazo inválidos.

TS-015/TS-017/TS-018/TS-020: incluir citações clínicas legítimas nos testes de falsos positivos do catálogo; rejeitar timeline sem evidência válida; comprovar adição da limitação fixa em SUMMARY_ONLY mesmo se o modelo a omitir; seções vazias não recebem conteúdo clínico inventado. Verificar metadados de geração/tentativa em sucesso/falha/crash, ausência de métricas inventadas e ausência de conteúdo clínico rejeitado/secrets na auditoria e nos logs.

TS-017 a TS-019: testar equivalência apenas por whitespace/quebras de linha; rejeitar mudança de acento/conteúdo, alias externo ao snapshot, campo não permitido/ausente e trecho inventado; comprovar invariância do texto clínico após comparação. Testar zero/um/dois originais com complementos, patterns vazio em SUMMARY_ONLY e limitação explícita. Simular excesso de contexto, saída truncada/excedida e verificar FAILED sem análise parcial, sem recorte do snapshot e sem perda de prontuário/análise anterior.

Validação da geração única: testes adversariais e revisão clínica devem avaliar afirmação sem suporte apesar de citação existente, hipótese convertida em fato, recomendação terapêutica, tendência com histórico insuficiente, instruções maliciosas dentro de registro e correção por complemento. Não tratar schema válido e citação correspondente como aprovação semântica automática. Usar resultados para corrigir prompt/regras e reavaliar a necessidade futura de segunda revisão, sem introduzi-la implicitamente no MVP.

Backend: JUnit 5, Spring Boot Test, Mockito e Testcontainers PostgreSQL. Testcontainers deve cobrir migrations, constraints, triggers, locks, SKIP LOCKED e idempotência. Frontend: Vitest e Testing Library. E2E: Playwright para os principais fluxos. Testes automatizados não dependem de rede externa; provider OpenAI é mock/fake nos testes comuns.

CI terá jobs separados para backend e frontend, mais um job de integração end-to-end. Não criar job de infra separado apenas para Compose; o Compose do PostgreSQL será validado no fluxo integrado. Comandos, versões de runners, cache e política de execução por caminho ainda serão detalhados.

A estratégia deve cobrir os cenários obrigatórios de `.agents/rules/testing-quality.md`, incluindo append-only, snapshots, 0/1/2 originais, complementos, isolamento, segurança clínica e falhas de provider. Testes automatizados não devem depender de rede; testes reais de provider exigem autorização explícita conforme essa Rule.

As decisões TS-009 a TS-011 exigem evidências específicas: rejeição de UPDATE/DELETE também por SQL direto; geração permitindo suas transições operacionais; cadastro concorrente sem repetir revisão por paciente; inclusão retroativa ausente de snapshots anteriores; geração antiga concluída por último sem regredir a análise atual; desempate por requestSequence no mesmo corte; falha preservando análise válida anterior. Ferramentas e implementação desses testes permanecem pendentes.

TS-007/TS-012/TS-013 acrescentam: reserva adquirida atomicamente, chamada externa sem transação aberta, restart com recuperação, rejeição de resposta com token antigo ou expirado, coerência entre timeout e TTL, limite de 3 tentativas, categorias transitórias/permanentes, backoff/Retry-After e retry manual distinto. Para idempotência, testar cada criação priorizada, mesma chave/payload, conflito de payload, concorrência e perda de resposta após commit; repetição não pode duplicar geração automática.

## 13. Sequenciamento recomendado

As tasks serão separadas em **back**, **front** e **infra**, conforme solicitado, em blocos pequenos e coesos. Organização inicial: `infra-bootstrap`, `backend-bootstrap`, `frontend-bootstrap`, `backend-patient-appointment`, `backend-clinical-records`, `backend-analysis-worker`, `backend-api-integration`, `frontend-patient-appointment`, `frontend-clinical-analysis` e `qa-integration`. Não criar tasks guarda-chuva grandes como `backend-domain-persistence` ou `frontend-flows`; cada task deve ter escopo revisável, critérios e dependências claros. A criação efetiva ocorrerá no fluxo create_tasks após concluir a TechSpec; esta execução não implementa código.

## 14. Decisões e trade-offs

Registro de decisões a discutir em blocos. Nenhuma opção pendente deve ser tratada como aprovada.

| ID de discussão | Tema | Status |
|---|---|---|
| D-001 | Java e Spring Boot | confirmado |
| D-002 | Monorepo; tasks de back/front/infra | confirmado |
| D-003 | Java 21 LTS, Spring Boot 3.5.16, Maven | base confirmada; versão estável do Maven será escolhida no bootstrap |
| D-004 | React 19.2, TypeScript, Vite 8, CSS simples; SPA sem Redux | base e organização confirmadas; Node LTS/TypeScript e demais versões estáveis serão registradas no bootstrap |
| D-005 | PostgreSQL 18.6, ambiente local | confirmado |
| D-006 | Hexagonal pragmática e estrutura do monorepo | backend hexagonal/TransactionRunnerPort, apps/frontend app/features/shared e infra/compose.yaml confirmados; módulos de build/detalhes transacionais pendentes |
| D-007 | Acesso a dados, migrations e constraints/append-only | Flyway/JPA separado/mapeamento manual, append-only, vínculos e schema físico TS-037 confirmados; SQL das migrations pendente |
| D-008 | Modelo original/complemento e relacionamentos | tabela clinical_record, type ORIGINAL/COMPLEMENT e referência obrigatória a ORIGINAL do mesmo paciente confirmados; representação Java concreta pendente |
| D-009 | API, documentação, DTOs, erros e paginação | REST/JSON, OpenAPI, status/Problem Details, idempotência UUID/escopo/hash/retenção e page/size 0/25/100 confirmados; rotas/DTOs/detalhes pendentes |
| D-010 | Validação/normalização cadastral, fuso e formatos temporais | datas/Clock, nome/CPF/e-mail/nascimento/opcionais, telefone brasileiro e busca normalizada confirmados; detalhes de máscaras/Unicode/limites e datas clínicas pendentes |
| D-011 | Snapshot imutável, revisão e concorrência | revisão/corte e SELECT FOR UPDATE na linha do paciente confirmados; constraints adicionais/ordem de locks pendentes |
| D-012 | Fila/worker, recuperação, retry, timeout e idempotência | worker/estados/reservas/retries/idempotência/prazos e SKIP LOCKED por requestedAt/id com conclusão atômica confirmados; SQL final/detalhes operacionais pendentes |
| D-013 | Desempate entre análises válidas do mesmo snapshot | confirmado: maior snapshotRevision e depois requestSequence; nunca conclusão |
| D-014 | Provedor/modelo de IA; SDK direto ou biblioteca de integração | OpenAI/gpt-5.6-terra, SDK oficial Java, Responses API e Structured Outputs confirmados; versão SDK/schema/parâmetros pendentes |
| D-015 | Schema de IA, evidências e minimização de dados | contexto mínimo, contrato das três listas/evidências, whitespace, modos, limitação fixa e mensagens de vazio confirmados; limites/mapeamento/textos pendentes |
| D-016 | Validação semântica, segurança clínica e rejeição integral/parcial | geração única, catálogo conservador versionado com falsos positivos e rejeição integral confirmados; sem segunda chamada; padrões concretos pendentes |
| D-017 | Limites de contexto, orçamento e comportamento com histórico longo | falha explícita por contexto/saída, sem recorte/resumo/divisão, limites configuráveis com reserva de saída confirmados; valores/contagem pendentes |
| D-018 | Layout/fluxos, complementos, textos de UX e atualização de status | proposta funcional TS-038 + polling 3s confirmados; refinamento visual/textos nas tasks |
| D-019 | Execução/deploy, containers, autenticação e secrets no MVP | local, Compose/volume/loopback, apps locais, sem autenticação/CORS amplo e secrets por env confirmados; comandos finais na infra |
| D-020 | Logs, métricas, health checks e auditoria adicional | metadados, SLF4J/Logback, allowlist, Actuator local e sem plataforma externa confirmados; nomes/retenção na implementação |
| D-021 | Testes, ferramentas de qualidade e CI | ferramentas e jobs confirmados; runners/comandos/cache na implementação |
| D-022 | Convenções e dependências das tasks por área; documentação | tasks pequenas/coesas, lista e dependências TS-038 confirmadas; detalhamento por task |

Requisitos já aprovados no PRD não precisam ser reinventados como escolhas técnicas. Toda proposta de implementação desses requisitos será apresentada para decisão; conflitos exigem seguir o controle de mudanças das Rules.

## 15. Riscos técnicos e mitigação

Riscos identificados: resposta de IA semanticamente incorreta, contexto longo, concorrência entre gerações, perda de solicitação após commit, sobrescrita indevida, mistura entre pacientes e vazamento em logs. As mitigações concretas dependem das decisões acima e não estão consideradas concluídas.

## 16. Conformidade com rules e skills

Lidos: PRD completo, spec-review APROVADO, sdd-workflow/create_techspec.md, workflow.md e todos os arquivos em `.agents/rules/`. Não há `.agents/skills/` nem AGENTS.md encontrado no projeto ou nos ancestrais verificados.

Skill de sessão `openai-docs` aplicada para verificar o modelo escolhido na documentação oficial. A consulta documental não implica autorização de teste real nem comprova acesso da conta à API.

A documentação permanece rascunho para respeitar a instrução do usuário de discutir todas as decisões. Nenhuma Rule foi alterada, nenhum código foi criado e nenhum teste de aplicação foi alegado como executado.

## 17. Arquivos/módulos impactados

Nesta execução: somente `tasks/prd-psiqapp-mvp/techspec.md`. Estrutura do backend confirmada na TS-003 sob `apps/backend/`; frontend em `apps/frontend/` com app/features/shared e PostgreSQL em `infra/compose.yaml` conforme TS-030/TS-032. Observabilidade/testes/CI seguem TS-035/TS-036. README, BUSINESS e TECHNICAL deverão refletir implementação real quando as tasks correspondentes ocorrerem. Esses módulos ainda não foram implementados.

### Definition of Ready

- [x] PRD e spec-review aprovados foram lidos.
- [x] Repositório e Rules foram explorados.
- [x] Diretrizes explícitas do usuário foram registradas.
- [x] Propostas de API/UX/schema físico e dependências de tasks aprovadas pelo usuário.
- [x] Cobertura RF/RNF descrita por grupos e componentes; rastreabilidade detalhada será expandida nas tasks.
- [x] Arquitetura, contratos, persistência, falhas e testes detalhados em nível de TechSpec.
- [x] Revisão final de consistência após aprovação das propostas e antes de `create_tasks`.

Pronta para `create_tasks`. A criação dos arquivos de tasks aguarda apenas a aprovação da decomposição de alto nível exigida pelo fluxo.
