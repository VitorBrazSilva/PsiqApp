# Spec Review — Redesign de UX/UI do PsiqApp — Foco clínico

## Status

APROVADO

## Resumo

O PRD está suficientemente definido para a criação da TechSpec sem exigir que o autor técnico invente comportamento de produto. A exigência central do usuário — preservar todos os dados do frontend atual que são alimentados pelo backend — está explicitamente coberta por RF-019, pelo inventário D-01 a D-15, pelo inventário de capacidades de tela e pelos endpoints E-01 a E-17.

A revisão do repositório confirma que o inventário contempla os contratos atualmente consumidos pelo frontend: pacientes, consultas, registros clínicos, gerações/análises, paginação, erros e proteções operacionais. Também contempla as duas capacidades que ainda não estão completas no frontend atual: associação de parecer a consulta e abertura de análise histórica.

O PRD preserva a distinção necessária entre dado clínico, conteúdo derivado de IA, metadado de auditoria e proteção de transporte. A forma concreta de componentização, carregamento, paginação e ajuste mínimo do contrato histórico está corretamente delegada à TechSpec.

## Bloqueadores

- Nenhum bloqueador de especificação identificado.

## Ambiguidades

- A evidência de paridade deverá registrar, campo a campo, quando um dado é apresentado diretamente, consultado em detalhe contextual ou preservado apenas como vínculo operacional. O PRD determina essa cobertura, mas não fixa a composição visual exata — decisão corretamente pertencente à TechSpec.
- A seção 14 chama a tabela de E-01 a E-14 de “14 endpoints de produto” e depois inclui E-15 a E-17 como endpoints operacionais. O significado operacional é compreensível e não altera o escopo, mas a TechSpec deve manter essa separação para evitar contagem divergente na matriz.
- O PRD registra a divergência entre `sequenciaRequisicao` no tipo atual do frontend e `sequenciaRequest` no contrato backend. A TechSpec deve adotar o contrato efetivo e documentar a compatibilidade, sem descartar o campo; não é necessário decidir isso no PRD.

## Contradições

- Nenhuma contradição explícita identificada.

## Lacunas

- Nenhuma lacuna bloqueadora identificada.
- A seleção de navegadores para as larguras de aceite permanece em aberto, mas foi corretamente classificada pelo PRD como decisão técnica/QA, não como impedimento para a TechSpec.
- O formato final da matriz de paridade ainda não existe, mas a obrigação, a fonte, o destino, os requisitos e a evidência exigidos estão definidos em RF-019-01 e na seção 9/14. A matriz deve ser criada nas etapas seguintes; sua ausência neste PRD não impede a especificação.

## Requisitos sem cobertura adequada

| ID | Problema | Recomendação |
|---|---|---|
| D-09 / E-12 | O frontend atual lista metadados de gerações, mas usa conjunto inicial limitado e não oferece acesso completo a todas as páginas. | Na TechSpec e na implementação, mapear `id`, `pacienteId`, `estado`, `revisaoSnapshot`, `sequenciaRequest`, `solicitadaEm`, contagens, `ultimoRegistroClinicoId` e `modo`, além de paginação verdadeira. |
| E-13 / RF-013 | O contrato de consulta de análise histórica existe, mas a lista de gerações atual não fornece o vínculo necessário para abrir a análise correspondente. | Aplicar somente o ajuste mínimo de contrato autorizado e cobrir abertura, isolamento de versão, evidências e retorno ao histórico. |
| D-05 / RF-006 | O contrato aceita `consultaId` no parecer, mas o formulário atual não expõe essa associação. | Tornar a associação opcional acessível no novo parecer, limitada a consultas do mesmo paciente; manter complemento sem associação independente. |
| D-04 / RF-014 a RF-016 | Os dados de auditoria `criadaEm` e `statusAlteradoEm` precisam continuar consultáveis, embora não devam competir com a leitura clínica. | Definir na TechSpec o detalhe contextual onde esses campos serão consultados e criar evidência específica de preservação de nulos/ausências e estados finais. |
| D-14 / D-15 | Erros, `idRequisicao`, `Idempotency-Key`, `X-Request-Id`, status HTTP e referência de recurso são transversais e podem ser perdidos durante o redesign. | Manter a semântica de erro, associação de erros aos campos e repetição segura; não expor texto remoto sensível nem transformar metadados de transporte em conteúdo clínico. |

## Riscos

- A simplificação visual pode ocultar dados opcionais, metadados de auditoria, vínculos ou páginas posteriores. RF-019-03 a RF-019-05 tratam esse risco corretamente; a matriz de paridade deve ser requisito de aceite, não apenas documentação.
- A diferença de nomenclatura entre frontend e backend pode causar perda silenciosa de `sequenciaRequest` ou outros campos durante a migração. Deve haver teste de contrato e evidência de leitura do payload real.
- O ajuste de histórico pode trocar uma análise histórica pela análise atual se a versão, o paciente e o conjunto congelado não forem mantidos no contexto de navegação. RF-010 e RF-013 cobrem o comportamento esperado.
- Listagens atualmente carregadas com tamanhos fixos podem sugerir que o primeiro conjunto é o conjunto completo. A implementação precisa demonstrar continuidade, total e acesso às páginas seguintes.
- O frontend atual exibe alguns identificadores técnicos diretamente, como `consultaId` e `parecerOriginalId`. O redesign deve preservá-los para consulta e vínculo, mas priorizar rótulos compreensíveis para o médico, conforme RF-005-07 e RNF-008.
- A interface profissional pode sugerir prontidão para uso clínico real. O aviso de dados fictícios e as restrições da seção 11 devem permanecer visíveis e testados.

## Rastreabilidade

- RFs com IDs únicos: SIM
- ACs verificáveis: SIM
- RNFs mensuráveis: SIM, quando mensuráveis no escopo; os demais possuem evidência qualitativa explicitamente definida
- Rules críticas cobertas: SIM

## Checklist de integridade do review

- [x] Toda contradição possui dois ou mais trechos explícitos identificados.
- [x] Nenhuma lacuna foi classificada como contradição.
- [x] Nenhum requisito foi inferido sem fonte explícita.
- [x] Nenhuma decisão puramente técnica foi exigida como requisito de produto.
- [x] Rules aplicáveis foram consideradas.
- [x] Todo bloqueador exige realmente uma decisão de produto, domínio ou comportamento funcional.

## Veredito

PRD aprovado para criação da TechSpec.

A garantia de cobertura de dados está suficientemente especificada para a próxima etapa: a TechSpec deve transformar D-01 a D-15 e E-01 a E-17 em uma matriz executável, com destino, campo, consumidor, teste e evidência para cada item. O redesign não deve ser aceito enquanto qualquer campo, vínculo, estado, filtro, página ou metadado inventariado permanecer sem essa rastreabilidade.
