# Evidências — retomada da Task 02

Data: 02/10/2026. Branch: `task/02-listas-agenda`.

## Correção

`PatientAppointmentIT` continha uma sequência literal `\r\n` após a classe e usava `@Container` sem import. Ambos impediam compilar o estado versionado. Corrigidos esses pontos e removidos dois imports não usados. O relógio e o fixture de 120 consultas já usam `REFERENCIA_TESTE`.

## Verificações executadas

| Comando | Resultado |
|---|---|
| Backend: `mvnw.cmd --batch-mode --no-transfer-progress verify` | BUILD SUCCESS; 57 testes unitários/contexto/arquitetura e 42 ITs; zero falhas, erros ou skips. Inclui migrations, ArchUnit e os 6 testes de `PatientAppointmentIT`. |
| Frontend: `npm run typecheck` | Passou. |
| Frontend: `npm run lint` | Passou. |
| Frontend: `npm test -- --run` | 58 testes, 7 arquivos, todos aprovados. |
| Frontend: `npm run build` | Passou. |
| `npm run e2e -- e2e/fluxos-principais.spec.ts --grep 'filtra grupos\|pagina a lista' --workers=1` | 2/2 aprovados, com JAR atual em 8081, PostgreSQL temporário em 55432 e frontend em 5175. |
| `git diff --check` | Passou. |

E2Es confirmaram grupos, período civil, consulta retroativa, isolamento no prontuário, paginação de 51 consultas, teclado e ausência de overflow em 360px/1280px. Screenshots `apps/frontend/test-results/agenda-360.png` e `agenda-desktop.png` inspecionados: labels/contagens legíveis e foco visível. Artefatos de execução são locais e ignorados pelo Git.

## Diagnóstico do ambiente

A primeira execução de integração após corrigir a compilação falhou porque o Docker estava desligado. Após iniciar Docker Desktop, a suíte completa passou. Não foi necessário modificar cache Spring ou lifecycle Testcontainers.

A primeira repetição dos E2Es usou o Compose existente em 8080 e falhou porque sua imagem antiga retorna 404 na nova rota `/api/v1/agenda/consultas`. A mesma rota respondeu 200 no JAR atual; os dois testes passaram no ambiente isolado. A imagem do Compose existente não foi atualizada. A suíte E2E completa não foi repetida nesta retomada; suas falhas anteriores fora do escopo permanecem registradas no task-review para o QA da feature.

## Reviews e manutenção documental

- Task-review: APROVADO; gate backend encerrado.
- Code-review: APROVADO COM OBSERVAÇÕES; nenhum blocker.
- BUSINESS.md: NOT NEEDED nesta retomada.
- TECHNICAL.md: NOT NEEDED nesta retomada.
- README.md: NOT NEEDED nesta retomada.

Avaliação conforme `project-documentation-maintainer`: as fontes canônicas já descrevem os grupos, datas civis, contagens completas, paginação, isolamento e comandos de teste implementados na Task 2. A correção restringe-se à compilação/configuração de um teste existente, sem mudança funcional, arquitetural ou operacional. Não exige atualização artificial das fontes canônicas. A pasta da feature permanece até Task 3, QA e reviews finais.
