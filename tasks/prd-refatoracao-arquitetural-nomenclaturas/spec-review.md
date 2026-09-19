# Spec Review — Refatoração arquitetural e padronização de nomenclaturas

## Status
APROVADO

## Resumo

O PRD está suficientemente claro para orientar uma TechSpec sem inventar comportamento de produto. O problema, a persona, o contexto, os objetivos, o escopo, o fora de escopo e as premissas estão definidos. Os requisitos críticos das Rules aplicáveis estão cobertos: preservação funcional, append-only, isolamento por paciente, independência da persistência clínica em relação à IA, segurança clínica, minimização de dados e uso exclusivo de dados fictícios.

Há decisões que pertencem naturalmente à TechSpec, como inventário final de nomes, estrutura de pacotes, divisão exata de componentes, estratégia de migration, algoritmo de busca de referências e sequência técnica. Elas não bloqueiam este review.

## Bloqueadores

- Nenhum bloqueador identificado.

## Ambiguidades

- O PRD não explicita se endpoints exclusivamente operacionais, como health/readiness, entram na regra de endpoints em português. Essa decisão pode ser resolvida na TechSpec, preservando os consumidores operacionais e registrando a exceção técnica, se aplicável.
- A expressão “conceito afetado” depende do inventário do estado atual. A TechSpec deve definir o inventário e seus critérios de inclusão, sem alterar o comportamento do produto.

## Contradições

- Nenhuma contradição explícita foi identificada entre as seções do PRD ou entre o PRD e as Rules aplicáveis.

## Lacunas

- Nenhuma lacuna de produto, domínio ou comportamento funcional impede a criação da TechSpec.

## Requisitos sem cobertura adequada

| ID | Problema | Recomendação |
|---|---|---|
| N/A | Nenhum requisito crítico sem cobertura adequada foi identificado. | Prosseguir com a TechSpec e manter a matriz RF/RNF → TS → task → teste/evidência. |

## Riscos

- **Migração e consistência:** renomeações de persistência podem causar perda, inacessibilidade ou vínculo incorreto de dados; a TechSpec deve exigir validação antes/depois e preservação das constraints.
- **Regressão clínica:** uma separação estrutural pode alterar invariantes, transações, idempotência, retry ou isolamento; os fluxos críticos devem permanecer cobertos por testes.
- **Privacidade e segurança da IA:** a refatoração deve preservar dados fictícios, minimização no provider, logs seguros e validação de evidências.
- **Inconsistência residual:** contratos, testes, documentação e consumidores podem permanecer com nomes antigos; deve haver scan de referências com allowlist explícita para histórico de migrations e testes de upgrade.

## Rastreabilidade

- RFs com IDs únicos: SIM
- ACs verificáveis: SIM
- RNFs mensuráveis: SIM
- Rules críticas cobertas: SIM

## Checklist de integridade do review

- [x] Toda contradição possui dois ou mais trechos explícitos identificados.
- [x] Nenhuma lacuna foi classificada como contradição.
- [x] Nenhum requisito foi inferido sem fonte explícita.
- [x] Nenhuma decisão puramente técnica foi exigida como requisito de produto.
- [x] Rules aplicáveis foram consideradas.
- [x] Todo bloqueador exige realmente uma decisão de produto, domínio ou comportamento funcional.

## Veredito

APROVADO. A TechSpec pode ser utilizada, desde que registre as decisões técnicas pendentes e preserve os invariantes de privacidade, segurança clínica, isolamento por paciente, append-only e independência da persistência clínica em relação à IA.
