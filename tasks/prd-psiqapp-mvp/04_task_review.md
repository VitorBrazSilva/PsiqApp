# Review - Task 04

## Status

APROVADO

Revisao executada em 2026-09-11 segundo `sdd-workflow/execute_task.md`, sobre a branch `task/04-backend-patient-appointment`.

## Evidencia final

Em `apps/backend`, com `JAVA_HOME` apontando para `.cache/backend-tools/jdk-21.0.12.1+1`:

- `./mvnw.cmd verify`: aprovado.
- Unitarios: 17 testes, 0 falhas.
- Integracao/Testcontainers: 8 testes, 0 falhas.

A revisao inicial encontrou lacunas de cobertura para concorrencia de idempotencia, paginacao/busca literal, transicoes de status e Problem Details. Todas foram cobertas antes do veredito final em `PatientAppointmentIT`, `NormalizadoresTest` e `TratadorDeErrosHttpTest`.

## Rastreabilidade

| Origem | ID | Status | Evidencia |
|---|---|---|---|
| PRD | RF-001 | Atendido | `PacienteControlador`, `CriarPacienteCasoDeUso`, validacao de nome/CPF/nascimento/telefone/e-mail, CPF unico e HTTP 201/400/409 em `PatientAppointmentIT`. |
| PRD | RF-002 | Atendido | `BuscarPacientesCasoDeUso`, coluna `search_name`, busca paginada e normalizada; teste encontra nome com acento por termo sem acento e cobre `%` literal. |
| PRD | RF-003 | Atendido | `GET /api/v1/patients/{id}` retorna dados basicos e opcionais vazios persistidos como `null`. |
| PRD | RF-004 | Atendido | `POST /api/v1/patients/{id}/appointments` cria consulta `AGENDADA`, aceita data retroativa e preserva observacoes opcionais. |
| PRD | RF-005 | Atendido | `GET /api/v1/appointments?from&to&patientId&page&size` lista agenda com paginacao, ordenacao estavel e filtro por paciente. |
| PRD | RF-006 | Atendido | `POST /api/v1/appointments/{id}/status` permite transicoes finais `REALIZADA`, `CANCELADA` e `FALTA`, rejeita retorno a `AGENDADA` e rejeita troca final->final. |
| PRD | RF-020-01 | Atendido | Teste de isolamento comprova que consulta de um paciente nao aparece no contexto de outro paciente. |
| PRD | RNF-001 | Atendido no backend | Contratos REST usam DTOs em portugues e erros padronizados; frontend permanece fora do escopo. |
| PRD | RNF-003 | Atendido no escopo | `created_at`, `scheduled_at`, `status_changed_at`, CPF unico e metadados de idempotencia persistidos. |
| PRD | RNF-006 | Atendido | Problem Details nao ecoa valores rejeitados; testes conferem ausencia de CPF invalido no erro. |
| TechSpec | TS-006 | Atendido | Dominio separado de JPA; adapters em `adaptador/out/persistence`, mapeamento manual e ports em `aplicacao/port`. |
| TechSpec | TS-013 | Atendido no escopo | `Idempotency-Key` obrigatoria em criacao de paciente e consulta; mesma chave/payload retorna recurso original; payload diferente retorna 409. |
| TechSpec | TS-024 | Atendido | Controllers REST sob `/api/v1`, DTOs separados do dominio, criacoes 201 e alteracao de status 200. |
| TechSpec | TS-025 | Atendido | `ValidacaoException`, `RecursoNaoEncontradoException`, `ConflitoException` e constraint violation mapeadas para Problem Details 400/404/409. |
| TechSpec | TS-026 | Atendido | `page` inicia em 0, `size` padrao 25, maximo 100, ordenacao estavel por nome/ID e agenda por data/ID. |
| TechSpec | TS-027 | Atendido | `Instant` para consulta/criacao/status, `LocalDate` para nascimento e `Clock` injetado nos casos de uso. |
| TechSpec | TS-028 | Atendido | Normalizacao e validacao de CPF, e-mail, nascimento e telefone brasileiro em `Normalizadores`. |
| TechSpec | TS-029 | Atendido | Busca por `search_name`, normalizacao Unicode, escape/tratamento literal de `%`, `_` e `\`, e query parametrizada. |
| TechSpec | TS-037 | Atendido no escopo | Migration cria `patient`, `appointment` e `idempotency_record` com indices, FK, checks e unicidade necessarios. |
| TechSpec | TS-038 | Atendido no escopo | Rotas da Task 04 expostas; rotas de registros clinicos/analises permanecem ausentes. |

## Veredito

Task 04 aprovada no escopo especificado. Nao ha blockers pendentes.
