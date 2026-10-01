# Code Review — Task 01

## Status
APROVADO

## Arquitetura

- O controller HTTP chama casos de uso; estes dependem de ports da aplicação.
- O SDK OAuth e chamadas de rede estão em `adapter/out/google`.
- Criptografia e persistência ficam em `adapter/out/persistence`; `config` compõe propriedades e beans.
- ArchUnit passou sem exceção nova.

## Segurança e tratamento de erros

- Tokens não aparecem em DTOs; mensagens OAuth são reduzidas a resultado opaco.
- `state` é comparado em tempo constante, consumido uma vez e expira em dez minutos.
- Cookies são `HttpOnly`, `SameSite=Lax` e `Secure` fora de loopback.
- AES-GCM valida a chave de 32 bytes, usa IV aleatório de 12 bytes e não propaga dados de credencial em erros.
- Não há log de URL OAuth, código, token ou payload do provider na configuração de logging atual.
- Falha de revogação não desfaz a desconexão local.

## Problemas bloqueantes

Nenhum.

## Problemas não bloqueantes

- O cache efêmero de `state` é por processo, coerente com a aplicação única descrita para o MVP; clusterização exigiria armazenamento compartilhado e nova decisão técnica.
- A integração OAuth ainda não renova access tokens para Calendar; a credencial renovável é entregue ao port para uso na task 2.0.

## Verificações

- `apps/backend/mvnw.cmd clean verify` — aprovado (unitários, integração, ArchUnit e migrations).
- `git diff --check` — aprovado.

## Veredito

Sem blockers técnicos. Aprovado.
