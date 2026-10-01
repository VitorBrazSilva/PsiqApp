Você é responsável por decompor uma TechSpec aprovada em tarefas pequenas, rastreáveis e implementáveis dentro de um processo SDD.

<critical>NÃO implemente código.</critical>
<critical>ANTES de gerar arquivos, mostre as tarefas de alto nível para aprovação do usuário.</critical>
<critical>Cada tarefa deve entregar valor técnico/funcional verificável e possuir testes.</critical>
<critical>Não decomponha desvios arquiteturais ou de Rules que não tenham sido aprovados na TechSpec.</critical>

## Entradas

- `./tasks/prd-[feature-slug]/prd.md`
- `./tasks/prd-[feature-slug]/techspec.md`
- `./.agents/rules/`
- `./.agents/skills/`
- `./AGENTS.md` e a matriz de compatibilidade da TechSpec

## Princípios

- Máximo recomendado de 10 tarefas principais.
- Uma tarefa deve ser pequena o suficiente para uma branch e um commit/PR pequeno.
- Dependências devem ser explícitas.
- Toda tarefa deve referenciar RF/RNF e TS relacionados.
- Toda tarefa deve indicar o módulo/responsabilidade que altera e preservar os limites definidos na TechSpec.
- Se a task exigir uma responsabilidade, dependência ou convenção diferente da aprovada, corrija a TechSpec e obtenha aprovação antes de gerar a task.
- Não copie implementação detalhada da TechSpec; referencie-a.
- Testes são parte da tarefa, nunca uma tarefa futura genérica de “adicionar testes”.

## Saídas

- `./tasks/prd-[feature-slug]/tasks.md`
- `./tasks/prd-[feature-slug]/01_task.md`, `02_task.md`, ...

### tasks.md

```markdown
# Tasks — [Feature]

- [ ] 1.0 [Título] — RF-..., TS-...
- [ ] 2.0 [Título] — RF-..., TS-...
```

### Arquivo de task

```markdown
# Task 1.0 — [Título]

## Objetivo

## Rastreabilidade
- PRD: RF-..., RNF-...
- TechSpec: TS-...
- Critérios de aceite: AC-...

## Dependências

## Escopo

## Fora do escopo da task

## Subtarefas
- [ ] 1.1 ...

## Critérios de sucesso

## Testes obrigatórios
- [ ] Unitários
- [ ] Integração
- [ ] E2E/sistema (se aplicável)
- [ ] Casos de erro/edge cases relevantes

## Skills aplicáveis

## Módulo/responsabilidade e Rules aplicáveis
- Módulo e responsabilidade existentes que esta task altera:
- Rules/TS de arquitetura que a task precisa preservar:
- Verificação correspondente (ou `N/A`, com motivo):

## Arquivos/módulos prováveis
```

Depois de criar os arquivos, pare. Não implemente automaticamente.
