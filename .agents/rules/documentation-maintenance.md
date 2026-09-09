# Documentation Maintenance Rules

## Purpose

A documentação humana do projeto deve refletir o estado atual do produto e da implementação.

## Canonical documents

- `docs/BUSINESS.md` — comportamento funcional, domínio, linguagem ubíqua e regras de negócio atuais.
- `docs/TECHNICAL.md` — arquitetura, tecnologias, componentes, contratos, persistência, integrações, testes e infraestrutura atuais.
- `README.md` — onboarding, configuração, execução e testes.

## Invariants

- Mudança de regra de negócio ou comportamento funcional deve avaliar atualização de `BUSINESS.md`.
- Mudança técnica ou arquitetural relevante deve avaliar atualização de `TECHNICAL.md`.
- Mudança de setup, configuração, execução ou testes deve avaliar atualização de `README.md`.
- Documentação deve representar o estado atual, não um changelog.
- Não documentar comportamento inexistente ou planejado como se já estivesse implementado.
- Não manter informação obsoleta conhecida após uma alteração que a invalide.
- Preferir alterações localizadas; não reescrever documentos sem necessidade.
- Terminologia de negócio deve permanecer consistente com a linguagem ubíqua do produto.
- O commit final de uma task deve incluir a atualização documental aplicável ou registrar explicitamente que não houve impacto documental.
