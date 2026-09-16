# Task 10.0 - frontend-clinical-analysis

**Status: CONCLUÍDA em 2026-09-16.** Testes aprovados, task-reviewer aprovado, code-reviewer sem blockers e manutenção documental concluída.

## Objetivo

Implementar no frontend a linha do tempo do prontuário, registro de pareceres e complementos, análise atual, histórico, evidências e estados de geração de IA.

## Rastreabilidade

- PRD: RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013, RF-014, RF-015, RF-016, RF-017, RF-018, RF-019, RF-020; RNF-001, RNF-002, RNF-004, RNF-005
- TechSpec: TS-004, TS-030, TS-031, TS-038
- Critérios de aceite: AC-RF007-01 a AC-RF019-10; AC-RF020-02 a AC-RF020-05

## Dependências

- 3.0 frontend-bootstrap
- 5.0 backend-clinical-records
- 7.0 backend-analysis-worker
- 8.0 backend-api-contract-validation

## Escopo

- Formulários de parecer original e complemento com `dataHoraClinica`, texto obrigatório, humor e medicações.
- Linha do tempo clínica descendente com identificação de complementos e relação com consulta/original.
- Exibição da análise atual, limitações, linha do tempo resumida, padrões, pontos de atenção e evidências.
- Abertura do registro clínico original a partir de evidências.
- Histórico de gerações e estado de geração ativa/falha.
- Polling de análise a cada 3s somente quando aplicável e aba visível.
- Regeneração manual quando permitida pela API.

## Fora do escopo da task

- Alterar regras de IA no backend.
- Testes reais contra provider externo.
- Dashboard avançado, prescrição, diagnóstico ou recomendações terapêuticas.

## Subtarefas

- [x] 10.1 Criar componentes `FormularioParecer`, `FormularioComplemento` e `LinhaDoTempoClinica`.
- [x] 10.2 Criar componentes `PainelAnaliseAtual`, `HistoricoGeracoes`, `ListaEvidencias` e `FonteRegistroClinico`.
- [x] 10.3 Criar serviços `servicoRegistrosClinicos` e `servicoAnalises`.
- [x] 10.4 Implementar polling com pausa em aba oculta, sem sobreposição e com descarte de resposta atrasada de outro paciente.
- [x] 10.5 Preservar análise válida anterior quando geração falha ou está em andamento.
- [x] 10.6 Garantir que seções vazias exibam mensagens fixas sem inventar conteúdo clínico.
- [x] 10.7 Exibir limitações da IA de forma persistente dentro da análise.
- [x] 10.8 Garantir que atualização de análise não sobrescreva formulário clínico em edição.

## Critérios de sucesso

- Médico registra parecer/complemento e continua usando o prontuário enquanto a análise é gerada.
- Linha do tempo preserva original e complementos de forma rastreável.
- Análise atual deixa claros limites, suficiência de histórico e evidências.
- Evidências levam ao registro clínico correspondente do mesmo paciente.
- Falhas de IA são compreensíveis e não removem análise válida anterior.

## Testes obrigatórios

- [x] Testes de formulário para texto obrigatório, datas clínicas e idempotência de submissão.
- [x] Testes de linha do tempo com original, complemento e estado vazio.
- [x] Testes de polling com timers controlados, aba oculta, retorno à aba e ausência de sobreposição.
- [x] Testes de descarte de resposta atrasada de outro paciente.
- [x] Testes de análise `SUMMARY_ONLY` sem falsa tendência e `LONGITUDINAL` com evidências.
- [x] Testes de falha preservando análise válida anterior e formulário em edição.
- [x] Build e typecheck frontend.

## Skills aplicáveis

- Nenhuma skill local em `.agents/skills/` foi encontrada.

## Arquivos/módulos prováveis

- `apps/frontend/src/features/prontuario/LinhaDoTempoClinica.tsx`
- `apps/frontend/src/features/prontuario/FormularioParecer.tsx`
- `apps/frontend/src/features/prontuario/FormularioComplemento.tsx`
- `apps/frontend/src/features/prontuario/servicoRegistrosClinicos.ts`
- `apps/frontend/src/features/analises/PainelAnaliseAtual.tsx`
- `apps/frontend/src/features/analises/HistoricoGeracoes.tsx`
- `apps/frontend/src/features/analises/ListaEvidencias.tsx`
- `apps/frontend/src/features/analises/servicoAnalises.ts`
- `apps/frontend/src/features/analises/usePollingAnalise.ts`

