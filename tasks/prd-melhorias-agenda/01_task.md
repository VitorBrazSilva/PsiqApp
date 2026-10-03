# Task 1.0 — Implementar disponibilidade mensal e confirmação segura no backend

## Objetivo

Entregar a consulta mensal de horários livres com as fontes locais e Google aplicáveis, e garantir que a criação revalide o horário com a mesma regra temporal antes de persistir. A disponibilidade mensal é uma leitura, não uma reserva. A mudança preserva a criação manual retroativa e o fluxo durável de sincronização posterior.

## Rastreabilidade
- PRD: RF-001, RF-002, RF-003, RNF-001, RNF-002.
- TechSpec: TS-001, TS-002, TS-003 e TS-004 (backend).
- Critérios de aceite: AC-RF001-01 a AC-RF001-06; AC-RF002-01 e AC-RF002-03 (contrato backend); AC-RF003-02, AC-RF003-03 e AC-RF003-04.

## Dependências

Nenhuma.

## Escopo

- Criar a regra temporal pura de disponibilidade para consulta de uma hora, candidatos em passos de 30 minutos, sobreposição com fim exclusivo e conversão por `America/Sao_Paulo`, incluindo virada de dia/mês/ano e regras de transição de fuso.
- Criar a consulta mensal e sua rota/DTO, usando `Clock` do servidor, início hoje, janela estendida para cobrir a última consulta do mês e uma leitura mínima das consultas locais `AGENDADA`.
- Reutilizar a integração Google existente por meio de um serviço de aplicação compartilhado pela busca mensal e pela verificação exata. Distinguir ausência/desconexão de uma conexão `INDISPONIVEL`; em falha Google ativa, retornar indisponibilidade sem slots parciais.
- Ajustar a verificação exata e `CriarConsultaUseCase` para usar a regra compartilhada e preservar a revalidação, o lock local, a idempotência, a gravação atômica e a chamada Google fora da transação final.
- Manter DTOs, erros e logs sanitizados e aplicar `Cache-Control: no-store` às novas leituras conforme TS-011. Atualizar o contrato OpenAPI existente.

## Fora do escopo da task

- Componentes de calendário, horários e formulário no frontend, cobertos pela Task 3.0.
- Grupos, filtros por período, contagens e paginação da agenda, cobertos pela Task 2.0.
- Migrações, mudanças de status, alterações no worker Google ou novas dependências de calendário.
- Restringir globalmente o POST a datas futuras ou alterar a permissão existente de criar consultas retroativas.

## Subtarefas
- [x] 1.1 Implementar a regra temporal pura e cobrir duração, passo, adjacência, sobreposição, horários passados e limites civis.
- [x] 1.2 Implementar a leitura mínima de ocupação local, o caso de uso mensal e o contrato HTTP para busca mensal.
- [x] 1.3 Extrair a consulta de ocupação Google compartilhada sem adicionar ports ou dependências; preservar os estados de conexão existentes.
- [x] 1.4 Reutilizar a regra no caminho de verificação/criação, mantendo idempotência, atomicidade, concorrência local e sincronização posterior.
- [x] 1.5 Adicionar testes unitários/integração e verificar sanitização, contrato OpenAPI, cache e fronteiras arquiteturais.

## Critérios de sucesso

- A busca válida retorna os dias e inícios livres do mês, começando hoje e considerando consultas `AGENDADA` e, quando ativa, ocupações Google.
- Um dia só contém horários cuja consulta de uma hora esteja livre; adjacências são permitidas e conflitos que atravessam meia-noite ou o limite do mês são considerados.
- Uma busca faz uma leitura local e no máximo uma consulta lógica Google. Falha Google ativa retorna 503 distinto de mês sem horários e não expõe resultado parcial.
- Os resultados HTTP de disponibilidade não contêm paciente, cadastro, observações, detalhes de eventos ou credenciais.
- A confirmação bloqueia conflitos locais/Google detectados na revalidação, não duplica criações concorrentes e mantém o contrato de idempotência e sincronização atual.
- O código permanece dentro das responsabilidades aprovadas na TechSpec; a avaliação documental aplicável ocorre antes do commit da implementação.

## Testes obrigatórios
- [x] Unitários: regra temporal, limites de mês/ano/fuso, data atual, fontes local/Google e classificação de indisponibilidade.
- [x] Integração: rota mensal, consulta SQL mínima, status/erros HTTP, revalidação no POST, conflito e atomicidade com PostgreSQL Testcontainers.
- [x] E2E/sistema: N/A nesta task de backend; os fluxos visuais das duas origens ficam na Task 3.0.
- [x] Casos de erro/edge cases relevantes: slot de 23:30, conflito na virada do mês, horário que passou durante a leitura, Google ativo indisponível, conexão que muda durante a leitura, concorrência e repetição idempotente após resposta perdida.
- [x] Integrações Google devem usar mocks/fakes locais; nenhum teste depende de rede ou conta real.

## Skills aplicáveis

N/A para a implementação backend. Seguir as regras e contratos já definidos na TechSpec.

## Módulo/responsabilidade e Rules aplicáveis
- Módulo e responsabilidade existentes que esta task altera: regra pura em `domain/modelo`; orquestração em `application/usecase` e `application/servico`; contratos em `application/port/out`; HTTP em `adapter/in/web`; SQL em `adapter/out/persistence`; Calendar em `adapter/out/google`; composição em `config`.
- Rules/TS de arquitetura que a task precisa preservar: `.agents/rules/architecture-boundaries.md`, `.agents/rules/clinical-data-privacy.md`, `.agents/rules/product-invariants.md` e `.agents/rules/testing-quality.md`; TS-001–004 e TS-011/012. Não introduzir SDK Google em camadas internas, não expor dados pessoais e não alterar os fluxos clínicos ou de IA.
- Verificação correspondente (ou `N/A`, com motivo): executar `ArquiteturaTest` e testes de API/integração com Calendar fake; inspecionar DTOs, erros e logs para confirmar minimização de dados.

## Arquivos/módulos prováveis

- `apps/backend/src/main/java/com/psiqapp/domain/modelo/` e `application/usecase/`, `application/servico/`, `application/port/out/`.
- `apps/backend/src/main/java/com/psiqapp/adapter/in/web/ConsultaController.java` e DTOs novos de disponibilidade.
- `apps/backend/src/main/java/com/psiqapp/adapter/out/persistence/AdapterConsultaJpa.java` e `apps/backend/src/main/java/com/psiqapp/adapter/out/google/`.
- `apps/backend/src/test/java/com/psiqapp/` — testes unitários, integração de consultas/Google e arquitetura.
- Avaliar `docs/BUSINESS.md` e `docs/TECHNICAL.md` após confirmar o comportamento implementado; README somente se houver impacto operacional.

## Adendo de QA final — 02/10/2026

QA-004: acrescentada a restrição de dependências com.google.. ao domínio e aplicação no ArquiteturaTest, conforme TS-012. Teste ampliado aprovado (2/2); revisão técnica confirmou compatibilidade com as fronteiras atuais, sem mudança produtiva. Manutenção documental: TECHNICAL já descreve o gate de dependências; BUSINESS/README sem impacto desta correção. Status da Task 1 permanece APROVADO. Evidência: apps/backend/target/feature-qa-architecture.log; achado em bugs.md.
