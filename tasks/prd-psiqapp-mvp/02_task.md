# Task 2.0 - backend-bootstrap

## Status de execução

EM ANDAMENTO — implementação local preparada em `task/02-backend-bootstrap`; conclusão bloqueada pela ausência de Docker Engine para `BackendBootstrapIT`.

Em 2026-09-10, `mvnw.cmd --batch-mode --no-transfer-progress package` compilou Java 21, executou 14 testes sem falhas e gerou o JAR executável. O teste HTTP de health usa indicador de banco simulado; não substitui a validação PostgreSQL/JPA/Flyway com Testcontainers. `verify` foi executado e falhou ao localizar um ambiente Docker válido. Evidências e rastreabilidade em `02_task_review.md`.

O gate de `task-reviewer` permanece em MUDANÇAS SOLICITADAS. `code-reviewer`, manutenção documental final, conclusão, commit, push e PR aguardam a aprovação desse gate, conforme `sdd-workflow/execute_task.md`. Nenhuma subtask ou teste pendente foi marcado como concluído por antecipação.

### Decisões de implementação do bootstrap

- Maven 3.9.16 via Wrapper 3.3.4, com checksum SHA-256 da distribuição; Java 21 e Spring Boot 3.5.16 preservados.
- Flyway 11.20.3 selecionado para PostgreSQL 18; driver PostgreSQL 42.7.11 e ferramentas de teste gerenciados pelo BOM do Spring Boot. Springdoc 2.8.16 e ArchUnit 1.4.1 fixados no POM.
- Nomes portugueses nas camadas e no código. `RespostaProblema.codigo` e `errosDeCampo` serializam como `code` e `fieldErrors`, preservando TS-025/TS-038, que têm precedência sobre a redação resumida da task.
- Health em `/api/v1/health` e readiness em `/api/v1/health/readiness`; OpenAPI em `/api/v1/openapi`. Servidor em loopback, sem CORS amplo, SDK de IA ou endpoints de produto.
- TS-023/TS-026 são respeitadas como fronteiras: nenhum caso de uso transacional ou listagem foi antecipado. Ports transacionais e paginação serão implementados quando houver operações que os utilizem.

### Retomada da validação

Com JDK 21 configurado em `JAVA_HOME` e Docker Engine disponível, executar em `apps/backend`:

```powershell
./mvnw.cmd --batch-mode --no-transfer-progress verify
```

Para iniciar o backend após subir o PostgreSQL da Task 01, fornecer `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD` por ambiente. `POSTGRES_PORT` tem padrão 5432 e `BACKEND_PORT`, 8080. O `.env` não é carregado implicitamente pelo Maven; a importação explícita a partir de `apps/backend` pode ser feita com:

```powershell
./mvnw.cmd spring-boot:run '-Dspring-boot.run.arguments=--spring.config.import=file:../../.env[.properties]'
```

O teste de integração provisiona banco efêmero via Testcontainers e não requer `.env` ou credencial de IA. O comando de inicialização com PostgreSQL permanece pendente de validação neste Windows.

## Objetivo

Criar o projeto backend Java/Spring Boot com arquitetura hexagonal pragmática, tooling, health local e base de testes, sem implementar regras de produto.

## Rastreabilidade

- PRD: RNF-002, RNF-003, RNF-006, RNF-007
- TechSpec: TS-001, TS-003, TS-006, TS-023, TS-024, TS-025, TS-026, TS-027, TS-035
- Critérios de aceite: separação Domain/Application/Adapters, REST/JSON base, Problem Details, Clock injetável, logs sem dados sensíveis

## Dependências

- 1.0 infra-bootstrap

## Escopo

- Criar `apps/backend` com Java 21, Spring Boot 3.5.16 e Maven Wrapper.
- Definir pacotes hexagonais com nomes de domínio em português.
- Configurar Flyway, JPA, PostgreSQL, validação, Actuator local, OpenAPI e testes.
- Criar tratamento base de erros Problem Details com `codigo`, `errosDeCampo` e `requestId`.
- Configurar `java.time.Clock` injetável.

## Fora do escopo da task

- Endpoints funcionais de pacientes, consultas, prontuário ou IA.
- Migrations de tabelas de negócio.
- Adapter real de OpenAI.
- Implementação de RFs de produto.

## Subtarefas

- [ ] 2.1 Criar o projeto Maven em `apps/backend` e fixar versões aprovadas.
- [ ] 2.2 Criar pacotes `dominio`, `aplicacao`, `adaptador` e `configuracao`.
- [ ] 2.3 Configurar profile local com PostgreSQL, Flyway e JPA.
- [ ] 2.4 Criar `TratadorDeErrosHttp`, `RespostaProblema` e propagação de `requestId`.
- [ ] 2.5 Criar health/readiness local sem dependência de IA.
- [ ] 2.6 Configurar JUnit 5, Spring Boot Test, Mockito e Testcontainers.
- [ ] 2.7 Configurar logs por allowlist de metadados operacionais.

## Critérios de sucesso

- Backend compila e inicia localmente sem endpoint de negócio.
- Camadas internas não dependem de JPA, Spring Web ou SDK externo.
- Erros base não ecoam dados sensíveis.
- Health local responde conforme TechSpec.

## Testes obrigatórios

- [ ] Compilação Maven.
- [ ] Teste de contexto Spring.
- [ ] Teste de `TratadorDeErrosHttp` para formato Problem Details.
- [ ] Teste de exposição local do health/readiness.
- [ ] Verificação arquitetural simples impedindo dependência de `dominio` para `adaptador`.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/backend/pom.xml`
- `apps/backend/mvnw`
- `apps/backend/src/main/java/com/psiqapp/dominio/`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/`
- `apps/backend/src/main/java/com/psiqapp/adaptador/`
- `apps/backend/src/main/java/com/psiqapp/configuracao/RelogioConfiguracao.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/TratadorDeErrosHttp.java`
- `apps/backend/src/test/java/com/psiqapp/`

