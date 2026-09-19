# Task 2.0 — Fronteiras e nomenclatura do backend

## Objetivo

Aplicar as fronteiras finais `domain`, `application`, `adapter` e `config`, renomeando papéis arquiteturais e separando responsabilidades confirmadas.

## Rastreabilidade

- PRD: RF-001, RF-002, RF-005, RF-007, RNF-003, RNF-004
- TechSpec: TS-002, TS-003, TS-008
- Critérios de aceite: AC-RF002-01 a AC-RF002-03, AC-RF005-01 a AC-RF005-04, AC-RF007-01

## Dependências

Task 1.0.

## Escopo

- Renomear pacotes, classes, arquivos, imports e testes backend conforme a matriz.
- Separar portas `in`/`out`, validação/exceção e componentes com múltiplos motivos de mudança quando confirmado.
- Preservar conceitos de negócio em português e papéis arquiteturais convencionais em inglês.
- Atualizar ArchUnit para proteger as dependências finais.

## Fora do escopo da task

Migration de banco, mudança de contrato HTTP público e renomeação do frontend.

## Subtarefas

- [ ] 2.1 Renomear estrutura e referências backend.
- [ ] 2.2 Aplicar separações justificadas em TS-008.
- [ ] 2.3 Atualizar testes de fronteira e ArchUnit.

## Critérios de sucesso

O backend compila, as responsabilidades estão registradas e `domain` não depende de frameworks nem adapters/configuração.

## Testes obrigatórios

- [ ] Unitários dos componentes renomeados/separados.
- [ ] ArchUnit das fronteiras e dependências.
- [ ] Compilação e testes backend.
- [ ] Casos de erro e invariantes de append-only preservados.

## Skills aplicáveis

Nenhuma skill especializada.

## Arquivos/módulos prováveis

`apps/backend/src/main`, `apps/backend/src/test`, regras ArchUnit e configurações backend.
