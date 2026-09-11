# Code Review - Task 04

## Status

APROVADO COM OBSERVACOES

Revisao tecnica executada em 2026-09-11 apos os ajustes solicitados pela revisao inicial.

## Evidencia final

Em `apps/backend`, com `JAVA_HOME` apontando para `.cache/backend-tools/jdk-21.0.12.1+1`:

- `./mvnw.cmd verify`: aprovado.
- Unitarios: 17 testes, 0 falhas.
- Integracao/Testcontainers: 8 testes, 0 falhas.

## Blockers revisados

- Transacoes: resolvido. Controllers chamam casos de uso; a demarcacao transacional fica em `TransactionRunnerPort`/`AdaptadorTransacao`, usada pelos casos de uso de criacao e atualizacao.
- Idempotencia concorrente: resolvido no escopo MVP local. `IdempotenciaServico` serializa a mesma operacao/paciente/chave durante a criacao e os testes concorrentes confirmam retorno do mesmo recurso sem duplicacao.
- Status concorrente: resolvido. A mudanca de status usa update condicional atomico somente quando a consulta ainda esta `AGENDADA`, com limpeza do contexto JPA apos o update.
- Cobertura de testes: resolvido. Foram adicionados cenarios de idempotencia de consulta, concorrencia, paginacao, busca literal, finais `REALIZADA`/`CANCELADA`/`FALTA`, rejeicao de `AGENDADA`, 400/404/409 e Problem Details.

## Non-blocking

- A listagem de consultas e a busca de pacientes usam `JdbcTemplate` com SQL parametrizado para filtros opcionais e busca literal por curingas. O desenho e seguro para o escopo atual; uma camada comum de query pode ser considerada quando houver mais telas com filtros semelhantes.
- A idempotencia persiste hash canonico, referencia do recurso e status original. Para pacientes e consultas, repetir a chamada resolve o recurso atual pelo ID; contratos futuros com respostas imutaveis podem exigir snapshot completo da resposta.
- A serializacao de idempotencia e local ao processo, adequada ao MVP local desta task. Se o produto passar a rodar multiplas instancias, o mecanismo deve evoluir para coordenacao no banco.

## Pontos positivos

- Dominio nao depende de Spring, JPA, Hibernate ou adapters; o ArchUnit cobre essa fronteira.
- Casos de uso recebem ports e `Clock`, mantendo validacao temporal testavel.
- Controllers mantem DTOs separados e nao carregam transacoes de negocio.
- Migration define indices, FK, check de status e unicidade de CPF/idempotencia.
- Problem Details centraliza 400/404/409 e nao expoe valores rejeitados.
- Testes cobrem validacoes cadastrais, idempotencia, busca normalizada, HTTP 201/200/400/404/409, CPF concorrente e isolamento por paciente.

## Veredito

Implementacao tecnicamente aprovada. Nao ha blockers de arquitetura, privacidade, transacao, persistencia, testabilidade ou escopo.
