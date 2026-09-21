# Task 2.0 — Fronteiras e nomenclatura do backend

## Objetivo

Aplicar as fronteiras arquiteturais e os papéis convencionais definidos na matriz, mantendo o backend compilável e funcional enquanto a nomenclatura de persistência, enums e contratos públicos ainda permanece no estado anterior.

## Rastreabilidade

- PRD: RF-001, RF-002, RF-005, RF-007, RF-008, RNF-003, RNF-004
- TechSpec: TS-002, TS-003
- Critérios de aceite: AC-RF001-01, AC-RF001-02, AC-RF002-01 a AC-RF002-03, AC-RF005-01, AC-RF005-03, AC-RF005-04, AC-RF007-01, AC-RF008-02

## Dependências

Task 1.0.

## Escopo

- Renomear pacotes `dominio`, `aplicacao`, `adaptador` e `configuracao` para `domain`, `application`, `adapter` e `config` conforme TS-002.
- Atualizar classes, arquivos, imports, package-info e testes backend para combinar conceito de negócio em português com papel arquitetural convencional em inglês.
- Separar `application.port.in` e `application.port.out` quando a direção da porta estiver definida na matriz.
- Separar `domain.validation` e `domain.exception` conforme as responsabilidades já identificadas.
- Atualizar o teste ArchUnit para proteger as fronteiras finais, a ausência de dependência de framework no domínio e a direção `adapter/config -> application -> domain`.
- Preservar, nesta task, os nomes de tabelas/colunas, valores persistidos, rotas HTTP e campos JSON atuais para que a alteração estrutural possa ser validada isoladamente.

## Fora do escopo da task

- Criar a migration V004 ou alterar tabelas, colunas, índices, constraints, triggers e valores persistidos.
- Alterar enums de negócio, schema JSONB ou payload do provider.
- Alterar rotas, DTOs e campos JSON públicos.
- Renomear módulos do frontend.
- Separar componentes de TS-008 cuja decisão dependa do comportamento de persistência ou do worker; essas decisões serão executadas na Task 4.0.

## Subtarefas

- [x] 2.1 Renomear a estrutura de pacotes e os papéis arquiteturais do backend.
- [x] 2.2 Reorganizar portas de entrada/saída e validação/exceção conforme a matriz.
- [x] 2.3 Atualizar imports, configurações de composição e testes afetados.
- [x] 2.4 Atualizar e executar as regras ArchUnit das fronteiras finais.
- [x] 2.5 Reexecutar o scan da Task 1 e registrar referências antigas restantes.

## Critérios de sucesso

- O backend compila e seus testes aplicáveis passam sem alteração funcional.
- O domínio não depende de Spring, JPA, PostgreSQL, Jackson, SDK de IA ou classes HTTP.
- A aplicação não depende de adapters ou configuração.
- Não existem referências funcionais não intencionais aos pacotes e papéis antigos.
- Nenhuma separação cria abstração sem caso de uso real ou dependência indevida.

## Testes obrigatórios

- [x] Testes unitários dos componentes renomeados.
- [x] ArchUnit para pacotes e dependências finais.
- [x] Compilação e `./mvnw --batch-mode --no-transfer-progress verify`.
- [x] Casos de erro e invariantes de append-only, isolamento e independência da IA preservados nos testes afetados.
- [x] Scan de referências antigas com a allowlist da Task 1.

## Skills aplicáveis

Nenhuma skill especializada. Aplicar as Rules de arquitetura, invariantes de produto e qualidade.

## Arquivos/módulos prováveis

`apps/backend/src/main/java/com/psiqapp/domain/`, `application/`, `adapter/`, `config/`, `apps/backend/src/test/` e configuração de composição do backend.
