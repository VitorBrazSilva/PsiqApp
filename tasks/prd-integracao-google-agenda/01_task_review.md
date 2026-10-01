# Review — Task 01

## Status
APROVADO

## Rastreabilidade
| Origem | ID | Status | Evidência |
|---|---|---|---|
| PRD | RF-001 / AC-RF001-01 | Atendido | Callback fake conecta, persiste a credencial e `GET /integracoes/google-agenda` informa `CONECTADA`. |
| PRD | AC-RF001-03 | Atendido | Desconexão persiste `DESCONECTADA`; consulta de estado devolve esse valor. |
| PRD | AC-RF001-04/05 | Atendido no contrato server-side | Estados de persistência inacessível/erro são sanitizados como `INDISPONIVEL`; a interface e a ação de reconexão são da task 3.0. |
| PRD | RNF-001 | Atendido | Testes confirmam texto cifrado no banco, ausência de credenciais no estado HTTP e callbacks inválidos sem troca de código. |
| PRD | RNF-002 | Atendido para OAuth desta task | Nenhum dado clínico é enviado no fluxo OAuth; escopos limitados no adapter. Payload de eventos pertence à task 2.0. |
| TechSpec | TS-002/004/005/006 | Atendido no escopo 1.0 | Ports, adapter OAuth, migration, rotas sanitizadas, configuração opcional e cifra conforme especificado. |
| Task | ACs/testes obrigatórios | Atendido | `clean verify`: unitários, ArchUnit, migration, bootstrap sem configuração e integração HTTP/JPA com fakes. |

## Arquivos revisados

Implementação Java, configuração, migration V005, testes unitários e de integração, `.env.example`, Compose, README, `docs/TECHNICAL.md` e Task 01.

## Problemas bloqueantes

Nenhum.

## Problemas não bloqueantes

- O estado OAuth transitório fica em memória por até dez minutos, conforme o deployment de aplicação única do MVP; reinício invalida callbacks pendentes de modo seguro.
- Consultas de disponibilidade/eventos e painel da Agenda permanecem nas tasks 2.0 e 3.0.

## Testes e verificações executadas

- `apps/backend/mvnw.cmd clean verify` — aprovado; inclui ArchUnit e testes Testcontainers com PostgreSQL 18.6.
- Testes Google usam Mockito/fakes; nenhuma chamada automatizada acessa Google.
- `git diff --check` — aprovado.

## Pontos positivos

- `state` aleatório, vinculado a cookie `HttpOnly`/`SameSite=Lax`, de uso único e com expiração.
- Chave e callbacks validados; URLs de retorno não são aceitas na requisição.
- Refresh token cifrado com AES-256-GCM e IV novo; nenhum access token é persistido.
- Desconexão local independe de revogação remota.

## Veredito

Task 01 atende o escopo e os critérios verificáveis no backend. Aprovada para code review e manutenção documental.
