# Workflow SDD

```text
IDEA
  |
  v
create_prd
  |
  v
prd.md
  |
  v
spec-reviewer
  |
  v
PRD aprovado
  |
  v
create_techspec
  |
  v
techspec.md
  |
  v
create_tasks
  |
  v
tasks.md + NN_task.md
  |
  v
execute_task (1 task / branch)
  |
  v
testes + task-reviewer
  |
  +--> correções --> testes/review
  |
  v
code-reviewer
  |
  +--> correções técnicas --> testes/review
  |
  v
project-documentation-maintainer
  |
  +--> BUSINESS.md / TECHNICAL.md / README.md quando necessário
  |
  v
commit
  |
  +--> próxima task
  |
  v
execute_qa
  |
  v
clinical-safety-reviewer (quando aplicável)
  |
  v
feature-reviewer
  |
  v
READY
```

## Convenções globais

- Artefatos SDD: `./tasks/prd-[feature-slug]/`
- Rules: `./.agents/rules/`
- Skills: `./.agents/skills/`
- Documentação humana viva: `./docs/BUSINESS.md`, `./docs/TECHNICAL.md`, `./README.md`.
- Nenhum agente deve assumir stack sem ler TechSpec/repositório.
- Rastreabilidade obrigatória: `RF/RNF/AC -> TS -> Task -> Code/Test -> Evidence`.
- Uma task principal por branch e commit pequeno/coeso.
- Task Review != QA != Feature Review.
- Gate de domínio especializado é adicional e executado apenas quando aplicável.
- Toda task aprovada deve passar pelo `project-documentation-maintainer` antes do commit final.
- Task Review != Code Review != QA != Feature Review.
- `task-reviewer` valida escopo, requisitos, ACs e evidências.
- `code-reviewer` valida qualidade técnica, arquitetura e manutenção.
