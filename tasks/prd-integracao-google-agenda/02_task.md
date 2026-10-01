# Task 2.0 — Consultar disponibilidade e sincronizar consultas com processamento durável

## Objetivo

Integrar a disponibilidade Google e os eventos correspondentes às consultas do PsiqApp sem transferir a fonte de verdade do domínio para o Google. Persistência local deve sobreviver a falhas externas; sincronização deve ser recuperável, idempotente e visível por contrato.

## Rastreabilidade
- PRD: RF-001 a RF-006, RNF-001, RNF-002.
- TechSpec: TS-003, TS-004, TS-005, TS-006.
- Critérios de aceite: AC-RF001-02, AC-RF001-06; AC-RF002-01 a AC-RF002-06; AC-RF003-01 a AC-RF003-06; AC-RF004-01 a AC-RF004-05; AC-RF005-01 e AC-RF005-02; AC-RF006-01 e AC-RF006-02.

## Dependências

Task 1.0 aprovada: port, configuração e credenciais OAuth disponíveis. A interface de usuário será integrada na task 3.0.

## Escopo

- Criar o port de Calendar e adapter Google para `freeBusy.query` e eventos no calendário `primary`; o port retorna somente intervalos ocupados, sem detalhes de eventos existentes.
- Calcular conflito local por intervalo `[início, início + 1 hora)`, comparar instantes e considerar `America/Sao_Paulo` somente nas bordas de API/interface.
- Revalidar disponibilidade ao criar consulta. Com conexão ativa, indisponibilidade Google impede persistência e retorna erro sanitizado distinto de conflito; sem conexão ou após desconexão voluntária, validar apenas conflitos locais.
- Serializar a criação local concorrente com lock transacional definido na TechSpec. Consulta, idempotência e intenção de sincronização persistem atomicamente; nenhuma chamada Google ocorre dentro da transação.
- Persistir uma linha de sincronização por consulta nova, sem backfill de consultas legadas. Criar/atualizar evento após commit com identificador estável, reconciliar timeout sem duplicatas e processar estado atual da consulta.
- Refletir `REALIZADA` e `FALTA` no evento sem alterar início/fim; remover evento de consulta `CANCELADA`. Não sincronizar consulta legada sem evento/vínculo e expor `NAO_APLICAVEL`.
- Executar worker no backend existente, com claim paginado, recuperação após restart, retry exponencial limitado a cinco tentativas transitórias e nova tentativa manual. Não introduzir broker.
- Expor disponibilidade, estado de sincronização, contratos aditivos de consulta/status e endpoint de nova tentativa definidos na TechSpec; manter Problem Details sanitizado.
- Limitar payload de evento a nome, e-mail e horário. Não enviar CPF, observações ou conteúdo clínico; não armazenar/exibir detalhes de eventos Google existentes.
- Atualizar `docs/TECHNICAL.md` e `docs/BUSINESS.md` após confirmar o comportamento implementado; passar pelo `project-documentation-maintainer` antes do commit.

## Fora do escopo da task

- Interface React para conexão, verificação e apresentação do estado, coberta pela task 3.0.
- Importação de eventos Google, sincronização bidirecional, escolha de outros calendários, broker externo ou testes contra serviço Google real.
- Alterar duração da consulta, permitir edição da data/hora após criação ou modificar os estados locais existentes.

## Subtarefas

- [ ] 2.1 Adicionar estado durável de sincronização/migration e proteção concorrente da disponibilidade local.
- [ ] 2.2 Implementar port/adapter FreeBusy, casos de uso e contrato HTTP de disponibilidade.
- [ ] 2.3 Integrar criação e transição de status com sincronização persistida após commit.
- [ ] 2.4 Implementar worker, reconciliação idempotente, retries e nova tentativa manual.
- [ ] 2.5 Cobrir contratos, privacidade, falhas e arquitetura com testes automatizados e fakes.

## Critérios de sucesso

- Conflito local ou Google impede criação; falha de verificação numa conexão ativa também impede criação, mas não é reportada como conflito. Desconexão voluntária mantém o fluxo local.
- Criações locais concorrentes não ocupam o mesmo intervalo; API valida novamente no `POST` mesmo após disponibilidade previamente aprovada na interface.
- Consulta e intenção de sincronização são atômicas. Timeout/falha Google não desfaz consulta ou status já persistidos.
- Worker reconcilia consulta criada, `REALIZADA`, `FALTA` e `CANCELADA`; retries e repetição manual não duplicam evento e são recuperáveis após restart.
- Nenhuma migration cria evento/vínculo para consultas legadas; eventos Google existentes e seus detalhes não aparecem como consultas do PsiqApp.
- API retorna somente estado/código sanitizado; testes comprovam ausência de CPF, observações, conteúdo clínico, tokens e respostas brutas Google em payloads/logs.
- A verificação arquitetural existente confirma dependências em direção `adapter/config -> application -> domain`; documentação técnica e de negócio reflete apenas o que foi implementado e passa pelo `project-documentation-maintainer`.

## Testes obrigatórios
- [ ] Unitários: sobreposição, fim exclusivo, uma hora, instantes/fuso, payload por status, mapeamento de erros, retry e reconciliação de IDs estáveis.
- [ ] Integração: migration/índices/claim com PostgreSQL Testcontainers; conflitos locais concorrentes; atomicidade; idempotência; rotas/status; retry após restart.
- [ ] E2E/sistema: N/A para tela nesta task; verificar contratos HTTP de disponibilidade, criação, status e retry. Os fluxos de navegador serão cobertos na task 3.0.
- [ ] Casos de erro/edge cases: consulta local ou Google ocupada, Google indisponível/revogado, timeout ambíguo de criação, erro transitório/permanente, evento já ausente ao remover, falha sem perda de consulta, consulta cancelada antes de criar evento e consulta legada.
- [ ] Contrato Google por fakes/servidor HTTP fake; nenhum teste usa rede externa ou dados reais.
- [ ] Executar ArchUnit existente; não criar ferramenta arquitetural nova.

## Skills aplicáveis

N/A para interface. Usar fakes nos serviços externos conforme `.agents/rules/testing-quality.md`.

## Módulo/responsabilidade e Rules aplicáveis
- Módulo e responsabilidade existentes que esta task altera: `CriarConsultaUseCase`, `AtualizarStatusConsultaUseCase`, `RepositoryConsultaPort`, `ConsultaController`, `ConsultaResponse`, adapters de persistência, migrations, configuração e worker do backend.
- Rules/TS de arquitetura que a task precisa preservar: `.agents/rules/architecture-boundaries.md`, `.agents/rules/clinical-data-privacy.md` e `.agents/rules/testing-quality.md`; TS-003 a TS-006. Não chamar provider dentro de transação, não importar/expor detalhes Google, manter a consulta como fonte de verdade e usar somente campos mínimos no evento.
- Verificação correspondente (ou `N/A`, com motivo): testes ArchUnit existentes, Testcontainers, testes de contrato com fake e revisão de payload/logs sanitizados.

## Arquivos/módulos prováveis

- `apps/backend/src/main/java/com/psiqapp/application/port/out/` e `application/usecase/`.
- `apps/backend/src/main/java/com/psiqapp/adapter/in/web/ConsultaController.java`, `ConsultaResponse.java` e novos DTOs/controllers.
- `apps/backend/src/main/java/com/psiqapp/adapter/out/persistence/`, novos adapters Google em `adapter/out/` e `config/`.
- Nova migration Flyway para sincronização e índices/garantias de concorrência.
- Testes unitários, API/PostgreSQL, worker, privacidade, contrato Google fake e ArchUnit.
- `docs/TECHNICAL.md` e `docs/BUSINESS.md`.
