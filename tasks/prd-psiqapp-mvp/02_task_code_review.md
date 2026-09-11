# Code Review — Task 02

## Status

APROVADO COM OBSERVAÇÕES

## Arquivos revisados

- `apps/backend/pom.xml`, Maven Wrapper e `.gitattributes`.
- Classes Spring Boot, configuração de JPA/Flyway/Actuator/OpenAPI, `FiltroRequestId`, `RespostaProblema`, `TratadorDeErrosHttp` e Logback.
- Testes unitários, MockMvc, contexto HTTP, Testcontainers e ArchUnit.
- Workflow de CI do backend e atualizações de rastreabilidade da task.

## Blockers

Nenhum.

## Non-blocking

- Mockito emite aviso do JDK 21 sobre auto-attach do agente inline. Não altera o resultado dos testes nem o código de produção; pode ser tratado numa manutenção futura do tooling.
- A base de health usa o Actuator e deixa a integração real do banco para o contexto Testcontainers; isso mantém o bootstrap pequeno e sem controllers de negócio.

## Pontos positivos

- Dependências apontam para dentro: o domínio/aplicação permanecem sem dependência de Spring, JPA, HTTP ou provider externo.
- O adaptador HTTP centraliza Problem Details e não devolve mensagens de exceção, corpos inválidos ou valores sensíveis.
- `requestId` é validado, propagado no header e MDC é restaurado mesmo quando a cadeia falha.
- Logs usam allowlist explícita e os testes comprovam que mensagem, argumentos, stacktrace e MDC arbitrário não são emitidos.
- JPA/Flyway estão configurados com OSIV e SQL logging desativados; a integração real confirmou PostgreSQL 18.6 e ausência de tabelas de negócio.
- A solução não antecipa ports, casos de uso, migrations ou integrações de tasks futuras.

## Veredito

APROVADO COM OBSERVAÇÕES. A implementação é coesa para o escopo de bootstrap, respeita os limites hexagonais e não possui blockers técnicos. Os dois apontamentos são melhorias futuras de tooling, sem necessidade de alteração para concluir a Task 02.
