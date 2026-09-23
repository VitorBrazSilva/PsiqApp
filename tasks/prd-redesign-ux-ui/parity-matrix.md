# Matriz de paridade — Task 1.0

Status `implementado` indica contrato e destino preparado nesta task; a validação visual das telas pertence às Tasks 2.0/3.0.

| ID | Campo/capacidade | Consumidor | Arquivo/componente | Teste | Evidência | Status |
|---|---|---|---|---|---|---|
| D-01 | campos de cadastro | Pacientes | `servicoPacientes.ts` | `PaginaPacientes.test.tsx` | payload completo | implementado |
| D-02 | paciente completo | Pacientes/Prontuário | `servicoPacientes.ts` | `clienteApi.test.ts` | contrato preservado | implementado |
| D-03 | entrada/status de consulta | Agenda | `servicoConsultas.ts` | `PaginaAgenda.test.tsx` | payload/status | implementado |
| D-04 | consulta e nulos | Agenda/Prontuário | `servicoConsultas.ts` | `PaginaAgenda.test.tsx` | estados finais | implementado |
| D-05 | entrada clínica | Prontuário | `servicoRegistrosClinicos.ts` | `PaginaProntuario.test.tsx` | corpo completo | implementado |
| D-06 | registro clínico completo | Linha do tempo | `servicoRegistrosClinicos.ts` | `PaginaProntuario.test.tsx` | página/fonte | implementado |
| D-07 | registro + geração | Prontuário/IA | `servicoRegistrosClinicos.ts` | contrato planejado | resposta integral | implementado |
| D-08 | estado de IA | Painel IA | `servicoAnalises.ts` | `PaginaProntuario.test.tsx` | estados distintos | implementado |
| D-09 | geração e sequência | Histórico IA | `servicoAnalises.ts` | normalizador | `sequenciaRequest` | implementado |
| D-10 | análise integral | Painel/histórico | `servicoAnalises.ts` | contrato planejado | endpoint histórico | implementado |
| D-11 | itens sem limite fixo | Observações | `servicoAnalises.ts` | contrato planejado | listas preservadas | implementado |
| D-12 | evidências | Fonte | `servicoAnalises.ts` | contrato planejado | vínculo preservado | implementado |
| D-13 | paginação/filtros | Listas | `contratos.ts` + serviços | `contratos.test.ts` | 2ª/última página | implementado |
| D-14 | Problem Details seguro | Alertas/campos | `erroApi.ts` | `clienteApi.test.ts` | sem texto sensível | implementado |
| D-15 | headers/status | Cliente API | `clienteApi.ts` | `clienteApi.test.ts` | request/location | implementado |
| E-01 | POST pacientes | Pacientes | `servicoPacientes.ts` | contrato | POST/idempotência | implementado |
| E-02 | GET pacientes | Pacientes | `servicoPacientes.ts` | contrato | query paginada | implementado |
| E-03 | GET paciente | Prontuário | `servicoPacientes.ts` | contrato | retorno completo | implementado |
| E-04 | POST consulta | Agenda | `servicoConsultas.ts` | contrato | POST/idempotência | implementado |
| E-05 | GET consultas | Agenda | `servicoConsultas.ts` | contrato | filtros/página | implementado |
| E-06 | POST status | Agenda | `servicoConsultas.ts` | contrato | status | implementado |
| E-07 | POST parecer | Prontuário | `servicoRegistrosClinicos.ts` | contrato | registro/geração | implementado |
| E-08 | POST complemento | Prontuário | `servicoRegistrosClinicos.ts` | contrato | vínculo/geração | implementado |
| E-09 | GET registros | Linha do tempo | `servicoRegistrosClinicos.ts` | contrato | página | implementado |
| E-10 | GET fonte | Evidência | `servicoRegistrosClinicos.ts` | contrato | conteúdo integral | implementado |
| E-11 | GET estado IA | Painel IA | `servicoAnalises.ts` | contrato | estado atual | implementado |
| E-12 | GET gerações | Histórico IA | `servicoAnalises.ts` | contrato | página | implementado |
| E-13 | GET análise histórica | Histórico IA | `servicoAnalises.ts` | contrato | endpoint dedicado | implementado |
| E-14 | POST regeneração | Painel IA | `servicoAnalises.ts` | contrato | idempotência | implementado |
| E-15 | GET health | Operacional | backend `/api/v1` | operacional | readiness | planejado |
| E-16 | GET readiness | Operacional | backend `/api/v1` | operacional | readiness | planejado |
| E-17 | GET openapi | Operacional | backend `/api/v1` | operacional | OpenAPI | planejado |
