# Task 4.0 - backend-patient-appointment

## Objetivo

Implementar no backend cadastro, busca e visualização de pacientes, além de criação, agenda e transições finais de consultas.

## Rastreabilidade

- PRD: RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-020; RNF-001, RNF-003, RNF-006
- TechSpec: TS-006, TS-013, TS-024, TS-025, TS-026, TS-027, TS-028, TS-029, TS-037, TS-038
- Critérios de aceite: AC-RF001-01 a AC-RF006-06; AC-RF020-01

## Dependências

- 1.0 infra-bootstrap
- 2.0 backend-bootstrap

## Escopo

- Modelo de domínio, casos de uso, portas e adapters JPA para `Paciente` e `Consulta`.
- Migrations de tabelas, índices, constraints e idempotência aplicável.
- Endpoints REST para pacientes e consultas conforme TechSpec.
- Validações de CPF, e-mail, telefone brasileiro, nascimento, datas e status de consulta.
- Busca por nome normalizado, ignorando caixa e acentos, com paginação.

## Fora do escopo da task

- Registros clínicos, linha do tempo, análise de IA e worker.
- Frontend das telas.
- Autenticação ou múltiplos médicos.

## Subtarefas

- [ ] 4.1 Criar entidades de domínio `Paciente`, `Consulta` e `StatusConsulta`.
- [ ] 4.2 Criar casos de uso `CriarPacienteCasoDeUso`, `BuscarPacientesCasoDeUso`, `ObterPacienteCasoDeUso`, `CriarConsultaCasoDeUso`, `ListarConsultasCasoDeUso` e `AtualizarStatusConsultaCasoDeUso`.
- [ ] 4.3 Criar ports `RepositorioPacientePort`, `RepositorioConsultaPort` e `RepositorioIdempotenciaPort`.
- [ ] 4.4 Criar migrations para `paciente`, `consulta` e `idempotencia_operacao`.
- [ ] 4.5 Implementar adapters JPA com mapeadores manuais e queries parametrizadas.
- [ ] 4.6 Implementar controllers e DTOs em português: `PacienteControlador`, `ConsultaControlador`, `CriarPacienteRequisicao`, `ConsultaResposta`.
- [ ] 4.7 Aplicar idempotência em criação de paciente e consulta.

## Critérios de sucesso

- Pacientes são criados apenas com dados válidos, CPF único e opcionais vazios como `null`.
- Busca por nome é paginada, estável e resiliente a acentos, caixa e curingas literais.
- Consultas sempre nascem `AGENDADA`, inclusive retroativas.
- Status final não retorna para `AGENDADA` nem troca diretamente para outro final.
- Consultas de um paciente não aparecem em outro contexto.

## Testes obrigatórios

- [ ] Unitários de validação de CPF, e-mail, telefone, nascimento e status.
- [ ] Integração com Testcontainers para migrations, CPF único, busca normalizada, paginação e idempotência.
- [ ] Testes HTTP para 201, 200, 400, 404 e 409 com Problem Details.
- [ ] Testes de concorrência de CPF normalizado e idempotência.
- [ ] Testes de isolamento de consultas por paciente.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/backend/src/main/java/com/psiqapp/dominio/modelo/Paciente.java`
- `apps/backend/src/main/java/com/psiqapp/dominio/modelo/Consulta.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/usecase/CriarPacienteCasoDeUso.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/usecase/CriarConsultaCasoDeUso.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/PacienteControlador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/ConsultaControlador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/out/persistence/EntidadePacienteJpa.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/out/persistence/EntidadeConsultaJpa.java`
- `apps/backend/src/main/resources/db/migration/V001__pacientes_consultas_idempotencia.sql`

