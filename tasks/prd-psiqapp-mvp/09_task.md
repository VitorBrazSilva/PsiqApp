# Task 9.0 - frontend-patient-appointment

## Objetivo

Implementar no frontend os fluxos de cadastro, busca, dados do paciente, criação de consulta, agenda e atualização de status.

## Rastreabilidade

- PRD: RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-020; RNF-001, RNF-004
- TechSpec: TS-004, TS-024, TS-025, TS-026, TS-027, TS-028, TS-029, TS-030, TS-031, TS-038
- Critérios de aceite: AC-RF001-01 a AC-RF006-06; AC-RF020-01

## Dependências

- 3.0 frontend-bootstrap
- 4.0 backend-patient-appointment
- 8.0 backend-api-contract-validation

## Escopo

- Telas e componentes de pacientes e agenda consumindo API real.
- Formulários com validação de campos obrigatórios, CPF, e-mail, telefone e nascimento.
- Busca por nome com estados carregando, vazio e erro.
- Página de prontuário com dados básicos e agenda do paciente.
- Criação de consultas retroativas e transição de status final.
- Tratamento visual de Problem Details e mensagens de campo.

## Fora do escopo da task

- Linha do tempo clínica, pareceres, complementos e análise de IA.
- Autenticação, portal do paciente ou integrações externas.

## Subtarefas

- [ ] 9.1 Criar feature `pacientes` com `PaginaPacientes`, `FormularioPaciente`, `ListaPacientes` e `DadosPaciente`.
- [ ] 9.2 Criar feature `consultas` com `PaginaAgenda`, `FormularioConsulta`, `ListaConsultas` e `SeletorStatusConsulta`.
- [ ] 9.3 Implementar serviços `servicoPacientes` e `servicoConsultas`.
- [ ] 9.4 Implementar validação client-side coerente com o backend, sem substituir validação do servidor.
- [ ] 9.5 Implementar estados de carregamento, vazio e erro compreensíveis.
- [ ] 9.6 Garantir navegação da busca para o prontuário do paciente.
- [ ] 9.7 Garantir que o aviso persistente de dados fictícios permaneça visível nos fluxos.

## Critérios de sucesso

- Médico consegue cadastrar, buscar e abrir paciente sem auxílio técnico direto.
- Consulta criada aparece na agenda e no contexto do paciente.
- Transições de status respeitam estados finais e exibem erros do backend.
- Mensagens de validação são claras e não exibem dados sensíveis indevidos.

## Testes obrigatórios

- [ ] Unitários/componentes para formulário de paciente e consulta.
- [ ] Testes de cliente para Problem Details e erros de campo.
- [ ] Testes de busca com estado vazio e seleção de paciente.
- [ ] Testes de transição de status final.
- [ ] Build e typecheck frontend.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/frontend/src/features/pacientes/PaginaPacientes.tsx`
- `apps/frontend/src/features/pacientes/FormularioPaciente.tsx`
- `apps/frontend/src/features/pacientes/servicoPacientes.ts`
- `apps/frontend/src/features/prontuario/PaginaProntuario.tsx`
- `apps/frontend/src/features/consultas/PaginaAgenda.tsx`
- `apps/frontend/src/features/consultas/FormularioConsulta.tsx`
- `apps/frontend/src/features/consultas/servicoConsultas.ts`
- `apps/frontend/src/shared/formularios/errosDeCampo.ts`

