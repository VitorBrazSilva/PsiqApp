# PsiqApp MVP - Documentação Técnica

## 1. Arquitetura e comportamento atuais

O monorepo contém backend Spring Boot, frontend React, PostgreSQL, workers assíncronos configuráveis e execução completa via Docker Compose. A implementação inclui cadastro/busca de pacientes, integração da Agenda com Google (conexão, busca mensal de disponibilidade, verificação manual e estados de sincronização), pareceres e complementos append-only, linha do tempo e geração/consulta de análises.

Este documento descreve a arquitetura e o comportamento técnico atuais. As Rules de [arquitetura](../.agents/rules/architecture-boundaries.md), [produto](../.agents/rules/product-invariants.md), [privacidade](../.agents/rules/clinical-data-privacy.md), [segurança clínica](../.agents/rules/clinical-ai-safety.md) e [qualidade](../.agents/rules/testing-quality.md) registram as invariantes do projeto.

## 2. Stack configurada no repositório

| Área | Decisão |
|---|---|
| Backend | Java 21 LTS, Spring Boot 3.5.16 e Maven Wrapper 3.9.16. |
| Arquitetura backend | Hexagonal pragmática: Domain, Application e Adapters. |
| Frontend | React 19.2.8, TypeScript 6.0.3, Vite 8.3.0 e CSS simples; Node.js 24.18.0 LTS e npm 11.16.0. |
| Roteamento frontend | React Router 8.3.1 declarativo. |
| Comunicação frontend | `fetch` nativo por cliente HTTP centralizado. |
| Banco | PostgreSQL 18.6 local. |
| Migrations | Flyway 11.20.3; V001–V003 criam o schema inicial; V004 padroniza nomes; V005/V006 adicionam conexão e sincronização Google. |
| Google Agenda | Google API Java Client Calendar v3 (`google-api-services-calendar` fixado no `pom.xml`), isolado em adapter; conexão OAuth server-side. |
| Persistência backend | Spring Data JPA/Hibernate no adapter de persistência. |
| IA | OpenAI atrás de port, SDK oficial Java 4.63.3, Responses API, Structured Outputs e provider fake determinístico para testes/local. |
| Modelo inicial | `OPENAI_MODEL=gpt-5.6-terra`, configurado por ambiente. |
| Execução local | Compose com PostgreSQL, backend e frontend; também é possível executar backend e Vite diretamente na máquina. |
| Testes backend | JUnit 5, Spring Boot Test, Mockito, ArchUnit e Testcontainers PostgreSQL. |
| Testes frontend | Vitest 5.0.0, Testing Library React 16.3.3 e jsdom 30.0.1; ESLint 10.10.0. |
| E2E | Playwright. |
| Observabilidade | SLF4J/Logback e Actuator local apenas para health/readiness. |

Infraestrutura local já definida: `infra/compose.yaml` usa `postgres:18.6`, volume Docker nomeado `psiqapp-postgres-data`, healthcheck com `pg_isready` e publicação apenas em `127.0.0.1:5432`.

O frontend registra dependências no `package.json` e resolve a árvore completa no `package-lock.json`; Playwright usa a faixa `^1.63.0`, enquanto as demais dependências diretas usam versões exatas. `.nvmrc` fixa o Node. Estas são as versões configuradas no projeto, não uma recomendação de versões mais recentes. O backend usa Maven Wrapper 3.9.16, Flyway 11.20.3, OpenAI Java SDK 4.63.3 e o driver JDBC gerenciado pelo BOM do Spring Boot.

## 3. Estrutura do monorepo e nomenclatura

```text
apps/
  backend/          # Spring Boot, Dockerfile, Maven Wrapper
  frontend/         # React/Vite, Dockerfile, Nginx, Playwright
infra/compose.yaml
docs/
  redesign/       # protótipos, direção visual e análise de UX
.agents/rules/
```

Estrutura efetiva do backend:

```text
apps/backend/src/main/java/com/psiqapp/
├── domain/
│   ├── modelo/
│   ├── validation/
│   └── exception/
├── application/
│   ├── port/in/    # apenas package-info; controllers usam use cases concretos
│   ├── port/out/
│   ├── servico/
│   └── usecase/
├── adapter/
│   ├── in/web/
│   └── out/
│       ├── persistence/
│       ├── ai/
│       └── google/       # OAuth e Google Calendar
└── config/
```

Frontend:

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

Responsabilidades:

- `domain`: modelos, normalização, validações e exceções de negócio.
- `application/usecase`: orquestrações, incluindo `CriarParecerUseCase`, `CriarComplementoUseCase` e o serviço comum `CriarRegistroClinicoServico`.
- `application/servico`: `SnapshotAnaliseAssembler`, `AnaliseResponseValidator` e `CatalogoSegurancaClinica`.
- `application/port/out`: contratos de persistência, transação e `ProvedorAnaliseClinicaPort`.
- `adapter/in/web`: controllers, DTOs Request/Response, `FiltroRequestId` e `HttpErrorHandler`.
- `adapter/out/persistence`: entidades JPA, repositórios Spring Data e adapters JPA/JDBC. `AdapterRegistroClinicoJpa` ainda reúne persistência, timeline e estatísticas; `AdapterAnaliseClinicaJdbc` persiste análise e evidências.
- `adapter/out/ai`: providers fake e OpenAI.
- `adapter/out/google`: adapters OAuth e Calendar; o port de Calendar retorna apenas intervalos ocupados e não expõe eventos Google existentes à aplicação.
- `config`: composição Spring, relógio e scheduler do worker.

A direção principal é `adapter/config -> application -> domain`. ArchUnit verifica dependências de frameworks/adapters; `IdempotenciaServico` ainda importa Jackson na aplicação. A convenção pretendida combina conceitos de negócio em português e papéis arquiteturais em inglês, mas a padronização é parcial: existem `domain/modelo`, `application/servico`, `EntidadePacienteJpa`, `ClienteApi`, aliases antigos de enums e acessores de análise em inglês. Esses nomes são os existentes, não equivalentes inventados a partir da TechSpec.

## 4. Fluxo de dados e execução local

Há duas formas de execução:

```text
Desenvolvimento:
  navegador -> Vite 127.0.0.1:5173 -> proxy /api
            -> Spring Boot 127.0.0.1:8080 -> PostgreSQL 127.0.0.1:5432

Compose completo:
  navegador -> 127.0.0.1:5173 -> Nginx no container frontend
            -> proxy /api -> backend:8080 -> postgres:5432
```

O Compose define dependências de healthcheck: banco antes do backend e backend antes do frontend. Os serviços publicados no host usam `127.0.0.1`; o backend escuta em `0.0.0.0` somente dentro do container. Nginx entrega o build da SPA, mantém o prefixo `/api` no proxy e resolve rotas frontend com fallback para `index.html`.

Controllers convertem DTOs e chamam casos de uso, que acessam persistência por ports. O worker roda no mesmo backend e acessa o provider por `ProvedorAnaliseClinicaPort`. Não há broker externo, microservice separado, RAG ou banco vetorial. Os comandos operacionais estão no [README](../README.md).

## 5. Fronteiras arquiteturais

### Persistência clínica independente da IA

Salvar um parecer ou complemento é uma operação independente da IA. A criação clínica deve concluir com sucesso mesmo se o provedor de IA estiver lento, indisponível ou retornando erro.

Regra central:

- transação clínica salva registro, solicitação de geração e idempotência;
- depois do commit, o registro fica disponível;
- a chamada externa de IA ocorre fora da transação clínica;
- falha da IA nunca desfaz dado clínico salvo.

### Adapter de IA isolado

O domínio e os casos de uso dependem de um port, não do SDK do provider. A implementação OpenAI fica restrita ao adapter `OpenAiAnaliseClinicaAdapter`.

Isso permite trocar modelo ou provider no futuro sem alterar regras de domínio, desde que o novo provider respeite o contrato de análise, evidências, segurança clínica e minimização de dados.

### Transações

A aplicação usa um `TransactionRunnerPort` em `application/port/out`, implementado no adapter de persistência com `TransactionTemplate`.

Uso implementado:

- blocos atômicos de cadastro e criação de geração;
- criação de consulta, idempotência e intenção de sincronização Google;
- reivindicação de geração pelo worker;
- claim e atualização de estado da sincronização Google;
- finalização atômica de análise, evidências e estado `CONCLUIDA`;
- chamadas externas de IA e Google ficam fora das transações.

## 6. Modelo de dados técnico

O schema de produto contém dez tabelas após V006, além do histórico do Flyway. IDs de entidades são UUIDs; instantes usam `timestamptz`; nascimento usa `date`. As FKs usam exclusão restritiva.

| Tabela | Campos principais atuais | Responsabilidade |
|---|---|---|
| `paciente` | `id`, `nome`, `nome_busca`, `cpf`, `data_nascimento`, `telefone`, `email`, `queixa_inicial`, `revisao_clinica`, `sequencia_requisicao`, `criado_em` | Cadastro, busca e contadores por paciente. |
| `consulta` | `id`, `paciente_id`, `agendada_para`, `status`, `observacoes`, `criada_em`, `status_alterado_em` | Agenda e transições finais de status. |
| `registro_clinico` | `id`, `paciente_id`, `tipo`, `parecer_original_id`, `consulta_id`, `data_hora_clinica`, `criado_em`, `texto`, `humor`, `medicamentos`, `revision` | Pareceres e complementos append-only. A coluna ainda se chama `revision`. |
| `geracao_analise` | `id`, `paciente_id`, `gatilho`, `registro_disparador_id`, `revisao_snapshot`, `sequencia_requisicao`, `solicitada_em`, `estado`, `total_registros`, `total_pareceres`, `total_complementos`, `ultimo_registro_clinico_id`, `contagem_tentativas`, `proxima_tentativa_em`, `token_reserva`, `reserva_expira_em`, `concluida_em`, `codigo_falha`, `modo` | Fila persistente, snapshot, reserva e estado. |
| `analise_clinica` | `id`, `geracao_id`, `paciente_id`, `gerada_em`, `modo`, `conteudo_validado`, `versao_regras_seguranca`, `criada_em` | Análise validada, com conteúdo JSONB e uma análise por geração. |
| `evidencia_analise` | `id`, `analise_id`, `paciente_id`, `secao`, `indice_item`, `registro_id`, `campo`, `citacao`, `criada_em` | Evidências normalizadas por item da análise. |
| `tentativa_geracao_analise` | `id`, `geracao_id`, `numero_tentativa`, `iniciada_em`, `finalizada_em`, `resultado`, `codigo_erro`, `duracao_ms`, `requisicao_provedor_id`, `tokens_entrada`, `tokens_saida` | Auditoria técnica gravada ao finalizar uma tentativa. |
| `idempotencia` | `id`, `operacao_escopo`, `paciente_id`, `key`, `hash_payload`, `tipo_recurso`, `recurso_id`, `status_original`, `criada_em` | Repetição segura. A coluna da chave ainda se chama `key`. |
| `conexao_google_agenda` | `id`, `estado`, `refresh_token_iv`, `refresh_token_cifrado`, `atualizada_em` | Estado da conexão e refresh token cifrado; não persiste access token. |
| `sincronizacao_consulta_google` | `consulta_id`, `google_event_id`, `estado`, `tentativas`, `proxima_tentativa`, `ultima_tentativa`, `ultimo_erro`, `versao`, `atualizada_em` | Intenção durável de sincronização, claim/lease e categoria de falha por consulta nova. |

Não existe tabela de heartbeat do worker. A geração não armazena versões de prompt/schema/modelo; a análise armazena `versao_regras_seguranca`.

### Enumerações e contratos de domínio

| Conceito | Valores serializados atuais |
|---|---|
| Status de consulta | `AGENDADA`, `REALIZADA`, `CANCELADA`, `FALTA` |
| Sincronização Google | `AGUARDANDO_CONEXAO`, `PENDENTE`, `SINCRONIZADA`, `FALHA`; respostas para consultas legadas usam `NAO_APLICAVEL`. |
| Tipo de registro | `PARECER`, `COMPLEMENTO` |
| Estado da geração | `ENFILEIRADA`, `EM_EXECUCAO`, `AGUARDANDO_RETENTATIVA`, `CONCLUIDA`, `FALHA` |
| Gatilho | `AUTOMATICA`, `MANUAL` |
| Modo de análise | `RESUMO`, `LONGITUDINAL` |
| Seção da evidência | `LINHA_DO_TEMPO`, `PADROES`, `PONTOS_DE_ATENCAO` |
| Campo da evidência | `TEXTO`, `HUMOR`, `MEDICAMENTOS` |
| Natureza da observação | `RELATO`, `INTERPRETACAO` |

Os enums ainda expõem alguns aliases Java antigos por campos estáticos; os valores retornados por `name()` são os portugueses. `tentativa_geracao_analise.resultado` continua usando strings técnicas `SUCCESS`, `RETRY_WAIT` e `FAILED`.

### Idempotência e concorrência

Criação de paciente, consulta, parecer, complemento e regeneração manual exigem UUID no header `Idempotency-Key`. O backend calcula SHA-256 do payload validado serializado por Jackson. Mesma operação/paciente/chave e mesmo hash retornam o recurso original; hash diferente retorna 409.

`IdempotenciaServico` serializa requisições de mesmo escopo com locks em memória no processo. A operação e o registro de idempotência são persistidos na mesma transação, com índice único no banco. As sequências clínicas usam lock na linha do paciente. Essa implementação corresponde ao backend único do MVP; não estabelece coordenação distribuída entre múltiplas instâncias.

A criação de consultas também usa um `pg_advisory_xact_lock` dedicado à agenda, seguido por nova leitura de sobreposição e gravação atômica da consulta, da idempotência e da intenção de sincronização. Nenhuma chamada Google ocorre enquanto o lock ou a transação está aberto.

### Migrations

- V001: pacientes, consultas e idempotência.
- V002: registros clínicos, gerações, revisões e proteções append-only dos registros.
- V003: análises, evidências, tentativas e proteções append-only adicionais.
- V004: renomeação das oito tabelas e de parte das colunas/índices, conversão de enums e tentativa de conversão do JSONB histórico.
- V005: tabela de estado da conexão Google, com validação de estado/credencial cifrada.
- V006: tabela de sincronização Google, índice parcial de itens vencidos e índice parcial de consultas `AGENDADA` por horário; não faz backfill de consultas existentes.

V001–V004 permanecem como histórico. V006 é executada também em base nova e não cria estado para consultas anteriores. `GoogleAgendaCalendarIT` valida upgrade de V005 para V006 com consulta preexistente, além de bootstrap em base vazia. Na atualização de uma base V003 populada, V004 reativa o trigger append-only de `analise_clinica` antes de normalizar JSONB, não converte valores antigos de `evidencia_analise.campo` antes de adicionar o novo CHECK e só normaliza objetos internos de `linhaDoTempo`; essa atualização pode falhar ou deixar campos JSONB inconsistentes.

## 7. Índices, constraints e proteção dos dados

Índices existentes após V006 incluem:

- `paciente(nome_busca, id)`;
- `consulta(paciente_id, agendada_para, id)` e `consulta(agendada_para, id)`;
- `consulta(agendada_para)` parcial para consultas `AGENDADA` e `sincronizacao_consulta_google(proxima_tentativa, consulta_id)` parcial para `PENDENTE`/`AGUARDANDO_CONEXAO`;
- `registro_clinico(paciente_id, data_hora_clinica DESC, criado_em DESC, id DESC)` e `(paciente_id, revision)`;
- `geracao_analise(estado, proxima_tentativa_em, solicitada_em, id)`, `(paciente_id, estado)` e `(paciente_id, revisao_snapshot, sequencia_requisicao)`;
- `analise_clinica(paciente_id, gerada_em DESC, id DESC)`;
- evidências por `analise_id` e por `registro_id`.

Constraints garantem CPF único, revisão única por paciente, sequência de geração única por paciente, geração automática única por registro disparador, análise única por geração e tentativa única por geração/número. FKs compostas preservam os vínculos por paciente entre registros, consultas, gerações, análises e evidências.

`sincronizacao_consulta_google` possui uma linha por consulta gerenciada, FK restritiva para consulta, identificador de evento único e limite no banco de cinco tentativas automáticas.

Há checks de tipos, estados, modos, seções e campos, além de referência obrigatória do complemento ao parecer original. Um trigger verifica se o original referenciado é um `PARECER` do mesmo paciente. Triggers `BEFORE UPDATE/DELETE` impedem mutação de registros clínicos, análises e evidências. Parte dos nomes de constraints, funções e triggers permanece em inglês após V004.

Não há trigger que compare a revisão da evidência com o corte do snapshot. Essa proteção é feita no fluxo da aplicação: o assembler consulta apenas os registros dentro do corte, e o validador resolve evidências exclusivamente por aliases desse conjunto. Estados finais de consultas são protegidos pelo caso de uso; o CHECK do banco restringe os valores permitidos.

## 8. Snapshot, revisão e análise atual

Na camada interna de aplicação, a montagem do contexto clínico é responsabilidade de `SnapshotAnaliseAssembler` e a validação determinística da resposta é responsabilidade de `AnaliseResponseValidator`. O worker usa a porta `ProvedorAnaliseClinicaPort` e mantém a chamada ao provider, retry e publicação fora da transação clínica.

Cada paciente possui uma revisão clínica monotônica. Ao criar parecer ou complemento:

1. o caso de uso bloqueia a linha do paciente com `SELECT FOR UPDATE`;
2. incrementa `revisao_clinica`;
3. grava o registro clínico com a revisão atribuída;
4. cria a geração automática com `revisao_snapshot` igual ao corte atual;
5. incrementa `sequencia_requisicao`;
6. grava tudo na mesma transação.

O snapshot de uma geração é o conjunto de registros do mesmo paciente com `revision <= revisao_snapshot`.

Regras:

- revisão não deriva da data clínica;
- parecer retroativo recebe revisão nova no momento do cadastro;
- snapshot antigo continua reconstituível porque registros clínicos são append-only;
- paginação da UI não limita o snapshot enviado à IA;
- a IA recebe o snapshot em ordem clínica por `data_hora_clinica`, `criado_em` e ID.

A análise atual é selecionada assim:

1. considerar apenas análises válidas;
2. escolher a maior `revisao_snapshot`;
3. em empate, escolher a maior `sequencia_requisicao`;
4. ignorar a ordem de conclusão.

Uma geração antiga que termina depois não substitui uma análise baseada em snapshot mais recente.

## 9. Worker de IA

### Objetivo

O worker processa gerações de IA fora do fluxo de salvamento clínico. Ele usa o PostgreSQL como fila persistente e roda no próprio backend.

### Ciclo de vida

1. Um parecer ou complemento é salvo.
2. Na mesma transação, o sistema cria uma `geracao_analise`.
3. Após commit, o worker encontra gerações elegíveis.
4. O worker reivindica a geração elegível mais antiga por `solicitada_em ASC, id ASC`.
5. A reivindicação usa `FOR UPDATE SKIP LOCKED` em transação curta.
6. O worker muda o estado para `EM_EXECUCAO`, grava `token_reserva`, `reserva_expira_em` e incrementa tentativa.
7. A transação é encerrada.
8. O worker monta o snapshot, chama a IA e valida a resposta fora da transação.
9. Na finalização, grava análise, evidências e estado `CONCLUIDA` em uma única transação.
10. A finalização só é aceita se geração, estado, token e lease ainda forem válidos.

### Configuração operacional

| Item | Valor inicial |
|---|---|
| Quantidade de workers | Um worker no MVP. |
| Concorrência | Uma geração processada por vez. |
| Polling do worker | 2 segundos. |
| Timeout por chamada de IA | 120 segundos. |
| Orçamento por tentativa | 180 segundos configurados e repassados ao provider; não há deadline global adicional aplicado pelo worker. |
| TTL de reserva | 240 segundos. |
| Renovação automática de lease | Não implementada. |
| Tentativas por geração | Até 3, contando a primeira. |
| Backoff | Aproximadamente 5s antes da segunda tentativa e 20s antes da terceira, com jitter. |

### Estados

| Estado | Significado técnico | Estado público | Bloqueia regeneração manual |
|---|---|---|---|
| `ENFILEIRADA` | Aguardando execução. | Em geração. | Sim. |
| `EM_EXECUCAO` | Reservada por worker. | Em geração. | Sim. |
| `AGUARDANDO_RETENTATIVA` | Aguardando próxima tentativa. | Em geração. | Sim. |
| `CONCLUIDA` | Análise validada e persistida. | Concluída. | Não, salvo outra geração ativa. |
| `FALHA` | Encerrada sem análise válida. | Falha. | Não, salvo outra geração ativa. |

### Retry e recuperação

O adapter OpenAI classifica falhas de conexão, erros transitórios do SDK, HTTP 429 e HTTP 5xx para retentativa. Credenciais ausentes, configuração inválida, outros erros HTTP e resposta vazia são tratados como permanentes. O SDK é configurado com `maxRetries(0)`; a política de retentativa fica no worker.

O worker também repete `INVALID_RESPONSE_QUOTE` (citação não literal), respeitando o limite de tentativas. Outras falhas de validação encerram a geração. Nenhuma análise parcial é publicada. O backend respeita `Retry-After` numérico quando disponível; caso contrário, aplica backoff com jitter.

Retentativa técnica mantém o snapshot; regeneração manual cria outra geração. Reservas expiradas podem ser recuperadas enquanto a contagem estiver abaixo do máximo. O código atual não encerra automaticamente uma geração cuja última reserva expire já no limite de tentativas; esse cenário permanece uma lacuna de recuperação.

## 10. Integração com IA

### Contexto montado e minimização

`SnapshotAnaliseAssembler` consulta todos os registros do paciente com `revision <= revisao_snapshot`, ordenados clinicamente, atribui aliases temporários `R1`, `R2` etc. e mantém o vínculo com os IDs internos para validar evidências. Complementos apontam para o alias do parecer original. Dados cadastrais, observações de consultas e análises anteriores não são buscados para compor esse contexto.

`OpenAiAnaliseClinicaAdapter.montarPayload` serializa `snapshot.registros()` diretamente. Cada `RegistroSnapshot` inclui `id` e `revisao`, portanto o payload atual envia também os UUIDs internos dos registros. O envelope usa `model`, `mode`, `snapshotRevision` e `records`.

### Saída estruturada e persistida

O schema usado pelo adapter é derivado de `AnaliseResponseValidator.Response`:

```json
{
  "linhaDoTempo": [
    {
      "texto": "string",
      "natureza": "RELATO",
      "evidencias": [
        { "apelidoRegistro": "R1", "campo": "TEXTO", "citacao": "trecho literal da fonte" }
      ]
    }
  ],
  "padroes": [],
  "pontosDeAtencao": [],
  "limitacoes": ["string"]
}
```

`natureza` aceita `RELATO` e `INTERPRETACAO`. O validador converte os campos de evidência para `TEXTO`, `HUMOR` e `MEDICAMENTOS`; ainda aceita os equivalentes ingleses, sem distinção de caixa. Depois da validação, cada evidência recebe `registroId` resolvido pelo backend. A API e o JSONB novo usam os campos portugueses acima, incluindo esse identificador interno para navegação da fonte.

O prompt textual do adapter OpenAI ainda menciona chaves inglesas e `SUMMARY_ONLY`, enquanto o schema e o modo usam nomes portugueses. Essa inconsistência não aparece ao validar apenas o provider fake e precisa ser corrigida no adapter.

### Modos e validação

| Modo | Condição | Comportamento implementado |
|---|---|---|
| Sem geração manual | Zero pareceres originais. | Regeneração rejeitada por falta de fonte mínima. |
| `RESUMO` | Um parecer original. | Rejeita padrões não vazios e acrescenta limitação fixa de insuficiência longitudinal quando ausente. |
| `LONGITUDINAL` | Dois ou mais pareceres originais. | Permite análise do histórico completo do snapshot. |

Complementos entram no snapshot, mas não aumentam a contagem de pareceres originais.

O validador exige texto, natureza e evidência por item; verifica alias pertencente ao snapshot, campo permitido e citação contida literalmente na fonte, com normalização de whitespace. O catálogo `CatalogoSegurancaClinica`, versão `clinical-safety-v1`, rejeita expressões proibidas por comparação textual sem acentos e sem diferença de caixa.

Essas verificações são determinísticas e limitadas. Não comprovam ausência de toda inferência clínica indevida, invenção ou tendência no texto livre. A decisão clínica continua com o médico. Falhas rejeitam a resposta inteira; citações inválidas podem ter retentativa conforme a seção 9.

### Limites e auditoria

O adapter configura timeout por chamada e registra tokens de entrada/saída quando devolvidos pelo provider. Não há contagem prévia de tokens, limite explícito de saída nem recorte automático de contexto implementado. O orçamento por tentativa é um parâmetro, sem imposição de deadline global. A versão do catálogo de segurança é persistida na análise; versões de prompt/schema/modelo não são persistidas na geração.

## 11. API HTTP

Base: `/api/v1`. O contrato usa REST/JSON, DTOs separados das entidades JPA e CPF mascarado. OpenAPI é servido em `/api/v1/openapi`.

| Método e rota relativa à base | Resultado |
|---|---|
| `POST /pacientes` | 201; cria paciente; exige `Idempotency-Key`. |
| `GET /pacientes?nome&pagina&tamanho` | Busca/listagem paginada. |
| `GET /pacientes/{id}` | Dados cadastrais. |
| `POST /pacientes/{pacienteId}/consultas` | 201; valida sobreposição local/Google, cria consulta `AGENDADA` e intenção durável; exige `Idempotency-Key`. Com conexão ativa indisponível retorna 503 sanitizado. |
| `GET /consultas?de&ate&pacienteId&pagina&tamanho` | Agenda por intervalo/paciente. |
| `GET /agenda/consultas?grupo&pacienteId&dataInicial&dataFinal&pagina&tamanho` | Página do grupo de consultas e contagens dos cinco grupos no mesmo filtro de paciente/período; datas civis inclusivas em `America/Sao_Paulo`, padrão `PROXIMAS`, resposta `no-store`. |
| `POST /consultas/{id}/status` | 200; transição para status final. |
| `GET /consultas/disponibilidade?agendadaPara` | `DISPONIVEL`, `OCUPADO` ou `INDISPONIVEL`, fuso `America/Sao_Paulo` e instante de verificação. |
| `GET /consultas/disponibilidade/mensal?mes=YYYY-MM` | Datas com horários livres para o mês informado ou atual (parâmetro omitido); mês malformado, passado ou fora do limite temporal é rejeitado. Faz uma leitura local e, quando conectada, uma consulta lógica Google para a janela mensal estendida. Retorna somente data e instantes disponíveis, usa `Cache-Control: no-store` e responde 503 sanitizado quando a verificação Google ativa falha, sem resultado parcial. |
| `POST /consultas/{id}/sincronizacao-google/tentar-novamente` | 202; reinicia o estado durável de sincronização quando existe vínculo. |
| `GET /pacientes/{pacienteId}/registros-clinicos?pagina&tamanho` | Linha do tempo descendente. |
| `POST /pacientes/{pacienteId}/registros-clinicos` | 201; parecer e geração; exige `Idempotency-Key`. |
| `POST /pacientes/{pacienteId}/registros-clinicos/{parecerOriginalId}/complementos` | 201; complemento e geração; exige `Idempotency-Key`. |
| `GET /pacientes/{pacienteId}/registros-clinicos/{registroId}` | Fonte clínica/evidência. |
| `POST /pacientes/{pacienteId}/geracoes-analise` | 202; regeneração manual; exige `Idempotency-Key`. |
| `GET /pacientes/{pacienteId}/estado-analise` | Análise atual, gerações e permissão de regeneração. |
| `GET /pacientes/{pacienteId}/geracoes-analise?pagina&tamanho` | Histórico de gerações. |
| `GET /pacientes/{pacienteId}/analises/{analiseId}` | Conteúdo de análise histórica. |
| `GET /health` e `GET /health/readiness` | Health sem dados internos nem dependência de IA. |

As rotas inglesas de produto não são mantidas como aliases. Headers técnicos e chaves reservadas de Problem Details permanecem nos padrões originais.

DTOs efetivos:

| DTO | Campos |
|---|---|
| `CriarPacienteRequest` | `nome`, `cpf`, `dataNascimento`, `telefone`, `email`, `queixaInicial`. |
| `PacienteResponse` | `id`, dados cadastrais, `cpf` mascarado e `criadoEm`. |
| `CriarConsultaRequest` | `agendadaPara`, `observacoes`. |
| `ConsultaResponse` | Campos atuais da consulta e objeto aditivo `sincronizacaoGoogleAgenda` (`estado`, `ultimaTentativa`); legado retorna `NAO_APLICAVEL`. |
| `DisponibilidadeConsultaResponse` | `estado`, `fusoHorario`, `verificadoEm`; não inclui detalhes de eventos Google. |
| `DisponibilidadeMensalResponse` | `mes`, `hoje`, `fusoHorario`, `verificadoEm`, `fonteDisponibilidade` (`LOCAL`/`LOCAL_E_GOOGLE`) e `dias[]` com `data` e `horarios[]` em instantes UTC; a referência é capturada depois das leituras. Não inclui paciente, observações ou eventos Google. |
| `CriarRegistroClinicoRequest` | `texto`, `humor`, `medicamentos`, `dataHoraClinica`, `consultaId`. O complemento rejeita `consultaId` preenchido. |
| `RegistroClinicoResponse` | `id`, `pacienteId`, `tipo`, `parecerOriginalId`, `consultaId`, `dataHoraClinica`, `criadoEm`, `texto`, `humor`, `medicamentos`, `revisao`. |
| `CriarRegistroClinicoResponse` | `registro`, `geracaoId`, `geracao` inicialmente `ENFILEIRADA`. |
| `GeracaoAnaliseResponse` | `id`, `pacienteId`, `estado`, `revisaoSnapshot`, `sequenciaRequest`, `solicitadaEm`, `totalRegistros`, `totalOriginais`, `totalComplementos`, `ultimoRegistroClinicoId`, `modo`, `analiseId`. |
| `EstadoAnaliseResponse` | `analiseAtual`, `ultimaGeracao`, `geracaoAtiva`, `podeRegenerar`, `motivo`. |
| `AnaliseResponse` | `id`, `geracaoId`, `pacienteId`, `geradaEm`, `modo`, `linhaDoTempo`, `padroes`, `pontosDeAtencao`, `limitacoes`. |
| `PaginaResponse<T>` | `itens`, `pagina`, `tamanho`, `total`. |

As contagens/corte do snapshot e, quando disponível, o `analiseId` estão em `GeracaoAnaliseResponse`. O DTO não expõe código de falha, número de tentativas nem instante de conclusão. A interface usa `analiseId` para abrir uma análise histórica concluída.

## 12. Erros, paginação e datas

### Problem Details

Erros HTTP usam `application/problem+json`, preservando `type`, `title`, `status`, `detail` e `instance`, com extensões próprias:

- `codigo`;
- `errosDeCampo`, quando aplicável, com `campo` e `mensagem`;
- `idRequisicao`.

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
| 500 | Falha inesperada, com mensagem genérica. |

Falhas da IA após aceite da solicitação aparecem como estado da geração, não como erro HTTP retroativo.

Falha ao verificar disponibilidade Google numa conexão ativa retorna 503 com `codigo=GOOGLE_DISPONIBILIDADE_INDISPONIVEL`; ocupação local ou Google retorna 409 `CONFLITO`. Respostas e logs não reproduzem detalhes brutos do provider.

### Paginação

Padrão:

- `pagina` começa em 0;
- `tamanho` padrão é 25;
- `tamanho` máximo é 100;
- ordenação estável com desempate por ID.

A paginação da UI nunca limita o snapshot completo usado pela IA.

### Datas e horários

Política aprovada:

- persistir instantes como PostgreSQL `timestamptz`;
- representar instantes no backend como `Instant`;
- receber datas/horas na API como ISO 8601 com offset;
- responder instantes em UTC;
- exibir na interface em `America/Sao_Paulo`;
- enviar intervalos de consulta ao Google como instantes e solicitar/gerar eventos no fuso `America/Sao_Paulo`;
- comparar disponibilidade como intervalo `[início, início + 1 hora)`, mantendo o fim exclusivo;
- gerar candidatos mensais em passos de 30 minutos, desde 00:00 até 23:30 no calendário civil de `America/Sao_Paulo`, excluindo inícios anteriores ao instante de referência;
- nascimento usa `DATE`/`LocalDate`;
- `criadoEm` é gerado pelo servidor;
- `dataHoraClinica` permanece separado de `criadoEm`;
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
- usando `nome_busca`;
- consulta parametrizada;
- curingas escapados;
- ordenação por nome normalizado e ID;
- busca vazia retorna lista paginada.

## 14. Frontend

Capacidades implementadas:

- `src/app` compõe bootstrap, layout e rotas declarativas; `features` contém pacientes, consultas, registros clínicos e análises; `shared` contém aviso, estado vazio, cliente HTTP, erros, formulários e idempotência.
- `/` redireciona para `/pacientes`; `/pacientes`, `/agenda`, `/prontuario` e `/prontuario/:pacienteId` são navegáveis e consomem a API real. Rotas desconhecidas têm mensagem e link de retorno.
- Pacientes possuem formulário de cadastro, busca por nome, lista com abertura do prontuário, validação client-side de campos obrigatórios, CPF, e-mail, telefone e nascimento, além de tratamento visual de Problem Details e erros de campo.
- Agenda e prontuário possuem criação de consultas com `Idempotency-Key`, painel compartilhado com cinco grupos, período civil inclusivo, contagens do backend e paginação, exibição de paciente/data/hora/status, estados carregando/vazio/erro e atualização de status final (`REALIZADA`, `CANCELADA`, `FALTA`). No prontuário, itens e contagens usam sempre o paciente da rota atual e sua leitura é independente do carregamento clínico. A lista de Próximas renova itens e contagens ao atravessar o início de uma consulta visível; o resumo do prontuário e a lista também renovam ao retornar à janela/aba.
- A seção Consultas do prontuário combina contexto superior de próxima consulta, lista em painel branco e resumo lateral, empilhados em telas estreitas. A lista usa data/hora compactas e identifica o paciente pelo cabeçalho; a Agenda conserva seus metadados completos. O resumo em `features/consultas` lê a primeira consulta de Próximas e Realizadas, com tamanho 1 e filtro obrigatório do paciente, somando as contagens completas sem aplicar os filtros da lista. As leituras são abortadas/descartadas ao mudar de contexto; criação, atualização de status, retorno à janela e timers renovam os dados. Falha de leitura não produz total zero. A apresentação de próxima consulta e a formatação de data/hora em São Paulo são reutilizadas no Histórico clínico.
- A Agenda apresenta o estado seguro de conexão Google e suas ações, inicia OAuth por navegação ao backend e divulga os dados do evento e as permissões de compartilhamento. Agenda e prontuário compõem o mesmo fluxo de agendamento em `features/consultas`: calendário mensal semântico, horários em radios agrupados por período, revisão e confirmação. O paciente é selecionado na Agenda e fixo pela rota no prontuário; o caminho manual conserva a verificação exata e consultas retroativas.
- A apresentação compartilhada da busca omite madrugada em São Paulo nas opções, nas datas disponíveis e no estado de mês vazio, preservando o contrato e o ciclo de vida de `useDisponibilidadeMensal`. `tempoAgenda` centraliza esse corte visual e reutiliza o formatador de hora. `IconeAgendamento` reúne SVGs decorativos locais, sem biblioteca adicional. Os radios nativos ocupam toda a opção e conservam teclado/foco; as etapas têm conectores e a revisão usa data civil abreviada, hora e cadastro do paciente. O diálogo recebe nome/e-mail guardados pela identidade da rota, usa ações opostas e considera as áreas seguras no mobile.
- A primeira busca mensal omite o mês e usa os metadados do servidor. O hook conserva apenas a leitura atual em memória, aborta/descarta respostas por contexto e renova ao mudar mês/paciente/conexão, voltar à janela/aba, criar ou conflitar. O corte dos slots usa `verificadoEm` mais tempo decorrido monotônico; timers removem slots vencidos e renovam na virada civil em São Paulo, com nova conferência antes do envio. Um 503 Google remove a leitura anterior, sem resultados locais parciais.
- O prontuário usa um diálogo amplo com `showModal()`, foco inicial, Escape/fechamento e retorno ao acionador, expandido para tela inteira no mobile. Trocar de paciente fecha/resetta o diálogo e aborta operações antigas; callbacks de criação são vinculados ao paciente original.
- A lista local apresenta estado Google por consulta (`SINCRONIZADA`, `AGUARDANDO_CONEXAO`, `PENDENTE`, `FALHA`, `NAO_APLICAVEL`) e permite nova tentativa para itens pendentes ou falhos. A integração não adiciona eventos Google existentes à lista local.
- Prontuário clínico possui formulários de parecer original e complemento com `Idempotency-Key`, data/hora clínica, texto obrigatório, humor e medicações opcionais. A linha do tempo exibe originais e complementos com metadados e referência ao parecer original.
- Análise clínica possui painel de análise atual, limitações persistentes, seções de timeline resumida, padrões e pontos de atenção, mensagens fixas para seções vazias, evidências clicáveis para abrir a fonte do registro clínico, histórico de gerações e regeneração manual quando `podeRegenerar` permite.
- O histórico da UI lista metadados de gerações e abre uma versão concluída quando o contrato fornece `analiseId`; a tela valida paciente e geração antes de exibir o conteúdo histórico. Gerações sem vínculo permanecem indisponíveis explicitamente e não substituem a análise atual.
- Polling de análise ocorre a cada 3 segundos somente enquanto houver geração ativa e a aba estiver visível; ao retornar à aba, consulta imediatamente. O hook evita requisições sobrepostas, descarta respostas de paciente anterior e não sobrescreve formulários clínicos em edição.
- Aviso de uso exclusivo de dados fictícios no layout comum, sem dispensa e com posicionamento sticky; CSS responsivo simples, navegação semântica e foco visível.
- `ClienteApi.requisitar<T>` usa base relativa `/api/v1`, JSON, `Accept` comum, `Idempotency-Key` opcional e `AbortSignal`. Não mantém cache de paciente, não faz retry automático e usa `cache: no-store`. As operações de consultas da Agenda e do prontuário optam por `usarApiReal` para ignorar o mock e o fallback local de demonstração; as demais features mantêm o comportamento padrão.
- O chamador cria a chave UUID com `chaveDeIdempotencia()` uma vez por operação e mantém a mesma chave e corpo ao repetir um envio. No backend, criação de pacientes, consultas, pareceres, complementos e regeneração manual persiste idempotência.
- O formulário de consulta conserva paciente, instante, observações e chave da operação quando a resposta é incerta. A repetição reenvia esse corpo/chave mesmo se o slot já venceu, permitindo recuperar uma criação concluída. Editar os dados inicia outra operação; sucesso limpa o envio, 409 invalida a seleção e renova a busca, e falha Google exige nova disponibilidade válida.
- `ErroApi` contém status HTTP e metadados de Problem Details (`codigo`, `idRequisicao` UUID e `errosDeCampo` com mensagens locais). Mensagens locais substituem texto remoto; `title`, `detail`, `instance`, mensagens de campo e valores rejeitados não são retidos. O cliente trata falha de transporte, JSON inválido e sucesso 204.
- A configuração de desenvolvimento fixa 127.0.0.1:5173, `strictPort` e proxy `/api` para 127.0.0.1:8080. Nos testes, `E2E_BASE_URL` pode escolher a porta do Vite e `E2E_API_PROXY_TARGET` o backend local isolado. Nenhum secret ou acesso a provider é necessário para iniciar a SPA.

Não usar Redux, framework CSS pesado ou biblioteca de cache/estado de servidor no MVP.

## 15. Segurança, privacidade e configuração

### Uso local

O MVP roda localmente e sem autenticação:

- backend em `127.0.0.1:8080`;
- frontend em `127.0.0.1:5173`;
- PostgreSQL em `127.0.0.1:5432` via `infra/compose.yaml`;
- Vite faz proxy de `/api` no desenvolvimento; no Compose completo, Nginx encaminha `/api` para `backend:8080`;
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
- parâmetros de worker, timeout, orçamento, TTL e retry;
- endereços e portas locais.

Variáveis do worker de análise:

- `PSIQAPP_ANALISE_WORKER_ENABLED`, padrão `false`;
- `PSIQAPP_ANALISE_PROVIDER`, padrão `fake`, aceita `fake` ou `openai`;
- `PSIQAPP_ANALISE_WORKER_POLL_INTERVAL`, padrão `2s`;
- `PSIQAPP_ANALISE_CALL_TIMEOUT`, padrão `120s`;
- `PSIQAPP_ANALISE_ATTEMPT_BUDGET`, padrão `180s`;
- `PSIQAPP_ANALISE_LEASE_TTL`, padrão `240s`;
- `PSIQAPP_ANALISE_MAX_ATTEMPTS`, padrão `3`;
- `PSIQAPP_ANALISE_BACKOFF_INITIAL`, padrão `5s`;
- `PSIQAPP_ANALISE_BACKOFF_FINAL`, padrão `20s`.

O Compose repassa explicitamente as variáveis de habilitação/provider e OpenAI; os demais parâmetros do worker usam os defaults da aplicação, pois não estão repassados em `backend.environment`. Para alterá-los dentro do container, é necessário configurar esse repasse.

Frontend recebe apenas configuração pública. Nunca expor `OPENAI_API_KEY`, credenciais de banco ou secrets no bundle, logs, Problem Details, fixtures, testes ou documentação.

Versionar somente `.env.example` com placeholders. Arquivos reais de ambiente ficam fora do Git. O Compose local deve ser executado com `--env-file .env` após criação local desse arquivo a partir do template.

Conexão OAuth opcional do Google Agenda:

- `PSIQAPP_GOOGLE_AGENDA_CLIENT_ID` e `PSIQAPP_GOOGLE_AGENDA_CLIENT_SECRET` identificam o cliente server-side;
- `PSIQAPP_GOOGLE_AGENDA_REDIRECT_URI` precisa terminar no callback fixo `/api/v1/integracoes/google-agenda/callback`;
- `PSIQAPP_GOOGLE_AGENDA_FRONTEND_URI` define o destino fixo `/agenda` após callback;
- `PSIQAPP_GOOGLE_AGENDA_ENCRYPTION_KEY` é Base64 de 32 bytes aleatórios e deve permanecer fora do repositório.

`GET /api/v1/integracoes/google-agenda` expõe somente estado seguro. O fluxo em `adapter/out/google/GoogleAgendaOAuthAdapter` solicita `calendar.freebusy` e `calendar.events.owned`. O refresh token é cifrado em `conexao_google_agenda` por AES-256-GCM com IV aleatório por gravação; access tokens não são persistidos. Início e callback usam cookie `HttpOnly`, `SameSite=Lax`, `Secure` fora de loopback e `state` aleatório, de uso único, vinculado ao cookie e válido por dez minutos. Configuração ausente ou incompleta não impede startup e produz `NAO_CONFIGURADA`. Desconexão remove a credencial local e tenta revogar o token; falha remota não restaura a conexão.

### Google Calendar e sincronização

O adapter Calendar consulta `freeBusy.query` apenas para `primary` e retorna intervalos ocupados; eventos preexistentes e seus detalhes não são importados nem armazenados. Eventos do PsiqApp usam UUID estável sem hífens e uma propriedade privada que confirma a associação antes de alterar/remover. O payload contém somente nome, e-mail e início/fim; não inclui CPF, observações ou conteúdo clínico. A conexão Google é consultada fora da transação de agenda.

`sincronizacao_consulta_google` mantém estados `AGUARDANDO_CONEXAO`, `PENDENTE`, `SINCRONIZADA` e `FALHA`. O worker roda no backend, processa lotes de 20 com claim transacional `FOR UPDATE SKIP LOCKED`, reserva de dois minutos e polling configurável (padrão `5s`). Reivindicação vencida torna o trabalho recuperável após restart; falhas transitórias têm backoff exponencial e limite de cinco tentativas automáticas. A reconciliação consulta o ID estável após timeout para evitar duplicatas. Erros de autorização marcam a conexão indisponível. Eventos de consultas canceladas são removidos; consultas legadas não têm linha de sincronização. Não há broker externo.

Variáveis do worker Calendar: `PSIQAPP_GOOGLE_AGENDA_WORKER_ENABLED` (padrão `true`) e `PSIQAPP_GOOGLE_AGENDA_WORKER_POLL_INTERVAL` (padrão `5s`). Ambas são repassadas pelo Compose local e possuem placeholders/configuração no `.env.example`.

## 16. Observabilidade

`logback-spring.xml` emite JSON com allowlist de `timestamp`, `level`, `requestId`, `status`, `duracaoMs` e `codigo`. Mensagem, argumentos, exceção e MDC completo não são serializados. `FiltroRequestId` propaga o header `X-Request-Id` e registra metadados operacionais da requisição.

O logger operacional usa nível INFO e o root usa WARN. A sincronização Google guarda apenas categoria sanitizada de erro e timestamps/contagem no estado durável; tokens, nomes/e-mails e resposta Google não são registrados. A auditoria de tentativas de análise é persistida em `tentativa_geracao_analise`.

Logs não devem expor conteúdo clínico, respostas integrais da IA, CPF completo, credenciais ou secrets. Testes cobrem o formato dos logs e mensagens de erro.

Actuator expõe apenas health/readiness, sem detalhes; OpenAPI é um endpoint separado. Não há plataforma externa de observabilidade nem heartbeat persistente implementado.

## 17. Testes e qualidade

O backend usa JUnit 5, Spring Boot Test, Mockito, ArchUnit e Testcontainers PostgreSQL. `mvnw verify` executa testes unitários/contexto e os `*IT` de APIs, banco, registros, análises e workers. Os testes cobrem contratos Calendar fake, intervalos/fuso, privacidade de payload, migração sem backfill, concorrência local, atomicidade, estados de consulta, reconciliação, retry e recuperação de claim expirado.

O frontend usa Vitest/Testing Library para cliente HTTP, formulários, fluxos e polling, incluindo total completo e renovação do resumo de consultas, descarte de respostas de outro paciente e limites dos timers. Playwright contém vinte e um testes em seis arquivos. Cinco verificam os fluxos Google com uma API fake local; os demais cobrem cadastro/busca, criação e agrupamento de consultas com filtro por período/paciente, paginação e isolamento, parecer/complemento/evidência, isolamento de registros, histórico insuficiente após reload, layout responsivo da análise e navegação por teclado no histórico e nos grupos da Agenda. O painel de consultas do prontuário é verificado em 360/768/1024/1440 px, com resumo independente dos filtros e agendamento por teclado/retorno de foco. A busca mensal também é validada nas duas origens, com teclado, diálogo, layouts de 360 px/desktop, navegadores UTC/Honolulu, conflito, falha Google, repetição idempotente e cadastro manual retroativo; uma confirmação usa backend real e PostgreSQL. As fixtures de sistema usam dados fictícios e backend local. Apesar do nome `isolamento-e-falha-ia.spec.ts`, seus testes não simulam falha, timeout ou retry do provider.

### CI configurado

`.github/workflows/validacao.yml` contém:

- `backend`: Java 21 e `./mvnw --batch-mode --no-transfer-progress verify` com Testcontainers;
- `frontend`: Node de `.nvmrc`, `npm ci`, typecheck, lint, Vitest e build;
- `e2e-integrado`: valida Compose, instala Chromium, sobe PostgreSQL/backend com worker habilitado e provider fake, executa Playwright via Vite e desmonta o ambiente ao final.

Testes comuns usam fake/mock e dados fictícios; não precisam de OpenAI real. Testes contra provider externo exigem autorização explícita. Os testes Playwright de disponibilidade Google usam respostas locais, sem conta Google ou rede externa.

## 18. Limites técnicos do MVP

Não implementar no MVP sem nova decisão:

- autenticação/autorização;
- acesso remoto;
- cloud;
- Kubernetes;
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
