# Task 5.0 - backend-clinical-records

## Objetivo

Implementar pareceres originais, complementos, linha do tempo append-only e criação automática da solicitação persistente de análise.

## Rastreabilidade

- PRD: RF-007, RF-008, RF-009, RF-010, RF-013, RF-020; RNF-002, RNF-003, RNF-006
- TechSpec: TS-007, TS-009, TS-010, TS-013, TS-021, TS-022, TS-023, TS-024, TS-025, TS-026, TS-027, TS-037, TS-038
- Critérios de aceite: AC-RF007-01 a AC-RF010-08; AC-RF013-01 a AC-RF013-04; AC-RF020-02, AC-RF020-03

## Dependências

- 1.0 infra-bootstrap
- 2.0 backend-bootstrap
- 4.0 backend-patient-appointment

## Escopo

- Modelo e persistência de `RegistroClinico` com tipos `ORIGINAL` e `COMPLEMENTO`.
- Regras append-only no backend e triggers PostgreSQL para impedir update/delete de registros clínicos.
- Associação opcional de parecer original a consulta do mesmo paciente.
- Complemento obrigatório para parecer original existente do mesmo paciente.
- Ordenação da linha do tempo por `dataHoraClinica DESC`, `criadoEm DESC` e desempate estável.
- Incremento de `revisaoClinica` do paciente e criação transacional de `GeracaoAnalise` ao salvar original ou complemento elegível.

## Fora do escopo da task

- Processamento da IA, provider externo, validação de resposta e persistência de análise concluída.
- Telas de prontuário.
- Regeneração manual completa.

## Subtarefas

- [x] 5.1 Criar domínio `RegistroClinico`, `TipoRegistroClinico`, `ParecerOriginal` e `Complemento`.
- [x] 5.2 Criar casos de uso `CriarParecerCasoDeUso`, `CriarComplementoCasoDeUso`, `ListarLinhaDoTempoCasoDeUso` e `ObterRegistroClinicoCasoDeUso`.
- [x] 5.3 Criar ports de persistência para registro clínico, geração de análise e execução transacional.
- [x] 5.4 Criar migrations para `registro_clinico`, revisão clínica do paciente e geração inicial.
- [x] 5.5 Criar triggers append-only para `registro_clinico`.
- [x] 5.6 Implementar criação atômica de registro, revisão e solicitação de geração.
- [x] 5.7 Implementar endpoints de criação/listagem/consulta de registros conforme TechSpec.
- [x] 5.8 Aplicar idempotência em parecer e complemento.

## Critérios de sucesso

- Parecer salvo nunca depende da conclusão ou disponibilidade da IA.
- Pareceres e complementos não podem ser atualizados ou excluídos, inclusive por SQL direto.
- Complemento só referencia parecer original do mesmo paciente.
- Linha do tempo respeita `dataHoraClinica` e `criadoEm`.
- Cada novo registro clínico cria uma geração automática com snapshot lógico congelado.
- Observações de consulta não entram na fonte clínica.

## Testes obrigatórios

- [x] Unitários de criação de parecer, complemento, datas e vínculos.
- [x] Integração com Testcontainers para constraints, triggers append-only, consulta do mesmo paciente e complemento apontando para complemento.
- [x] Testes de ordenação da linha do tempo, incluindo empate por `dataHoraClinica`.
- [x] Testes de snapshot: registro retroativo não altera gerações anteriores.
- [x] Testes de idempotência sem duplicar registro nem geração automática.
- [x] Testes HTTP para erros 400, 404 e 409 sem dados sensíveis.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/backend/src/main/java/com/psiqapp/dominio/modelo/RegistroClinico.java`
- `apps/backend/src/main/java/com/psiqapp/dominio/modelo/TipoRegistroClinico.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/usecase/CriarParecerCasoDeUso.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/usecase/CriarComplementoCasoDeUso.java`
- `apps/backend/src/main/java/com/psiqapp/aplicacao/usecase/ListarLinhaDoTempoCasoDeUso.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/in/web/RegistroClinicoControlador.java`
- `apps/backend/src/main/java/com/psiqapp/adaptador/out/persistence/EntidadeRegistroClinicoJpa.java`
- `apps/backend/src/main/resources/db/migration/V002__registros_clinicos_geracoes.sql`

