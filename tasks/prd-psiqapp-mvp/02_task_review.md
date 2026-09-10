# Review — Task 02

## Status

MUDANÇAS SOLICITADAS

Revisão da implementação local da Task 02 em `task/02-backend-bootstrap`, realizada em 2026-09-10 segundo `sdd-workflow/task-reviewer.md`. A task não está aprovada nem concluída.

## Rastreabilidade

| Origem | ID | Status | Evidência |
|---|---|---|---|
| PRD | RNF-002 | Base atendida, sem declaração de entrega funcional | Health/readiness não dependem de IA; não há SDK, worker ou persistência clínica nesta task. `HealthLocalTest` valida estados HTTP. |
| PRD | RNF-003 | Base atendida, sem auditoria clínica antecipada | `Clock` injetável e correlação de erros/requests; `RelogioConfiguracaoTest`, `FiltroRequestIdTest`. |
| PRD | RNF-006 | Atendido no bootstrap | Encoder com allowlist; ausência de mensagem, argumentos, stacktrace ou MDC completo; DTO de erro não expõe valores rejeitados, caminhos ou mensagens brutas. `LogsSegurosTest`, `TratadorDeErrosHttpTest`. |
| PRD | RNF-007 | Fronteira preservada | Sem integração de IA, payload de paciente ou chamada externa. A minimização do futuro provider não é alegada como implementada. |
| TechSpec | TS-001 | Compilação atendida; inicialização com banco pendente | Java 21, Boot 3.5.16, Maven Wrapper 3.9.16; `package` aprovado; `BackendBootstrapIT` bloqueado por ambiente. |
| TechSpec | TS-003 | Atendido no bootstrap | Pacotes portugueses correspondentes às camadas aprovadas. `ArquiteturaTest` impede dependências inversas/frameworks internos e comprova o detector com fixture negativa. Núcleo ainda sem modelos/casos de uso. |
| TechSpec | TS-006 | Configurado, validação real pendente | JPA com `ddl-auto=validate`, OSIV/SQL logging desativados; PostgreSQL/Flyway configurados; sem entidade ou tabela de negócio. Testcontainers exige Docker ausente. |
| TechSpec | TS-023 | Limite preservado | Nenhuma operação atômica ou port sem consumidor foi criada. Demarcação transacional funcional pertence às próximas tasks. |
| TechSpec | TS-024 | Base atendida | Adaptador HTTP isolado, OpenAPI acessível e sem rotas de negócio; `HealthLocalTest`. |
| TechSpec | TS-025 | Atendido na base | `RespostaProblema`, `TratadorDeErrosHttp`, 400/404/405/409/500/503, `application/problem+json`, `code`, `fieldErrors`, `requestId`, mensagens fixas e instance por UUID. |
| TechSpec | TS-026 | Limite preservado | Não há listas ou contratos paginados antecipados. |
| TechSpec | TS-027 | Base atendida | Clock UTC substituível por Clock fixo, Jackson sem timestamps numéricos, JPA em UTC. Sem datas clínicas/cadastrais nesta task. |
| TechSpec | TS-035 | Atendido no bootstrap | Logs SLF4J/Logback por allowlist, Actuator apenas health, readiness sem IA e sem detalhes públicos, servidor em 127.0.0.1. |
| Task | 2.1–2.2 | Implementado | POM, Wrapper, entrada Spring Boot e pacotes. |
| Task | 2.3 | Configurado; pendente de integração real | `application-local.yaml`, JPA/Flyway, `BackendBootstrapIT`. |
| Task | 2.4–2.5 | Implementado e testado com fronteira de banco simulada | Testes MockMvc de erro/requestId e HTTP real de health/readiness UP/DOWN. |
| Task | 2.6 | Ferramentas configuradas; suíte integral pendente | JUnit 5, Boot Test, Mockito, Testcontainers e ArchUnit; Failsafe obrigatório em `verify`, sem skip automático na ausência de Docker. |
| Task | 2.7 | Implementado e testado | Testes de serialização de logs, descarte de metadados não permitidos e privacidade de erros. |

## Arquivos revisados

- `apps/backend/pom.xml`, `.mvn/wrapper/maven-wrapper.properties`, `mvnw`, `mvnw.cmd` e `.gitattributes`.
- Todos os arquivos de produção em `apps/backend/src/main/java` e `src/main/resources`.
- Todos os testes e fixtures em `apps/backend/src/test/java`.
- `.github/workflows/validacao.yml`, `.gitignore`, `02_task.md` e `tasks.md`.
- Rules, PRD, TechSpec, task, documentação humana e workflow lidos como contexto. A alteração preexistente do usuário em `sdd-workflow/execute_task.md` não integra o diff preparado da task.

## Problemas bloqueantes

1. **Integração com PostgreSQL real não validada.** `mvnw.cmd --batch-mode --no-transfer-progress verify` falhou no início de `BackendBootstrapIT`: `Could not find a valid Docker environment`. Este Windows não possui Docker Engine/CLI nem WSL instalado. A falha acontece antes da inicialização do contexto com PostgreSQL; não comprova falha de JPA/Flyway, mas também não permite aprovar a integração. Disponibilizar Docker e executar o gate completo, corrigindo qualquer falha que surgir.
2. **Lifecycle ainda incompleto.** Após o gate de testes, executar novamente este review, depois `code-reviewer` e `project-documentation-maintainer`. README/TECHNICAL ainda descrevem o backend como reservado e precisam ser atualizados na manutenção documental; BUSINESS deve ser avaliado. Não marcar a task, criar commit ou publicar PR antes das etapas exigidas.

## Problemas não bloqueantes

- Mockito emite aviso sobre auto-attach de agente no JDK 21. Os testes passam; eventual configuração explícita do agente pode ser avaliada sem alterar o comportamento de produção.
- Logger de produção omite mensagens e stacktraces também de bibliotecas para preservar a allowlist. Diagnóstico operacional disponível nesta base é limitado a nível, requestId, status, duração e código; códigos específicos adicionais devem acompanhar as futuras operações, sem liberar texto bruto.

## Testes e verificações executadas

- Maven Wrapper gerado com plugin 3.3.4; distribuição Maven 3.9.16 conferida contra checksum publicado e fixada por SHA-256.
- JDK 21 portátil preparado em `.cache/backend-tools`, ignorado pelo Git, sem substituir o Java 8 global. Checksum do JDK conferido contra metadados do fornecedor.
- `mvnw.cmd --batch-mode --no-transfer-progress package`: **APROVADO**, compilação Java 21, 14 testes, zero falhas/erros/skips e JAR executável gerado. Esta fase não executa os testes Failsafe `*IT`.
- `FiltroRequestIdTest`: 2 testes aprovados.
- `TratadorDeErrosHttpTest`: 6 testes aprovados.
- `ArquiteturaTest`: 2 testes aprovados, incluindo fixture negativa que detecta dependência proibida.
- `LogsSegurosTest`: 1 teste aprovado.
- `RelogioConfiguracaoTest`: 1 teste aprovado.
- `HealthLocalTest`: 2 testes aprovados com servidor HTTP real e indicador de banco simulado. Inclui readiness 200/503, detalhes ocultos, endpoints administrativos/funcionais ausentes e OpenAPI vazio.
- `mvnw.cmd --batch-mode --no-transfer-progress verify`: **BLOQUEADO/FALHOU** ao localizar Docker para `BackendBootstrapIT`; nenhuma validação PostgreSQL real aprovada.
- `npx.cmd --yes prettier@3.6.2 --check .github/workflows/validacao.yml`: **APROVADO**.
- `git diff --cached --check`: **APROVADO**; modo executável 100755 do `mvnw` conferido.
- Busca por padrões de chaves OpenAI, chaves privadas e access keys AWS nos arquivos alterados: nenhum resultado. Inspeção da configuração: credenciais externas, sem secret ou dado real de paciente adicionado.
- Não existem lint Java separado, migrations de negócio, testes de concorrência ou E2E aplicáveis a este bootstrap. Não foram alegados como executados. O workflow CI foi preparado, mas não foi executado no GitHub nesta entrega local.

## Pontos positivos

- Nenhuma API funcional, regra clínica, tabela de negócio ou integração de IA antecipada.
- Testes HTTP exercitam privacidade também em JSON inválido, conflito, falha inesperada, indisponibilidade e rota inexistente.
- Readiness acompanha estado do banco sem expor detalhes e sem incluir IA.
- Dependências estáveis fixadas; Flyway 11.20.3 escolhido por suporte ao PostgreSQL 18, a ser confirmado na integração real.
- Gate de integração permanece obrigatório e falha de ambiente não é convertida em skip ou aprovação.

## Veredito

Implementação local compilável e com 14 testes aprovados, mas **MUDANÇAS SOLICITADAS** pela ausência de evidência da integração real e etapas finais pendentes. Sem aprovação de `task-reviewer`; `code-reviewer` e manutenção documental final ainda não executados. Sem commit, push ou PR.
