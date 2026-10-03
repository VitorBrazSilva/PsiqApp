# Task 1.0 — Compor painel de consultas do prontuário

## Objetivo

Entregar a refatoração visual autorizada e validar a leitura/atualização dos dados de agenda do paciente.

## Rastreabilidade

- PRD: RF-001, RF-002, RF-003, RNF-001, RNF-002.
- TechSpec: TS-001, TS-002, TS-003, TS-004.
- Critérios: AC-RF001-01/02, AC-RF002-01/02/03, AC-RF003-01/02/03/04/05.

## Dependências

PRD com spec-review aprovado; contratos e componentes existentes. Não depende de outra task.

## Escopo

Próxima consulta compartilhada, lista em painel branco com ação existente e resumo do paciente à direita. Uma branch dedicada; testes e revisão fazem parte da mesma task.

## Fora do escopo da task

Agenda global, backend, regras de consulta, IA, novos gráficos e publicação remota.

## Subtarefas

- [x] 1.1 Ler resumo completo do paciente e preservar contexto assíncrono.
- [x] 1.2 Reusar contexto de próxima consulta e compor lista/resumo.
- [x] 1.3 Aplicar estilos locais responsivos.
- [x] 1.4 Validar comportamento, regressões e imagens.
- [x] 1.5 Executar task/code reviews e manutenção documental.

## Critérios de sucesso

ACs atendidos; checks frontend aprovados; nenhum blocker nos reviews; documentação coerente; QA visual concluído.

## Testes obrigatórios

- [x] Unitários: contagens, isolamento, falha e tempo do resumo.
- [x] Integração: resumo acompanha status e não muda com filtros.
- [x] E2E/sistema: painel branco, posição/empilhamento, overflow, teclado/agendamento.
- [x] Typecheck, lint, suíte Vitest e build.

## Skills aplicáveis

frontend-design; ui-ux-pro-max; revisão pertinente de Web Interface Guidelines.

## Módulo/responsabilidade e Rules aplicáveis

`features/consultas` preserva agenda; `features/registros-clinicos` preserva composição de prontuário. Rules e verificações estão na matriz da TechSpec. Não há mudança de dependência global; revisão manual sem alegar automação arquitetural inexistente.

## Arquivos/módulos prováveis

Os módulos indicados na seção 17 da TechSpec, seus testes e documentação aplicável.

## Conclusão

Concluída após 81 testes Vitest, sete E2E finais com APIs simuladas, conferência somente leitura da URL solicitada, checks estáticos, reviews e manutenção documental. Evidências e ocorrências operacionais estão em qa-report.md e bugs.md. Entrega local na branch `task/01-painel-consultas-prontuario`.

## Complemento autorizado na mesma entrega

Rastreabilidade adicional: RF-004, AC-RF004-01 a 05, TS-005, RNF-001/002. O usuário solicitou aproveitar a mesma entrega para aperfeiçoar o agendamento conforme `tmp/agenda.png` e o hover dos grupos. O formulário compartilhado da Agenda passa a integrar o escopo visual; backend e cadastro manual continuam fora da mudança.

- [x] 1.6 Ajustar cabeçalho, etapas, ícones, revisão, ações e hover.
- [x] 1.7 Ocultar madrugada consistentemente na busca e validar datas/estado vazio.
- [x] 1.8 Conferir fluxos simulados, responsividade, reviews e documentação do complemento.

Estado do complemento: concluído após 82 testes Vitest, oito E2E com APIs simuladas, revisão visual das quatro larguras, checks estáticos/build e conferência somente leitura do frontend Docker atualizado. Permanece ligado à task 1.0 e à branch existente; detalhes nos reviews e qa-report.md.
