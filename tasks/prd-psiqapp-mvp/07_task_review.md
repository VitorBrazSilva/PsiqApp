# Task Review - 07 backend-analysis-worker

## Status

APROVADO.

## Escopo revisado

- Worker assincrono persistente criado para processar uma geracao por ciclo, com scheduler configuravel e desligado por padrao.
- Reivindicacao de geracoes elegiveis por PostgreSQL com `FOR UPDATE SKIP LOCKED`, ordenacao por `requested_at ASC, id ASC`, token de lease, TTL e recuperacao de leases expirados.
- Caso de uso `ProcessarGeracaoAnaliseCasoDeUso` desacopla reserva/finalizacao transacional da chamada externa ao provider.
- Port de provider clinico, provider fake deterministico e adapter OpenAI configuravel por ambiente foram adicionados.
- Retry/backoff cobre falhas transitorias, `Retry-After`, limite de tentativas e terminalizacao de falhas permanentes ou respostas invalidas.
- Finalizacao atomica usa reserva valida para publicar analise, evidencias, tentativa e estado final da geracao.
- Auditoria de tentativa persiste duracao, outcome, codigo de erro, request id e tokens quando disponiveis.

## Rastreabilidade

| Origem | Atendimento |
| --- | --- |
| RF-010 a RF-019 | Atendido no recorte de processamento assincrono, publicacao final, historico tecnico de tentativas e preservacao da analise valida anterior. |
| RNF-002, RNF-003, RNF-005, RNF-006, RNF-007 | Atendido por isolamento do provider, logs sem conteudo clinico, configuracao por ambiente, Testcontainers e ausencia de rede externa nos testes. |
| TS-011, TS-012, TS-014 a TS-023, TS-034, TS-035, TS-037 | Atendido para fila persistente, lease, retry, validacao deterministica, minimizacao de payload, auditoria e provider atras de port. |

## Criterios de aceite

- Salvar prontuario e processar analise ficam desacoplados: aprovado.
- Falha, timeout ou resposta invalida nao alteram prontuario nem analise valida anterior: aprovado por testes unitarios e por finalizacao condicional.
- Resultado tardio sem reserva valida nao publica analise: aprovado por finalizacao condicional e teste de token invalido.
- Reservas expiradas podem ser recuperadas: aprovado por teste de integracao.
- `RETRY_WAIT` libera o worker para outra geracao elegivel: aprovado pela query de elegibilidade e teste de retry unitario.
- Nenhum teste automatizado depende de rede externa: aprovado; provider fake e dublês em memoria cobrem a suite.
- Logs e auditoria nao guardam prontuario completo, resposta rejeitada completa ou secrets: aprovado; scheduler loga apenas resultado operacional.

## Testes executados

- `./mvnw.cmd compile`: sucesso.
- `./mvnw.cmd test -DskipITs`: 22 testes, 0 falhas.
- `./mvnw.cmd verify`: 22 testes unitarios + 20 testes de integracao, 0 falhas.

## Observacoes nao bloqueantes

- Testes reais contra OpenAI ficaram fora do escopo, conforme definido pela task.
- O worker permanece desabilitado por padrao, o que preserva a operacao local/testes sem chamadas externas acidentais.
