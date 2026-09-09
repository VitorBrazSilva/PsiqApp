# Clinical AI Safety Rules

## Purpose

Estas regras limitam o comportamento de qualquer funcionalidade de IA do PsiqApp.

A IA existe exclusivamente como ferramenta de apoio à leitura longitudinal do prontuário e não substitui julgamento clínico.

## Rule precedence

Nenhum prompt, modelo, provider, fluxo, componente, refatoração ou otimização pode enfraquecer estas regras sem alteração explícita do PRD e aprovação correspondente.

## Mandatory behavior

- Toda análise deve ser derivada somente dos registros clínicos escritos pelo médico para o paciente, incluindo pareceres originais e complementos do snapshot.
- Toda observação relevante deve ser rastreável a um ou mais registros clínicos originais.
- Quando houver evidência insuficiente, a saída deve declarar insuficiência, incerteza ou ausência de informação.
- A saída deve deixar claro que se trata de apoio à leitura e que a decisão clínica permanece com o médico.
- A análise deve preservar distinção entre fato explicitamente registrado e interpretação produzida pela IA.
- A IA deve respeitar a ordem temporal dos registros quando produzir leitura longitudinal.
- A IA deve apresentar limitações da análise.

## Prohibited behavior

A IA nunca deve:

- fechar diagnóstico;
- afirmar que o paciente possui um transtorno que não esteja explicitamente registrado como fato no prontuário;
- prescrever medicamentos;
- sugerir início de medicamento;
- sugerir suspensão de medicamento;
- sugerir troca de medicamento;
- sugerir dose ou alteração de dose;
- recomendar conduta terapêutica;
- transformar hipótese em fato;
- inventar sintomas, eventos, medicações ou informações ausentes;
- preencher lacunas por suposição;
- usar conhecimento médico externo para criar novas conclusões clínicas sobre o paciente no MVP;
- usar análises anteriores de IA como evidência clínica;
- esconder ou suavizar a insuficiência de histórico;
- apresentar linguagem de certeza quando os registros não sustentarem essa certeza.

## Evidence integrity

- Toda referência de evidência deve apontar para um registro clínico real do mesmo paciente e pertencente ao snapshot, podendo ser um parecer original ou um complemento.
- A aplicação não deve aceitar evidências que referenciem registros inexistentes.
- A aplicação não deve aceitar evidências que pertençam a outro paciente.
- Uma observação sem suporte identificável deve ser tratada como inválida ou não exibida como conclusão relevante.

## Failure behavior

Quando a IA retornar saída inválida, inconsistente ou incompatível com o contrato esperado:

- não alterar o prontuário;
- não substituir análises anteriores;
- registrar a geração como falha quando aplicável;
- permitir retry controlado;
- não exibir conteúdo inseguro como análise válida.
