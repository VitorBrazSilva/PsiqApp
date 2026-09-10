Você é responsável por implementar exatamente uma task SDD por vez.

<critical>Implemente somente uma task principal por execução.</critical>
<critical>Leia PRD, TechSpec, task, rules e skills aplicáveis antes de alterar código.</critical>
<critical>NÃO introduza comportamento fora da especificação sem registrar a necessidade.</critical>
<critical>Todos os testes aplicáveis devem passar antes da conclusão.</critical>
<critical>A task só pode ser concluída após aprovação do task-reviewer e ausência de blockers no code-reviewer.</critical>
<critical>Após aprovação dos reviews/testes e antes do commit final, execute obrigatoriamente project-documentation-maintainer.</critical>

## Entradas

- `./tasks/prd-[feature-slug]/prd.md`
- `./tasks/prd-[feature-slug]/techspec.md`
- `./tasks/prd-[feature-slug]/tasks.md`
- `./tasks/prd-[feature-slug]/NN_task.md`
- `./.agents/rules/`
- `./.agents/skills/`
- `./docs/BUSINESS.md`, quando existir
- `./docs/TECHNICAL.md`, quando existir
- `./README.md`, quando existir

## Lifecycle obrigatório da task

1. Identifique a próxima task não concluída ou a task explicitamente informada.
2. Leia sua rastreabilidade RF/RNF/AC/TS.
3. Explore o código impactado.
4. Carregue skills e documentação técnica necessárias.
5. Crie uma branch dedicada, com nome curto e relacionado à task, se ainda não estiver em branch apropriada.
6. Apresente um resumo e plano curto.
7. Implemente apenas o escopo da task.
8. Adicione/ajuste os testes definidos pela task.
9. Execute typecheck/lint/build/testes disponíveis e relevantes.
10. Execute `task-reviewer`.
11. Corrija todos os problemas bloqueantes apontados pelo `task-reviewer`
    e repita testes/review necessários até aprovação.
12. Execute `code-reviewer`.
13. Corrija todos os problemas BLOCKER apontados pelo `code-reviewer`
    que pertençam ao escopo da task.
14. Após correções técnicas, execute novamente os testes/checks afetados
    e repita o `code-reviewer` até não haver blockers.
15. Execute obrigatoriamente `project-documentation-maintainer`.
16. Verifique o diff final incluindo documentação e confirme que nenhuma
    alteração contradiz código, PRD, TechSpec ou Rules.
17. Marque a task como concluída em tasks.md e no arquivo da task.
18. Crie um commit pequeno e bem nomeado relacionado à task.
19. Informe branch, commit, testes executados, reviews realizados,
    documentação atualizada e rastreabilidade atendida.

## Regra de documentação viva

O commit final da task deve deixar o repositório documentalmente coerente com o estado atual.

- Mudança funcional/de domínio -> avaliar `docs/BUSINESS.md`.
- Mudança técnica/arquitetural -> avaliar `docs/TECHNICAL.md`.
- Mudança de setup/execução/testes -> avaliar `README.md`.
- Sem impacto documental real -> não alterar documentos artificialmente.

## Regra de ouro

`1 task principal = 1 branch dedicada = 1 entrega pequena = testes = review = documentação viva = 1 commit coeso`.

Não agrupe tasks futuras “por conveniência”.
