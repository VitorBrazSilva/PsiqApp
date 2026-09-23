# Task 2.0 — Redesign de Pacientes, Agenda e Prontuário

## Objetivo

Aplicar a direção visual A aos fluxos de Pacientes, Agenda e Prontuário, mantendo acessíveis todos os dados, vínculos, filtros, estados e ações existentes no backend e no frontend atual.

## Rastreabilidade

- PRD: RF-001 a RF-008, RF-014 a RF-018, RF-019, RNF-001, RNF-003, RNF-005, RNF-006
- TechSpec: TS-001, TS-002, TS-003, TS-004, TS-005, TS-006, TS-013, TS-015
- Critérios de aceite: AC-RF001-01 a AC-RF008-06, AC-RF014-01 a AC-RF018-06
- Dados/endpoints: D-01 a D-07, D-13 a D-15; E-01 a E-10 e E-15 a E-17

## Dependências

- Task 1.0 concluída, incluindo modelos, serviços, paginação e matriz inicial.
- Direção A em `docs/redesign/DESIGN.md` e protótipos locais em `docs/redesign/`.
- Regras de produto, privacidade, segurança clínica e testes em `.agents/rules/`.

## Escopo

- Reorganizar shell, rotas, navegação lateral desktop, navegação responsiva, breadcrumb, contexto do paciente e retorno por histórico do navegador.
- Redesenhar lista/busca/cadastro de pacientes, preservando nome, e-mail, CPF mascarado, dados completos, validações, erros, loading, vazio e sucesso.
- Redesenhar Agenda global e contextual, incluindo filtros de período/paciente, paginação, criação, observações, status, `criadaEm` e `statusAlteradoEm`.
- Redesenhar Dados pessoais, Histórico clínico, Novo parecer e Complemento, preservando texto integral, tipo, revisão, datas clínicas e de criação, humor, medicações, `consultaId` e `parecerOriginalId`.
- Permitir associação opcional de parecer à consulta correta e preservar rascunhos, falhas, idempotência e confirmação independente da IA.
- Adaptar a composição para 375, 768, 1024 e 1440 px sem rolagem horizontal nem ocultação de dados ou ações.
- Atualizar a matriz de paridade com componentes e evidências reais desta task.

## Fora do escopo da task

- Painel de análise, evidências, regeneração e abertura de análise histórica.
- Criação de autenticação, perfis adicionais ou nova regra clínica.
- Edição de paciente ou de registros já salvos quando essa capacidade não existe no MVP.

## Subtarefas

- [ ] 2.1 Aplicar shell, rotas, contexto e estados de navegação.
- [ ] 2.2 Implementar Pacientes, cadastro, busca e paginação usando contratos completos.
- [ ] 2.3 Implementar Agenda global/contextual, filtros, criação e transições válidas de status.
- [ ] 2.4 Implementar Dados pessoais e Histórico clínico com fonte integral e continuidade.
- [ ] 2.5 Implementar formulários de parecer/complemento com vínculo correto e preservação de rascunho.
- [ ] 2.6 Registrar na matriz cada campo, endpoint, teste e evidência visual/funcional.

## Critérios de sucesso

- O médico identifica sempre o paciente correto e consegue distinguir homônimos.
- Nenhum campo clínico ou cadastral é removido para caber no layout; detalhes contextuais continuam navegáveis.
- Registros fora da primeira página e fontes completas podem ser alcançados.
- Parecer salvo continua confirmado mesmo quando a IA está em processamento, indisponível ou falha.
- Agenda preserva filtros, estados, metadados e regras de transição.
- Fluxos passam por teclado e funcionam nas quatro larguras de aceite.

## Testes obrigatórios

- [ ] Unitários: validações, labels, estados vazios/erro/loading, ordenação, vínculos e preservação de rascunho.
- [ ] Integração: payload completo de cadastro, consulta, parecer, complemento, listagens e fonte integral.
- [ ] E2E: buscar/paginar/cadastrar paciente, homônimo, agendar, filtrar, alterar status, parecer com consulta, complemento e fonte fora da primeira página.
- [ ] Casos de erro: CPF/e-mail/telefone/data inválidos, 404, 409, falha de rede, paciente indisponível e resposta concorrente de busca.
- [ ] Visual/acessibilidade: screenshots e navegação por teclado em 375, 768, 1024 e 1440 px.

## Skills aplicáveis

- `ui-ux-pro-max`: acessibilidade, interação, layout responsivo, formulários e estados.
- `frontend-design`: direção visual clínica distinta, hierarquia tipográfica e leitura integral.

## Arquivos/módulos prováveis

- `apps/frontend/src/app/*` e `apps/frontend/src/styles.css`
- `apps/frontend/src/features/pacientes/*`
- `apps/frontend/src/features/consultas/*`
- `apps/frontend/src/features/registros-clinicos/*`
- `apps/frontend/src/shared/componentes/*`
- Testes unitários, integração e E2E em `apps/frontend/src/**` e `apps/frontend/e2e/**`
- `tasks/prd-redesign-ux-ui/parity-matrix.md`
