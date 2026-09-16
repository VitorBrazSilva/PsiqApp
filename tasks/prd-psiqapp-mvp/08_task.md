# Task 8.0 - backend-api-contract-validation

**Status: CONCLUÍDA em 2026-09-15.** Testes aprovados, task-reviewer aprovado, code-reviewer sem blockers e manutenção documental concluída.

## Objetivo

Validar e estabilizar os contratos REST do backend, OpenAPI, erros, paginação, idempotência, privacidade e consistência entre pacientes, consultas, prontuário e análise, sem reimplementar controllers ou casos de uso.

## Rastreabilidade

- PRD: requisitos funcionais backend já implementados nas tasks 4.0 a 7.0, usados aqui apenas como contratos a validar; RNF-002, RNF-003, RNF-005, RNF-006, RNF-007
- TechSpec: TS-024, TS-025, TS-026, TS-027, TS-030, TS-031, TS-035, TS-038
- Critérios de aceite: todos os ACs backend já implementados, validados pelo contrato HTTP consolidado

## Dependências

- 4.0 backend-patient-appointment
- 5.0 backend-clinical-records
- 6.0 backend-analysis-core
- 7.0 backend-analysis-worker

## Escopo

- Revisar e estabilizar rotas `/api/v1` previstas na TechSpec.
- Validar que DTOs de entrada/saída não expõem entidades JPA nem campos sensíveis indevidos.
- Publicar ou gerar contrato OpenAPI local fiel ao backend implementado.
- Uniformizar Problem Details, códigos HTTP, paginação, datas UTC e nascimento como data local.
- Validar headers e semântica de idempotência para criações e regeneração.
- Criar testes de contrato cobrindo fluxos integrados do backend.
- Registrar ajustes pontuais de contrato quando houver divergência pequena entre implementação e TechSpec.

## Fora do escopo da task

- Reimplementar casos de uso, regras de domínio, persistência ou worker.
- Criar novas funcionalidades fora do PRD/TechSpec.
- Refatorar toda a API por preferência estética.
- UI frontend.
- Teste real contra provider externo.

## Subtarefas

- [x] 8.1 Validar rotas de pacientes, consultas, registros clínicos, análise e health contra a TechSpec.
- [x] 8.2 Validar DTOs como `PacienteResposta`, `ConsultaResposta`, `RegistroClinicoResposta`, `EstadoAnaliseResposta` e `RespostaPaginada`.
- [x] 8.3 Validar serialização de datas: entrada ISO 8601 com offset, saída UTC e nascimento como data local.
- [x] 8.4 Consolidar erros 400, 404, 409 e 503 com `codigo`, `errosDeCampo` e `requestId`.
- [x] 8.5 Publicar OpenAPI e validar exemplos com dados fictícios.
- [x] 8.6 Criar testes HTTP integrados dos fluxos principais.
- [x] 8.7 Verificar que respostas e erros não contêm CPF completo, prontuário completo em erro, secrets ou payload rejeitado da IA.
- [x] 8.8 Documentar qualquer exceção de contrato ainda existente em `tasks/prd-psiqapp-mvp/bugs.md` ou equivalente.

## Critérios de sucesso

- Frontend consegue consumir todos os fluxos previstos por contrato estável.
- OpenAPI representa fielmente rotas, status e DTOs implementados.
- Idempotência tem comportamento consistente em todas as operações priorizadas.
- Falhas de geração aceitas anteriormente aparecem como estado de geração, não como erro retroativo de criação clínica.
- A task atua como gate de contrato, não como nova fase de desenvolvimento funcional.

## Testes obrigatórios

- [x] Testes de contrato HTTP para todas as rotas previstas na TechSpec.
- [x] Testes de paginação padrão, máximo e desempate estável.
- [x] Testes de idempotência por operação/paciente, mesmo payload e payload conflitante.
- [x] Testes de Problem Details sem dados sensíveis.
- [x] Testes de datas com offsets diferentes e saída UTC.
- [x] Validação automatizada do OpenAPI quando houver ferramenta disponível.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/PacienteControlador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/ConsultaControlador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/RegistroClinicoControlador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/AnaliseControlador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/dto/`
- `apps/backend/src/test/java/com/psiqapp/adaptador/in/web/`
- `apps/backend/src/main/resources/application.yml`
- `tasks/prd-psiqapp-mvp/bugs.md`
