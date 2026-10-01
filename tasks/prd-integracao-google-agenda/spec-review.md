# Spec Review — Integração com Google Agenda

## Status
APROVADO

## Resumo

O PRD distingue conexão ausente ou encerrada voluntariamente de falha inesperada numa conexão ativa. Define que a agenda local continua disponível sem conexão, que falhas inesperadas bloqueiam novos agendamentos, como os status finais `REALIZADA`, `FALTA` e `CANCELADA` aparecem no Google, e que a integração do MVP só pode usar dados fictícios. A TechSpec pode ser produzida sem inventar comportamento de produto.

## Bloqueadores

Nenhum.

## Ambiguidades

Nenhuma impeditiva identificada.

## Contradições

Nenhuma identificada.

## Lacunas

Nenhuma lacuna de produto impeditiva identificada. A escolha de remover ou marcar como inativo o evento de uma consulta cancelada está explicitamente delegada à TechSpec, com resultado funcional esperado definido em RF-004 e AC-RF004-02.

## Requisitos sem cobertura adequada

| ID | Problema | Recomendação |
|---|---|---|
| — | Nenhum requisito sem cobertura adequada identificado. | — |

## Riscos

- A desconexão voluntária encerra as atualizações pelo PsiqApp, mas eventos já criados permanecem no Google até que o médico os altere diretamente. O PRD explicita esse comportamento e o informa ao médico (RF-001, AC-RF001-06).
- Falhas ou atrasos do Google podem deixar temporariamente o calendário externo diferente do estado salvo no PsiqApp. O PRD prevê estado pendente/falha e sincronização posterior (RF-003 e RF-004).
- O contexto dos eventos pode revelar atendimento psiquiátrico. O PRD limita os dados do evento e mantém o uso restrito a dados fictícios durante o MVP; dados reais dependem de decisão explícita e documentação das salvaguardas da Rule de privacidade.

## Rastreabilidade

- RFs com IDs únicos: SIM
- ACs verificáveis: SIM
- RNFs mensuráveis: SIM
- Rules críticas cobertas: SIM — restrição a dados fictícios no MVP, proteção de tokens e condições prévias para dados reais estão registradas

## Checklist de integridade do review

- [x] Toda contradição possui dois ou mais trechos explícitos identificados.
- [x] Nenhuma lacuna foi classificada como contradição.
- [x] Nenhum requisito foi inferido sem fonte explícita.
- [x] Nenhuma decisão puramente técnica foi exigida como requisito de produto.
- [x] Rules aplicáveis foram consideradas.
- [x] Todo bloqueador exige realmente uma decisão de produto, domínio ou comportamento funcional.

## Veredito

**Aprovado para criação da TechSpec.** As decisões de produto identificadas no review anterior foram incorporadas ao PRD. Permanecem para a TechSpec as decisões técnicas sobre OAuth, persistência, novas tentativas e se o evento de uma consulta cancelada será removido ou marcado como inativo, respeitando o resultado funcional já especificado.
