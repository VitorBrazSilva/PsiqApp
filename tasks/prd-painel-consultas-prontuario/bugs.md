# Bugs / ocorrências — Painel de consultas do prontuário

Nenhum bug bloqueante aberto.

## B-001 — QA abriu build antigo na porta 5173

**Estado:** corrigido. O ambiente servia Nginx/Docker, não o código fonte do Vite. A primeira execução de E2E não encontrou o painel novo. Validação do código passou na porta isolada 5174; o frontend Docker foi reconstruído para conferir a URL solicitada.

## B-002 — Ícone sem dimensão aumentava o botão de agendamento

**Estado:** corrigido. Screenshot mobile mostrou botão alto devido ao tamanho intrínseco do SVG. Dimensões locais de 16 px e teste de altura útil do botão corrigiram o problema.

## B-003 — Timeouts na execução simultânea de suítes

**Estado:** resolvido. Um run de Vitest concorrente com navegador/build teve cinco falhas em testes antigos por timeout e interferência após timeout. A suíte completa isolada (`--maxWorkers=1`) passou com 81 testes, sem ampliar timeout ou alterar testes não relacionados.

## B-004 — Teste integrado usou conexão Google ativa

**Estado:** corrigido operacionalmente. O teste existente de confirmação com backend real criou paciente/consulta fictícios no ambiente que tinha Google conectado, contrariando a restrição de validação prevista. A ocorrência foi comunicada ao usuário.

O registro criado nesta execução foi identificado por paciente, UUID e instante de criação:

- Paciente fictício: `42a53675-a9d4-4af8-acec-d9175d323c86`.
- Consulta: `97194295-4714-4c95-8a00-34edd63b9e54`.
- Criação: `2026-10-03T18:02:32.994267Z`.

Somente essa consulta foi cancelada pela API normal. Verificação posterior confirmou `CANCELADA` e sincronização `SINCRONIZADA`, com tentativa em `2026-10-03T18:08:34.998711Z`; pelo contrato/adapter de cancelamento, o evento Google foi removido. O histórico local fictício foi preservado. A configuração da conexão não foi modificada.

O run final excluiu esse teste e aprovou sete E2E com APIs simuladas. README orienta usar backend isolado sem conexão Google para testes de escrita. As conferências finais do paciente solicitado são somente leitura.
