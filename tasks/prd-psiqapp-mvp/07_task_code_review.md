# Code Review - 07 backend-analysis-worker

## Status

APROVADO, sem blockers.

## Achados

Nenhum blocker encontrado.

## Verificacoes principais

- Concorrencia: a reivindicacao usa `FOR UPDATE SKIP LOCKED`, ordenacao deterministica e atualizacao atomica no banco.
- Leases: finalizacao de sucesso e falha exige `state = RUNNING`, `lease_token` correspondente e lease ainda valido.
- Transacoes: a reserva e a finalizacao ficam em transacoes curtas; a chamada ao provider ocorre fora da transacao principal.
- Retry: falhas transitorias sao reagendadas com limite de tentativas, backoff/jitter e suporte a `Retry-After`; falhas permanentes encerram a geracao.
- Validacao clinica: resposta do provider passa pelo validador deterministico do core antes da publicacao.
- Privacidade: payload enviado ao provider usa snapshot minimizado; logs operacionais nao incluem prontuario, resposta bruta, segredo ou payload completo.
- Testabilidade: provider fake deterministico e testes em memoria evitam dependencia de rede externa; integracao usa PostgreSQL via Testcontainers.
- Configuracao: adapter OpenAI fica atras de port e so e ativado por `psiqapp.analysis.provider.type=openai`.

## Testes revisados

- Unidade do caso de uso cobre falha transitoria, falha permanente e resposta invalida.
- Integracao cobre processamento com fake provider, reserva concorrente/ocupada, recuperacao de lease expirado e finalizacao recusada por token invalido.
- Suite completa de backend passou com `./mvnw.cmd verify`.

## Riscos residuais nao bloqueantes

- A integracao real com OpenAI nao foi exercitada automaticamente, por decisao de escopo e para evitar rede externa/secrets nos testes.
- O schema estruturado e validado localmente pelo core apos a resposta; o adapter usa o SDK oficial, mas a garantia clinica continua no backend.
