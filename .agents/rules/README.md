# PsiqApp Rules

Arquivos destinados a `.agents/rules/`.

Estas Rules representam invariantes e guard rails do projeto e devem ser consideradas por agentes de PRD review, TechSpec, criação de Tasks, implementação, code review, QA e feature review.

## Como aplicar

- `AGENTS.md` é a entrada do repositório e indica quais fontes consultar em cada etapa.
- Antes de iniciar uma etapa SDD, leia esta página e as Rules relevantes ao escopo. Segurança clínica e privacidade são obrigatórias sempre que a feature tocar IA, prontuários ou dados pessoais.
- Use `docs/BUSINESS.md` como referência para comportamento atual e termos de domínio; use `docs/TECHNICAL.md` como mapa da arquitetura, módulos e responsabilidades atuais. Consulte as seções afetadas, não o documento inteiro por padrão.
- A TechSpec registra como a proposta se encaixa nas responsabilidades e fronteiras existentes. Desvios ou mudanças de invariantes exigem decisão explícita e atualização das fontes canônicas antes da implementação.
- A implementação e o review devem confirmar o contexto documentado nos arquivos impactados. Se documento, código e especificação divergirem, registre a divergência e resolva-a conforme a precedência abaixo; não transforme uma inconsistência existente em novo padrão.

## Files

- `product-invariants.md`
- `clinical-ai-safety.md`
- `clinical-data-privacy.md`
- `architecture-boundaries.md`
- `testing-quality.md`
- `documentation-maintenance.md`

## Precedence

Em caso de conflito entre uma Task/TechSpec e uma Rule, a implementação deve parar e o conflito deve ser resolvido explicitamente antes de prosseguir.

## Regra longitudinal

Complementos fazem parte da fonte clínica e podem ser evidência, mas a suficiência para análise longitudinal é determinada pela quantidade de pareceres clínicos originais.

## Glossário canônico

- **Registro clínico:** informação clínica escrita pelo médico. Pode ser um parecer original ou um complemento.
- **Parecer original:** registro clínico que representa um ponto temporal independente e conta para suficiência longitudinal.
- **Complemento:** registro clínico vinculado a um parecer original. Faz parte da fonte da IA e pode ser evidência, mas não cria sozinho um novo ponto temporal para suficiência longitudinal.
- **Snapshot clínico:** conjunto imutável de todos os registros clínicos considerados por uma geração.
