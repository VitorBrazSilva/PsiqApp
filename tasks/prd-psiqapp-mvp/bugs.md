# Bugs - Task 11

## BUG-11-001 - Backend nao compila no ambiente local disponivel

- **Status atual:** resolvido no ambiente atual; JDK 21.0.6 esta disponivel e `./mvnw.cmd verify` passou.

- **Severidade:** bloqueante para QA integrado
- **Reproducao:** executar `cd apps/backend && ./mvnw.cmd verify`.
- **Resultado observado:** falha de compilacao ao usar Java 8, embora o projeto exija release 21; os erros aparecem em DTOs que usam recursos de Java moderno.
- **Impacto:** backend nao inicia em `127.0.0.1:8080`; persistencia, API, worker, Compose/Testcontainers e E2E nao podem ser validados neste ambiente.
- **Evidencia:** `java -version` retorna `1.8.0_251`; Maven falha no goal `maven-compiler-plugin` com `release 21`.
- **Acao recomendada:** disponibilizar JDK 21 e repetir o ciclo completo. Nao e uma correcao de funcionalidade da Task 11.

## BUG-11-002 - Suite E2E bloqueada pelo backend indisponivel

- **Status atual:** resolvido no ambiente atual; Compose subiu PostgreSQL, backend e frontend saudaveis, e a suite E2E passou apos instalar o Chromium do Playwright.

- **Severidade:** bloqueante para os criterios de aceite integrados
- **Reproducao:** executar `cd apps/frontend && npm run e2e` sem backend em `127.0.0.1:8080`.
- **Resultado observado:** os 4 cenarios falham; as requisicoes da API retornam `502`/proxy registra `ECONNREFUSED 127.0.0.1:8080`.
- **Impacto:** nao ha evidencia de fluxo ponta a ponta, isolamento, parecer, complemento ou IA.
- **Acao recomendada:** iniciar backend compilado com PostgreSQL/Testcontainers e provider fake, depois repetir `npm run e2e`.
