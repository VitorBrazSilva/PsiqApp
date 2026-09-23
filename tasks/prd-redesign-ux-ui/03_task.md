# Task 3.0 — Redesign de IA, evidências e histórico de gerações

## Objetivo

Integrar a direção visual A aos estados de análise de IA, observações, evidências, fontes completas, regeneração e histórico de gerações, garantindo que cada versão histórica abra o conteúdo correto e nunca seja confundida com a análise atual.

## Rastreabilidade

- PRD: RF-009 a RF-013, RF-017 a RF-019, RNF-001 a RNF-008
- TechSpec: TS-007, TS-008, TS-009, TS-010, TS-011, TS-013, TS-014, TS-015
- Critérios de aceite: AC-RF009-01 a AC-RF013-06, AC-RF017-01 a AC-RF019-06
- Dados/endpoints: D-08 a D-15; E-11 a E-14 e E-17

## Dependências

- Task 1.0 concluída, incluindo contratos, paginação, idempotência e matriz.
- Task 2.0 concluída para garantir o contexto correto do paciente, registros e fontes.
- `AnaliseResponse.java`, `GeracaoAnaliseResponse.java`, controllers e testes de contrato atuais.
- `docs/redesign/analise-ia.md` e direção A em `docs/redesign/DESIGN.md`.

## Escopo

- Implementar o painel de estado distinguindo `analiseAtual`, `ultimaGeracao`, `geracaoAtiva`, `podeRegenerar` e `motivo`.
- Implementar polling cancelável, retomada ao retornar à aba, descarte de respostas obsoletas e proteção contra mistura de pacientes.
- Redesenhar análise atual e histórica com modo, datas, revisão, cobertura do snapshot, limitações e as três listas completas.
- Renderizar todas as observações, suas naturezas e evidências sem limite fixo, mantendo a distinção entre relato e interpretação.
- Permitir abrir cada evidência na fonte integral correta, preservando campo, citação, datas, humor, medicações, tipo, revisão e vínculos.
- Implementar regeneração segura, idempotente e independente do histórico anterior.
- Realizar o ajuste mínimo de contrato no backend para expor o vínculo estável entre geração concluída e análise, sem migration, mudança de conteúdo ou regra clínica.
- Abrir a análise histórica pelo vínculo explícito, validando paciente/geração e preservando URL, página, seleção e retorno.
- Atualizar a matriz de paridade com consumidores, testes e evidências desta task.

## Fora do escopo da task

- Alteração do conteúdo produzido pela IA, prompt, snapshot, persistência ou regra de suficiência longitudinal.
- Diagnóstico, prescrição, conduta clínica ou interpretação adicional no frontend.
- Migração de banco, novo endpoint paralelo ou autenticação.

## Subtarefas

- [ ] 3.1 Implementar estado da análise, polling e transições de operação.
- [ ] 3.2 Implementar painel atual, histórico paginado e regeneração idempotente.
- [ ] 3.3 Implementar observações, evidências e fonte integral com isolamento por paciente.
- [ ] 3.4 Expor e validar o vínculo mínimo geração → análise no contrato histórico e OpenAPI.
- [ ] 3.5 Implementar navegação/retorno da análise histórica sem substituir a análise atual.
- [ ] 3.6 Registrar na matriz cada campo, endpoint, teste e evidência visual/funcional.

## Critérios de sucesso

- Estados ativo, concluído, falho, ausente e impedido são compreensíveis e não se confundem.
- Falha da IA não apaga nem invalida o registro clínico salvo nem uma análise anterior válida.
- Toda observação pode ser rastreada às suas evidências e à fonte correta do mesmo paciente.
- O histórico preserva todos os metadados, paginação e abre a versão selecionada; geração sem vínculo não abre a análise atual silenciosamente.
- Regeneração não duplica solicitações nem substitui gerações anteriores.
- A apresentação mantém natureza, limitações e aviso de apoio à leitura, sem sugerir diagnóstico ou conduta.

## Testes obrigatórios

- [ ] Unitários: estados derivados, polling, cancelamento, resposta obsoleta, idempotência, listas completas e isolamento de evidências.
- [ ] Integração/contrato: E-11 a E-14, payload completo, `202`, `Location`, headers, vínculo histórico concluído/nulo/falho e paciente incompatível.
- [ ] Backend/OpenAPI: DTO/controller/use case do vínculo histórico sem alteração de persistência.
- [ ] E2E: estado ativo, retorno à aba, falha, regeneração, análise com múltiplas observações/evidências, fonte e análise histórica correta.
- [ ] Casos de erro: análise ausente, geração em execução/falha, 404/409, fonte de outro paciente e indisponibilidade.
- [ ] Visual/acessibilidade: teclado, foco, conteúdo longo e screenshots nas quatro larguras de aceite.

## Skills aplicáveis

- `ui-ux-pro-max`: acessibilidade, interação, estados assíncronos, dados e navegação de evidências.
- `frontend-design`: hierarquia clínica, distinção visual entre registro e conteúdo derivado de IA.

## Arquivos/módulos prováveis

- `apps/frontend/src/features/analises/*`
- `apps/frontend/src/features/registros-clinicos/*`
- `apps/frontend/src/shared/api/*` e `apps/frontend/src/shared/idempotencia/*`
- `apps/backend/src/main/java/com/psiqapp/adapter/in/web/*Response.java`
- `apps/backend/src/main/java/com/psiqapp/adapter/in/web/*Controller.java`
- Use cases/serviços de análise e testes de contrato em `apps/backend/src/test/**`
- `apps/frontend/e2e/*`
- `tasks/prd-redesign-ux-ui/parity-matrix.md`
