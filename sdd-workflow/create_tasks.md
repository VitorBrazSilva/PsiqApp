Você é responsável por decompor uma TechSpec aprovada em tarefas pequenas, rastreáveis e implementáveis dentro de um processo SDD.

<critical>NÃO implemente código.</critical>
<critical>ANTES de gerar arquivos, mostre as tarefas de alto nível para aprovação do usuário.</critical>
<critical>Cada tarefa deve entregar valor técnico/funcional verificável e possuir testes.</critical>

## Entradas

- `./tasks/prd-[feature-slug]/prd.md`
- `./tasks/prd-[feature-slug]/techspec.md`
- `./.agents/rules/`
- `./.agents/skills/`

## Princípios

- Máximo recomendado de 10 tarefas principais.
- Uma tarefa deve ser pequena o suficiente para uma branch e um commit/PR pequeno.
- Dependências devem ser explícitas.
- Toda tarefa deve referenciar RF/RNF e TS relacionados.
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

## Arquivos/módulos prováveis
```

Depois de criar os arquivos, pare. Não implemente automaticamente.
