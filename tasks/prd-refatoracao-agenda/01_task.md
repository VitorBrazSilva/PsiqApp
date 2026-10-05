# Task 1.0 — Cadastro sob demanda e organização da Agenda

## Objetivo

Priorizar a leitura da Agenda, abrir cadastro por ação e aplicar o padrão de próxima consulta/lateral do prontuário.

## Rastreabilidade

- PRD: RF-001/002/003, RNF-001/002.
- TechSpec: TS-001/002/003.
- Critérios de aceite: AC-RF001-01/02/03, AC-RF002-01/02, AC-RF003-01/02/03.

## Dependências

PRD/spec-review e TechSpec prontos; componentes existentes de consultas.

## Escopo

Composição, estilos, reuso de diálogo/destaque, testes afetados e documentação do comportamento final.

## Fora do escopo da task

Backend, novas bibliotecas, contratos HTTP, regra clínica/IA, mudança de arquitetura global e conexão Google real.

## Subtarefas

- [x] 1.1 Reutilizar o diálogo na Agenda e remover cadastro permanentemente montado.
- [x] 1.2 Organizar lista e integração em colunas responsivas.
- [x] 1.3 Reutilizar apresentação e leitura de próxima consulta, independente da lista.
- [x] 1.4 Adaptar/validar testes e capturar evidências visuais.
- [x] 1.5 Realizar task review, code review, manutenção documental, QA e feature review.

## Critérios de sucesso

Todos os ACs cobertos, checks frontend aprovados e ausência de blocker.

## Testes obrigatórios

- [x] Unitários/integração frontend (Vitest completo).
- [x] Typecheck, lint e build.
- [x] E2E Google e busca mensal com API fake; layout/teclado da Agenda e regressão do prontuário.
- [x] Ausência/erro/retry, troca de paciente e renovação de próxima consulta.
- Backend/migrações/ArchUnit: N/A, sem alteração de backend ou fronteiras.

## Skills aplicáveis

frontend-design, ui-ux-pro-max.

## Módulo/responsabilidade e Rules aplicáveis

- `features/consultas`: apresentação, ciclo de leitura e agendamento existentes.
- Rules: architecture-boundaries, product-invariants, clinical-data-privacy, testing-quality, documentation-maintenance.
- Verificação: diff/manual das fronteiras, Vitest/Playwright existentes, sem alegar ferramenta arquitetural frontend ausente.

## Arquivos/módulos prováveis

Os listados em TechSpec §17. Artefatos desta task ficam nesta pasta, separados das fontes canônicas.
