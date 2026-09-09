# PsiqApp Rules

Arquivos destinados a `.agents/rules/`.

Estas Rules representam invariantes e guard rails do projeto e devem ser consideradas por agentes de PRD review, TechSpec, criação de Tasks, implementação, code review, QA e feature review.

## Files

- `product-invariants.md`
- `clinical-ai-safety.md`
- `clinical-data-privacy.md`
- `architecture-boundaries.md`
- `testing-quality.md`

## Precedence

Em caso de conflito entre uma Task/TechSpec e uma Rule, a implementação deve parar e o conflito deve ser resolvido explicitamente antes de prosseguir.

## Regra longitudinal

Complementos fazem parte da fonte clínica e podem ser evidência, mas a suficiência para análise longitudinal é determinada pela quantidade de pareceres clínicos originais.

## Glossário canônico

- **Registro clínico:** informação clínica escrita pelo médico. Pode ser um parecer original ou um complemento.
- **Parecer original:** registro clínico que representa um ponto temporal independente e conta para suficiência longitudinal.
- **Complemento:** registro clínico vinculado a um parecer original. Faz parte da fonte da IA e pode ser evidência, mas não cria sozinho um novo ponto temporal para suficiência longitudinal.
- **Snapshot clínico:** conjunto imutável de todos os registros clínicos considerados por uma geração.
