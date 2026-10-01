# Testing and Quality Rules

## Purpose

Estas regras definem o mínimo de qualidade necessário para considerar uma Task concluída.

## Rule precedence

Nenhuma Task pode ser marcada como concluída quando viola requisito crítico, possui teste crítico falhando ou deixa comportamento clínico relevante sem validação adequada.

## Traceability

- Requisitos críticos do PRD devem possuir testes correspondentes.
- Critérios de aceite devem ser rastreáveis a testes sempre que tecnicamente possível.
- Testes devem validar comportamento e objetivo de negócio, não apenas cobertura de linhas.
- Testes novos devem usar nomes que deixem claro qual regra ou cenário está sendo protegido.

## Verificações arquiteturais

- Quando uma mudança tocar uma fronteira arquitetural que possa ser expressa por testes ou verificações estáticas existentes, a TechSpec e a task devem apontar essa verificação e a conclusão deve registrar seu resultado.
- Se uma regra arquitetural não tiver verificação automatizada viável, o review deve registrar a evidência manual de compatibilidade e a lacuna de automação. Documentação ou aprovação de review, isoladamente, não deve ser descrita como bloqueio automatizado.
- Não adicione uma ferramenta ou suíte arquitetural nova sem benefício concreto e decisão técnica registrada na TechSpec.

## Mandatory critical scenarios

Quando aplicáveis à Task, devem existir testes para:

- persistência do parecer mesmo com IA indisponível;
- parecer append-only;
- correção/adendo preservando o registro original;
- análise append-only;
- análise anterior não sendo sobrescrita;
- análise nunca recebendo outra análise como fonte clínica;
- complemento como fonte clínica e evidência válida;
- isolamento entre pacientes;
- impossibilidade de usar evidência de outro paciente;
- zero pareceres originais;
- um único parecer original, mesmo com complementos, sem falsa tendência;
- dois ou mais pareceres originais com leitura longitudinal usando todos os registros clínicos do snapshot;
- timeout do provider;
- erro do provider;
- resposta inválida do provider;
- schema inválido;
- retry controlado quando existir;
- evidência apontando para registro existente;
- ausência de diagnóstico fechado;
- ausência de prescrição/recomendação de dose;
- ausência de invenção de informação;
- falha da IA sem perda ou alteração de dados clínicos.

## External integrations

- Serviços externos devem ser testados com mocks/fakes por padrão.
- Testes reais contra providers externos só devem ocorrer quando explicitamente autorizados e em ambiente seguro.
- Testes automatizados não devem depender de rede externa para passar.
- Nunca usar dados clínicos reais em testes.

## Build quality

Antes de concluir uma Task, executar os checks existentes do projeto, conforme aplicável:

- typecheck/compile;
- lint;
- unit tests;
- integration tests;
- build;
- migrations;
- testes de fluxo backend/API/CLI quando definidos na TechSpec.

Se um check esperado não existir, registrar a lacuna; não inventar que passou.

## Approval rules

Uma Task não pode ser aprovada se:

- houver teste crítico falhando;
- a implementação contradizer PRD, TechSpec ou Rules;
- houver possibilidade de mistura de dados entre pacientes;
- a IA puder comprometer persistência clínica;
- existir risco conhecido de sobrescrever registros que devem ser append-only;
- houver comportamento clínico proibido não tratado;
- secrets ou dados sensíveis estiverem versionados ou expostos.

## Quality over coverage

Coverage pode ser usado como indicador, mas não substitui testes significativos.

É preferível menos testes relevantes e bem desenhados do que alta cobertura sem validação de comportamento crítico.
