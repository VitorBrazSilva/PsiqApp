# Task 3.0 — Persistência, enums e payload canônico

## Objetivo

Migrar a persistência para a convenção portuguesa e alinhar os modelos/enums/payload armazenado ao estado canônico em uma entrega coordenada, preservando dados, relações, constraints e invariantes.

## Rastreabilidade

- PRD: RF-004, RF-006, RF-007, RF-008, RNF-001, RNF-002, RNF-004, RNF-006
- TechSpec: TS-006, TS-007, TS-009, TS-011
- Critérios de aceite: AC-RF004-01 a AC-RF004-04, AC-RF006-02 a AC-RF006-04, AC-RF007-01, AC-RF007-03, AC-RF008-02, AC-RF008-04

## Dependências

Tasks 1.0 e 2.0.

## Escopo

- Criar `V004__padronizacao_nomenclaturas.sql` sem editar V001, V002 ou V003.
- Renomear tabelas, colunas, índices, constraints, funções e triggers com `ALTER TABLE ... RENAME` ou operações equivalentes não destrutivas.
- Atualizar valores persistidos e checks dos enums para os valores canônicos portugueses definidos em TS-007.
- Converter deterministicamente o JSONB histórico para `linhaDoTempo`, `padroes`, `pontosDeAtencao`, `limitacoes`, `texto`, `natureza`, `evidencias`, `apelidoRegistro`, `registroId`, `campo` e `citacao`.
- Atualizar entidades JPA, repositories, adapters JDBC/JPA e SQL consumidores para os nomes finais.
- Preservar FKs compostas por paciente, unicidades, `ON DELETE RESTRICT`, triggers append-only, índices de timeline/snapshot/estado, locks por paciente e auditoria de tentativas.
- Validar banco vazio e upgrade de banco preparado em V003, comparando contagens, IDs, relações, hashes, JSONB, enums e vínculos por paciente antes/depois.

## Fora do escopo da task

- Editar migrations históricas V001–V003.
- Criar rollback destrutivo automático, `DROP TABLE`, cópia integral de tabelas ou `ON DELETE CASCADE`.
- Alterar regras clínicas, retry, lease, seleção da análise atual ou comportamento do worker além dos nomes necessários para a persistência.
- Alterar rotas HTTP, frontend e documentação viva.

## Subtarefas

- [x] 3.1 Implementar a migration V004 com renomes, valores canônicos e preservação de constraints.
- [x] 3.2 Implementar a conversão JSONB histórica conforme a matriz aprovada.
- [x] 3.3 Atualizar mapeamentos JPA/JDBC, queries e adapters de persistência.
- [x] 3.4 Atualizar modelos e enums persistidos mantendo a semântica das regras existentes.
- [x] 3.5 Executar validação antes/depois e registrar evidências de upgrade.

## Critérios de sucesso

- Uma base nova e uma base existente em V003 chegam ao mesmo estado canônico.
- Nenhum registro, relacionamento, evidência, citação, hash ou vínculo de paciente é perdido ou alterado semanticamente.
- Os nomes antigos permanecem somente em migrations históricas e testes explícitos de upgrade.
- O backend continua inicializando, lendo e gravando dados corretamente após a migration.
- Append-only, idempotência, isolamento entre pacientes e independência da persistência clínica em relação à IA permanecem protegidos.

## Testes obrigatórios

- [x] Teste de migration em banco vazio com V001–V004.
- [x] Teste de upgrade de V003 para V004 com dados fictícios representativos.
- [x] Comparação de linhas, IDs, FKs, unicidades, índices, constraints, estados, enums e JSONB antes/depois.
- [x] Teste semântico de todos os itens, evidências, citações e limitações convertidos.
- [x] Testes de append-only, idempotência, isolamento por paciente e resultado tardio do worker.
- [x] `./mvnw --batch-mode --no-transfer-progress verify`.

## Skills aplicáveis

Nenhuma skill especializada. Aplicar as Rules de persistência clínica, isolamento, privacidade, segurança de IA e qualidade.

## Arquivos/módulos prováveis

`apps/backend/src/main/resources/db/migration/V004__padronizacao_nomenclaturas.sql`, entidades JPA, repositories, adapters JDBC/JPA, modelos de domínio e testes de integração/migration.
