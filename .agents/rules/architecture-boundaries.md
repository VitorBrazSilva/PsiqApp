# Architecture Boundaries

## Purpose

Estas regras protegem os limites arquiteturais do PsiqApp e evitam acoplamento desnecessário e overengineering.

Elas não definem framework, banco ou provider específicos. Essas escolhas pertencem à TechSpec.

## Rule precedence

A TechSpec pode escolher tecnologias e padrões, mas não pode violar os limites abaixo sem decisão arquitetural explícita e atualização destas Rules quando necessário.

## Clinical persistence boundary

- Persistir um parecer é responsabilidade independente da IA.
- O fluxo de persistência clínica deve concluir com sucesso mesmo se a IA estiver indisponível.
- A geração de análise deve ocorrer fora da transação responsável por salvar o parecer.
- Nenhum rollback de IA pode causar rollback de dado clínico já validado.
- Falha da IA deve ser tratada como falha de um processo derivado, nunca como falha do prontuário.

## AI boundary

- Código de domínio e regras de negócio não devem depender diretamente do SDK de um provider de IA.
- Integração com LLM deve existir atrás de uma interface/port/contrato substituível.
- Prompt, schema e provider devem ser tratados como detalhes externos ao núcleo de negócio.
- A aplicação deve validar a resposta do provider antes de tratá-la como análise válida.

## Analysis processing

- Geração automática de análise deve ser assíncrona em relação ao salvamento do parecer.
- O mecanismo assíncrono deve permitir persistência de estado, retry controlado e recuperação após restart quando isso for definido na TechSpec.
- Não introduzir broker externo apenas para antecipar necessidades futuras.
- RabbitMQ, Kafka, SQS, Pub/Sub ou equivalente só devem ser adicionados quando houver necessidade concreta documentada.
- Para o MVP, preferir a solução mais simples que satisfaça os requisitos de confiabilidade e processamento assíncrono.

## AI history source

- A geração de uma nova análise deve consultar novamente todos os registros clínicos do snapshot, incluindo pareceres originais e complementos.
- Análises anteriores não entram no contexto clínico de uma nova geração.
- Qualquer otimização futura de contexto deve preservar a distinção entre fonte clínica original e artefato derivado.

## Explicitly out of scope architecture

Não introduzir no MVP sem nova decisão de produto/arquitetura:

- RAG;
- embeddings;
- banco vetorial;
- busca semântica;
- sumarização incremental usada como fonte clínica principal;
- microservices sem necessidade concreta;
- event bus distribuído sem necessidade concreta;
- infraestrutura orientada a alta escala não justificada pelo volume esperado.

## Simplicity principle

- Não criar abstração sem caso de uso real.
- Não adicionar tecnologia somente por possibilidade futura.
- Não criar múltiplos serviços quando um processo simples e bem isolado resolve o problema.
- Preferir componentes pequenos, testáveis e substituíveis.
- Complexidade adicional precisa ser justificada por requisito, risco ou evidência de necessidade.
