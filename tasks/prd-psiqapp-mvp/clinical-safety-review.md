# Clinical Safety Review - PsiqApp MVP

## Status
REPROVADO

## Limites clinicos do produto

Os testes existentes e as regras revisadas mantem a IA como apoio ao medico, sem diagnostico, prescricao ou recomendacao de dose. A validacao runtime final nao foi possivel.

## Privacidade e isolamento de dados

As fixtures sao ficticias e nao usam provider externo. Isolamento entre pacientes e ausencia de dados sensiveis em logs nao foram demonstrados porque o backend nao iniciou.

## Evidencia e auditabilidade

Nao foi possivel validar evidencias contra registros persistidos, snapshots ou historico de analises no fluxo integrado.

## Falhas seguras

Timeout, erro, resposta invalida, schema invalido e retry controlado nao receberam evidencia integrada nesta execucao.

## Problemas bloqueantes

- Backend nao compila com o Java disponivel (8 em vez de 21).
- QA report reprovado e E2E sem API funcional.

## Riscos residuais

Nao certificar uso clinico nem uso com dados reais. Repetir o gate em ambiente funcional com provider fake.

## Veredito

Reprovado por falta de evidencia integrada obrigatoria.
