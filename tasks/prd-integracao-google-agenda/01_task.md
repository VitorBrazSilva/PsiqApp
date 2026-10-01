# Task 1.0 — Implementar conexão OAuth Google com credenciais protegidas

## Objetivo

Entregar o ciclo server-side de conexão e desconexão Google, com estado persistido e refresh token cifrado. A aplicação deve continuar iniciando quando OAuth não estiver configurado, e nenhuma credencial pode chegar à SPA, às respostas HTTP ou aos logs.

## Rastreabilidade
- PRD: RF-001, RNF-001, RNF-002.
- TechSpec: TS-002, TS-004 (persistência da conexão), TS-005 (rotas OAuth), TS-006.
- Critérios de aceite: AC-RF001-01, AC-RF001-03, AC-RF001-04, AC-RF001-05.

## Dependências

Nenhuma. Esta task cria a base de autorização consumida pela task 2.0.

## Escopo

- Criar o port de autorização e o adapter OAuth Google server-side, mantendo SDK e chamadas externas em `adapter/out`.
- Persistir estado da conexão e refresh token cifrado com AES-256-GCM, chave externa ao repositório e IV aleatório; não persistir access token.
- Implementar início/callback OAuth com `state` aleatório, de uso único e vinculado à sessão; usar cookie seguro conforme ambiente e destinos de redirect fixos.
- Expor estado, início da conexão, callback e desconexão nos contratos da TechSpec. Revogar a autorização somente em ação explícita do médico; a desconexão local deve ocorrer mesmo se a revogação remota falhar.
- Tratar credenciais ou chave ausentes como `NAO_CONFIGURADA`, sem impedir o startup, e impedir que uma configuração incompleta inicie o fluxo.
- Sanitizar estados e erros de autorização; nunca expor token, código OAuth, `state`, client secret ou payload do provider.
- Incluir placeholders de configuração em `.env.example` e documentação operacional/técnica compatível com o comportamento implementado.

## Fora do escopo da task

- Consulta FreeBusy, criação/atualização/remoção de eventos e worker de sincronização, cobertos pela task 2.0.
- Painel de conexão e ações visuais na página Agenda, cobertos pela task 3.0.
- Uso de dados reais de pacientes ou testes contra conta Google real.

## Subtarefas

- [x] 1.1 Adicionar propriedades opcionais e persistência do estado/token cifrado da conexão.
- [x] 1.2 Implementar port, adapter e casos de uso OAuth com validação de `state` e redirects fixos.
- [x] 1.3 Expor contratos HTTP de estado, conexão, callback e desconexão com respostas sanitizadas.
- [x] 1.4 Cobrir segurança, falhas de configuração e fluxo OAuth com fakes; atualizar `.env.example` e documentação aplicável.

## Critérios de sucesso

- A autorização concluída registra conexão ativa e o endpoint de estado não retorna credenciais.
- `state` incorreto, expirado ou reutilizado é rejeitado; callback e erros não revelam código/token em resposta ou logs.
- O refresh token só existe persistido cifrado; teste prova cifra/decifra e rejeição de chave inválida.
- Sem configuração OAuth ou chave de cifra, o backend inicia e informa integração não configurada; iniciar conexão é recusado de forma segura.
- Desconectar apaga a credencial local e tenta revogação remota sem depender do sucesso do Google nem remover eventos existentes.
- `.env.example` contém somente placeholders. Documentação atualiza apenas configuração e comportamento confirmados no código e passa pelo `project-documentation-maintainer` antes do commit.

## Testes obrigatórios
- [x] Unitários: cifra/decifra AES-GCM, configuração ausente/inválida, criação e validação/uso único de `state`, classificação de falhas OAuth.
- [x] Integração: migration/adapter de conexão; rotas de início, callback, estado e desconexão; segredo ausente sem falha de startup.
- [x] E2E/sistema: N/A nesta task; o fluxo visual completo será coberto na task 3.0.
- [x] Casos de erro/edge cases: revogação remota falha, callback inválido/reutilizado, refresh token ausente, destino de redirect não permitido e ausência de segredo em resposta/log.
- [x] Usar fakes ou servidor HTTP fake; nenhum teste automatizado depende de rede Google ou de dados reais.

## Skills aplicáveis

N/A para implementação de interface. Seguir os limites de OAuth e privacidade definidos na TechSpec.

## Módulo/responsabilidade e Rules aplicáveis
- Módulo e responsabilidade existentes que esta task altera: `application/port/out` e `application/usecase` para contratos/orquestração; `adapter/in/web` para rotas e DTOs; `adapter/out/persistence` para estado cifrado; novo adapter OAuth em `adapter/out`; `config` para propriedades e composição.
- Rules/TS de arquitetura que a task precisa preservar: `.agents/rules/architecture-boundaries.md` e `.agents/rules/clinical-data-privacy.md`; TS-002, TS-004, TS-005 e TS-006. SDK OAuth permanece no adapter; não introduzir autenticação global nem tratar OAuth como login do PsiqApp.
- Verificação correspondente (ou `N/A`, com motivo): executar os testes ArchUnit existentes e testes de contrato com fake; revisar respostas, cookies, configuração e logs para confirmar ausência de segredo/token.

## Arquivos/módulos prováveis

- `apps/backend/pom.xml` e configuração em `apps/backend/src/main/resources/`.
- Novos ports/casos de uso em `apps/backend/src/main/java/com/psiqapp/application/port/out/` e `application/usecase/`.
- Novos adapters em `apps/backend/src/main/java/com/psiqapp/adapter/out/` e endpoints/DTOs em `adapter/in/web/`.
- Entidade, repositório e migration Flyway para `conexao_google_agenda`.
- Testes unitários, de integração e arquitetura do backend.
- `.env.example`, `README.md` e `docs/TECHNICAL.md`, somente nos trechos de configuração efetivamente implementados.
