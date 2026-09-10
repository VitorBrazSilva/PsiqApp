# Task 11.0 - qa-integration

## Objetivo

Validar o MVP integrado de ponta a ponta, cobrindo fluxos principais, invariantes clínicos, privacidade, falhas de IA, isolamento por paciente e volumes iniciais de validação com dados fictícios.

## Rastreabilidade

- PRD: RF-001 a RF-020; RNF-001 a RNF-008
- TechSpec: TS-002, TS-032, TS-036, TS-038
- Critérios de aceite: todos os critérios de aceite aplicáveis aos fluxos integrados do MVP

## Dependências

- 1.0 infra-bootstrap
- 2.0 backend-bootstrap
- 3.0 frontend-bootstrap
- 4.0 backend-patient-appointment
- 5.0 backend-clinical-records
- 6.0 backend-analysis-core
- 7.0 backend-analysis-worker
- 8.0 backend-api-contract-validation
- 9.0 frontend-patient-appointment
- 10.0 frontend-clinical-analysis

## Escopo

- E2E com Playwright para cadastro/busca de paciente, agenda, prontuário, parecer, complemento, análise, evidência e falha de IA.
- Testes integrados com Compose/PostgreSQL e backend/frontend locais.
- Massa de teste exclusivamente fictícia.
- Cenários adversariais de segurança clínica e privacidade operacional.
- Verificação de documentação final do estado implementado.
- Registro de bugs em `tasks/prd-psiqapp-mvp/bugs.md` quando encontrados.

## Fora do escopo da task

- Implementar novas funcionalidades não previstas nas tasks anteriores.
- Testar provider real sem autorização explícita.
- Certificar uso em produção com dados reais.

## Subtarefas

- [ ] 11.1 Criar fixtures fictícias para pacientes, consultas e registros clínicos.
- [ ] 11.2 Criar suíte E2E Playwright para fluxos principais do médico.
- [ ] 11.3 Criar cenários integrados de zero, um e dois ou mais pareceres originais com complementos.
- [ ] 11.4 Validar falhas de provider, timeout, resposta inválida e preservação do prontuário.
- [ ] 11.5 Validar isolamento por paciente em consultas, registros, contexto de IA, evidências e análises.
- [ ] 11.6 Validar aviso persistente de dados fictícios em todas as telas relevantes.
- [ ] 11.7 Validar ausência de dados sensíveis em logs, erros e documentação.
- [ ] 11.8 Executar checks completos de backend, frontend, migrations, build e E2E.
- [ ] 11.9 Executar o project-documentation-maintainer e validar que README.md, docs/BUSINESS.md e docs/TECHNICAL.md refletem somente o estado real implementado.

## Critérios de sucesso

- Fluxos principais do MVP passam de ponta a ponta em ambiente local.
- Invariantes append-only, snapshot, análise atual, isolamento e segurança clínica são demonstrados por testes.
- Falhas de IA não causam perda, alteração ou ocultação indevida de dados clínicos.
- Nenhum teste automatizado depende de rede externa.
- Documentação final não apresenta planos como implementação pronta.

## Testes obrigatórios

- [ ] E2E de cadastro, busca, abertura de prontuário e agenda.
- [ ] E2E de parecer, complemento, linha do tempo e evidência.
- [ ] E2E de geração em andamento, conclusão, falha e retry manual.
- [ ] Integração backend com PostgreSQL via Compose/Testcontainers.
- [ ] Validação de volumes representativos de RNF-008 com dados fictícios.
- [ ] Varredura de logs/erros para prontuário completo, CPF completo, resposta clínica integral de IA e secrets.
- [ ] Checks completos de backend e frontend.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/frontend/e2e/fluxoPacienteAgenda.spec.ts`
- `apps/frontend/e2e/fluxoProntuarioAnalise.spec.ts`
- `apps/frontend/e2e/falhasIaPrivacidade.spec.ts`
- `apps/backend/src/test/java/com/psiqapp/integracao/`
- `tasks/prd-psiqapp-mvp/bugs.md`
- `README.md`
- `docs/BUSINESS.md`
- `docs/TECHNICAL.md`
