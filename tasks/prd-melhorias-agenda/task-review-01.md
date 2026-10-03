# Task Review — 1.0 Disponibilidade mensal e confirmação segura

## Status

APROVADO

## Escopo revisado

Revisão da Task 1.0 contra RF-001–003, RNF-001/002, TS-001–004 e seus critérios de aceite. A implementação cobre a disponibilidade mensal no backend e a confirmação segura, sem implementar calendário/formulário do frontend nem os grupos, filtros e paginação das Tasks 2.0 e 3.0.

## Evidências

- Regra temporal compartilhada para consultas de uma hora, inícios em passos de 30 minutos, sobreposição com fim exclusivo e fuso `America/Sao_Paulo`.
- Consulta mensal com mês opcional (relógio do servidor), projeção local mínima e consulta lógica Google, com falha ativa sem slots parciais.
- Revalidação na criação preserva o fluxo existente de idempotência, bloqueio concorrente, gravação atômica e sincronização posterior.
- Contrato HTTP e DTO minimizados, respostas `no-store` e cobertura OpenAPI/integração.
- Cobertura de limites de mês, horário que passa durante a consulta, ausência e mudança de conexão, e erro Google ativo.

## Observações do ciclo de review

A primeira revisão pediu evidências para mês omitido e conexão ausente, além da mudança de conexão durante FreeBusy. Os casos foram adicionados e os checks afetados reexecutados. O review final aprovou a task. A diferença entre `NAO_CONFIGURADA` em mock e `NAO_CONECTADA` no adapter é não bloqueante; ambos são tratados como ausência de conexão pela aplicação.

## Verificação

`./mvnw verify` — BUILD SUCCESS; 55 testes unitários e 40 testes de integração passaram.

## Adendo de QA final — 02/10/2026

QA-004: acrescentada a restrição de dependências com.google.. ao domínio e aplicação no ArquiteturaTest, conforme TS-012. Teste ampliado aprovado (2/2); revisão técnica confirmou compatibilidade com as fronteiras atuais, sem mudança produtiva. Manutenção documental: TECHNICAL já descreve o gate de dependências; BUSINESS/README sem impacto desta correção. Status da Task 1 permanece APROVADO. Evidência: apps/backend/target/feature-qa-architecture.log; achado em bugs.md.
