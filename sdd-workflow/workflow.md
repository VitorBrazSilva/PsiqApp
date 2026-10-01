# Workflow SDD

```text
IDEA
  |
  v
project-context (AGENTS.md + Rules + documentação aplicável)
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

- Instruções de entrada do projeto: `./AGENTS.md`.
- Artefatos SDD: `./tasks/prd-[feature-slug]/`
- Rules: `./.agents/rules/`
- Skills: `./.agents/skills/`
- Documentação humana viva: `./docs/BUSINESS.md`, `./docs/TECHNICAL.md`, `./README.md`.
- `docs/BUSINESS.md` é a referência de linguagem ubíqua e comportamento atual; `docs/TECHNICAL.md` é o mapa da arquitetura, dos módulos e de suas responsabilidades.
- Nenhum agente deve assumir stack sem ler TechSpec/repositório.
- Rastreabilidade obrigatória: `RF/RNF/AC -> TS -> Task -> Code/Test -> Evidence`.
- Uma task principal por branch e commit pequeno/coeso.
- Task Review != QA != Feature Review.
- Gate de domínio especializado é adicional e executado apenas quando aplicável.
- Toda task aprovada deve passar pelo `project-documentation-maintainer` antes do commit final.
- Task Review != Code Review != QA != Feature Review.
- `task-reviewer` valida escopo, requisitos, ACs e evidências.
- `code-reviewer` valida qualidade técnica, arquitetura e manutenção.

## Contexto do projeto antes de cada feature

Antes de iniciar uma etapa, o agente deve ler `AGENTS.md`, esta página e `.agents/rules/README.md`; depois, consulta as Rules e as seções documentais pertinentes à etapa. A documentação direciona a exploração. O agente confirma o estado real nos arquivos de código e testes diretamente afetados, sem varrer todo o repositório por padrão.

- **PRD:** consultar a linguagem ubíqua e as regras de produto relevantes em `docs/BUSINESS.md` e `product-invariants.md`. Não introduzir decisões técnicas no PRD.
- **TechSpec:** consultar `docs/TECHNICAL.md` (estrutura, responsabilidades e fronteiras) e inspecionar os módulos impactados. Explicar compatibilidade com a arquitetura existente.
- **Tasks e implementação:** carregar as decisões aprovadas, as Rules aplicáveis e somente o contexto dos módulos/telas/contratos afetados.
- **Reviews e QA:** verificar as mesmas Rules e decisões aprovadas contra o diff, os testes e as evidências da etapa.

## Gate de compatibilidade arquitetural e de regras

A TechSpec deve conter uma matriz de compatibilidade, por exemplo:

| Restrição/Rule do projeto | Fonte | Módulo e responsabilidade existente | Compatibilidade ou mudança proposta | Verificação |
|---|---|---|---|---|

O gate só passa quando a feature mantém as responsabilidades e fronteiras existentes, ou quando a mudança está explicitamente justificada e aprovada como decisão de arquitetura/produto. Conflitos com Rules não podem ser resolvidos por implementação implícita: atualize primeiro a decisão aprovada e as Rules/documentação aplicáveis.

As convenções de nomenclatura descritas em `docs/TECHNICAL.md` estão parcialmente padronizadas. Não generalize uma regra a partir de um nome isolado. Se uma feature precisar fixar uma convenção compartilhada ausente, registre-a na TechSpec e atualize a fonte canônica após aprovação.

Documentação e prompts ajudam a orientar a consistência, mas não a garantem sozinhos. Quando uma fronteira puder ser expressa por teste arquitetural, lint ou outra verificação existente, a TechSpec deve apontar essa verificação e o QA deve reportar seu resultado. Não declarar conformidade automatizada sem evidência.
