# Revisão documental do estado do PsiqApp

Revisão realizada em 23/09/2026, comparando `docs/BUSINESS.md` e `docs/TECHNICAL.md` com o código em `apps/`, as migrations, o README, as Rules e os artefatos das features `prd-psiqapp-mvp` e `prd-refatoracao-arquitetural-nomenclaturas`.

## Conclusão

Os documentos anteriores estavam parcialmente defasados. Eles misturavam capacidades já implementadas com planos da TechSpec, usavam contratos e nomes antigos em vários pontos e não deixavam visível que o gate do MVP ainda está `NOT READY`.

Os documentos vivos foram atualizados para descrever a implementação encontrada. A aprovação registrada da refatoração permanece indicada como histórico, enquanto as divergências verificadas no código continuam explícitas. Esta revisão não reexecuta os testes nem altera o código de produção.

## Estado das features

| Feature | Estado registrado | Leitura atual |
|---|---|---|
| `prd-psiqapp-mvp` | `NOT READY` em `feature-review.md`; QA e clinical safety reprovados, com atualização posterior registrando backend/Compose/E2E funcionais | Tasks 01–10 estão implementadas. A task 11 tem implementação parcial e ainda não fecha a evidência integrada de falhas da IA, isolamento completo, logs e volume representativo. |
| `prd-refatoracao-arquitetural-nomenclaturas` | `READY` em `feature-review.md` e QA aprovado | Rotas, payloads públicos, tabelas principais e enums foram atualizados. A inspeção atual ainda encontra divergências entre a nomenclatura final especificada e nomes internos, além de riscos no upgrade de uma base V003 populada. |

## Achados que afetam a documentação

### 1. O MVP está funcional, mas não aprovado como feature completa

O código contém os fluxos de pacientes, consultas, registros clínicos, análise e frontend. Porém `tasks/prd-psiqapp-mvp/feature-review.md` mantém `NOT READY`, e `qa-report.md` lista como pendentes os cenários integrados de falha/timeout/retry da IA, volume representativo e varredura operacional de logs. `11_task.md` também mantém essas verificações desmarcadas. A documentação agora diferencia implementação de aprovação.

### 2. A nomenclatura pública mudou, mas a padronização interna ainda não é total

O código efetivo usa rotas como `/pacientes`, `/consultas`, `/registros-clinicos` e `/estado-analise`, tabelas portuguesas em V004 e respostas com campos como `dataHoraClinica`, `criadoEm` e `podeRegenerar`. Isso foi refletido nos documentos.

Ao mesmo tempo, a TechSpec final previa `domain/model`, `application/service`, classes `...JpaEntity` e repositórios `...SpringDataRepository`, enquanto o código ainda contém `domain/modelo`, `application/servico`, `Entidade...Jpa` e `Repository...JpaSpring`. `ArquiteturaTest` também mantém referências de compatibilidade a pacotes e nomes antigos. Esses pontos não devem ser documentados como encerrados sem nova decisão ou nova evidência.

### 3. V004 não demonstra upgrade seguro de uma base V003 com dados

`V004__padronizacao_nomenclaturas.sql` é suficiente para o bootstrap de uma base nova sem dados históricos, conforme os testes que verificam as quatro migrations. Não foi encontrado teste que prepare uma base V003 populada e compare o antes/depois.

Há dois riscos concretos no caminho populado:

- o trigger append-only de `analise_clinica` é reativado antes da atualização posterior do JSONB, portanto uma análise existente pode fazer a migration falhar;
- os valores antigos de `evidencia_analise.campo` (`TEXT`, `MOOD`, `MEDICATIONS`) não são convertidos para `TEXTO`, `HUMOR`, `MEDICAMENTOS`, embora V004 crie o check que aceita apenas os nomes portugueses.

Além disso, a normalização detalhada do JSONB converte apenas os itens de `linhaDoTempo`; os itens de `padroes` e `pontosDeAtencao` históricos não recebem a mesma conversão. Por isso, `TECHNICAL.md` agora trata V004 como uma migração implementada com risco de upgrade pendente, e não como preservação comprovada de dados existentes.

### 4. O adapter OpenAI ainda envia campos internos do snapshot

`OpenAiAnaliseClinicaAdapter.montarPayload` serializa diretamente `SnapshotAnalise.RegistroSnapshot`, que contém `id` e `revisao`. A regra da TechSpec exige que o provider receba apenas alias, tipo, referência temporária, data/hora clínica, texto, humor e medicamentos. O documento técnico passou a registrar essa diferença como pendência de privacidade/minimização.

O mesmo adapter mantém instruções textuais com chaves inglesas e `SUMMARY_ONLY`, enquanto o contrato interno final usa campos e modo em português. O provider fake não cobre essa divergência de prompt.

### 5. A cobertura integrada não deve ser inferida pelo nome dos arquivos E2E

`isolamento-e-falha-ia.spec.ts` contém isolamento e análise com histórico insuficiente, mas não contém um cenário real de falha/timeout/retry do provider. O relatório da task 11 já registra essa lacuna. `TECHNICAL.md` agora descreve os cinco cenários E2E pelo comportamento efetivamente presente.

## Alterações realizadas

- `docs/BUSINESS.md`: capacidades atuais, status do gate do MVP, histórico de análise disponível na UI e limites de validação foram alinhados ao código e aos relatórios.
- `docs/TECHNICAL.md`: contratos portugueses, schema V004, componentes efetivos, worker, IA, erros, Compose, frontend, testes e pendências foram reescritos para o estado presente; nomes antigos deixaram de aparecer como rotas ou tabelas ativas.
- `tasks/prd-psiqapp-mvp/tasks.md`: task 11 passou a aparecer explicitamente como parcial e `NOT READY`.
- `tasks/prd-refatoracao-arquitetural-nomenclaturas/tasks.md`: o checkbox da task 8 foi alinhado ao encerramento registrado, com ressalva das divergências atuais.
- Os dois PRDs receberam uma nota de estado, preservando os requisitos originais sem apresentá-los como prova de implementação.

## Próximas ações recomendadas

1. Criar teste de upgrade V003 → V004 com análises, evidências e JSONB fictícios já persistidos; corrigir a migration antes de usar uma base existente.
2. Remover `id` e `revisao` do DTO enviado ao provider e alinhar prompt, schema e nomes de modo.
3. Decidir se os nomes internos restantes serão concluídos conforme a TechSpec ou formalmente justificados.
4. Completar a task 11 do MVP e atualizar os gates somente após evidência integrada de falhas da IA, isolamento, logs e volume.
