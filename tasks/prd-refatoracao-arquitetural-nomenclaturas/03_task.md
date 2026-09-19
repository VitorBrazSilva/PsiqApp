# Task 3.0 — Persistência e migration Flyway V004

## Objetivo

Padronizar tabelas, colunas, constraints, enums e JSONB em português por migration incremental, preservando dados e histórico.

## Rastreabilidade

- PRD: RF-004, RF-006, RF-007, RNF-002, RNF-004, RNF-006
- TechSpec: TS-006, TS-009, TS-011
- Critérios de aceite: AC-RF004-01 a AC-RF004-04, AC-RF006-02 a AC-RF006-04

## Dependências

Tasks 1.0 e 2.0.

## Escopo

- Criar V004 sem editar V001–V003.
- Renomear tabelas, colunas, índices, constraints, triggers e valores persistidos.
- Converter chaves JSONB para o schema canônico.
- Atualizar entidades, repositories, adapters e SQL consumidores.
- Preservar FKs compostas, locks, idempotência, append-only e ordem da timeline.

## Fora do escopo da task

Alterar semântica clínica, remover histórico Flyway ou criar rollback destrutivo automático.

## Subtarefas

- [ ] 3.1 Implementar V004 com operações de rename e conversões seguras.
- [ ] 3.2 Atualizar consumidores de persistência.
- [ ] 3.3 Validar upgrade com dados fictícios antes/depois.

## Critérios de sucesso

Bases novas e existentes chegam ao mesmo estado canônico sem perda de registros, relações, hashes ou invariantes.

## Testes obrigatórios

- [ ] Testes de migration/upgrade.
- [ ] Integração com PostgreSQL/Testcontainers.
- [ ] Validação de linha, relações, FKs, JSONB e constraints.
- [ ] Idempotência, append-only, isolamento por paciente e resultado tardio do worker.

## Skills aplicáveis

Nenhuma skill especializada.

## Arquivos/módulos prováveis

`apps/backend/src/main/resources/db/migration`, entidades JPA/JDBC, repositories, adapters e testes de integração.
