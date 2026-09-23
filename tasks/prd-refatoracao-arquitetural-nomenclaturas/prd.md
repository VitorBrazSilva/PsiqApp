# PRD — Refatoração arquitetural e padronização de nomenclaturas

> Situação conferida em 23/09/2026: as tasks 01–08 têm encerramento registrado e o feature review registra `READY`. A revisão atual encontrou diferenças entre a padronização especificada e a implementação, além de riscos na migração de bases existentes. Consulte a [revisão documental](../../docs/REVISAO-DOCUMENTAL.md) e o estado implementado em [TECHNICAL.md](../../docs/TECHNICAL.md). Este PRD mantém os requisitos e critérios de aceite; seu texto não comprova que todos foram atendidos.

## 1. Visão geral

O PsiqApp deverá passar por uma refatoração arquitetural transversal para padronizar as nomenclaturas do sistema e melhorar a separação de responsabilidades entre domínio, aplicação, contratos, serviços, adaptadores e componentes frontend.

A iniciativa trata o MVP como um sistema único. Não há clientes externos nem versões antigas da API que precisem permanecer compatíveis. Os consumidores internos, contratos, testes, documentação e persistência poderão ser atualizados em conjunto, desde que o sistema continue funcionando e todos os testes existentes passem.

A refatoração deve preservar o comportamento funcional, as regras de negócio, os invariantes clínicos, o isolamento entre pacientes e a independência da persistência clínica em relação à IA.

## 2. Problema e motivação

O sistema apresenta mistura de convenções de nomenclatura entre o domínio, os papéis arquiteturais, a API, os contratos JSON, o frontend, a persistência, os testes e a documentação. Também existem componentes que podem concentrar mais de uma responsabilidade ou mais de um motivo de mudança.

Essa situação aumenta o custo de entendimento e manutenção, dificulta a localização das fronteiras arquiteturais, torna os contratos menos consistentes e amplia o risco de alterações acidentais em comportamentos clínicos e dados persistidos.

A iniciativa busca tornar a estrutura do sistema mais coerente e os componentes mais coesos, sem transformar a refatoração em uma mudança de produto.

## 3. Persona e contexto de uso

### Persona

Equipe responsável por evoluir, testar, revisar e manter o PsiqApp MVP.

### Contexto

O produto é um protótipo local de apoio ao prontuário psiquiátrico, validado exclusivamente com dados fictícios. A refatoração ocorrerá em backend, frontend, contratos, persistência, testes e documentação conforme cada área for afetada.

O médico usuário do MVP não deve perceber alteração nas regras ou nos fluxos funcionais do produto. A decisão clínica continua pertencendo ao médico, e a IA permanece somente como apoio à leitura longitudinal.

## 4. Objetivos

- Padronizar os conceitos de negócio em português em todas as áreas aplicáveis do sistema.
- Manter em inglês as nomenclaturas de papéis e padrões arquiteturais convencionais, quando aplicável.
- Padronizar endpoints, campos JSON e nomes de tabelas em português, com consistência entre produtores e consumidores.
- Identificar e corrigir componentes com responsabilidades múltiplas ou motivos de mudança distintos.
- Preservar regras de negócio, invariantes clínicos, isolamento entre pacientes, dados existentes e comportamento funcional.
- Manter a persistência de registros clínicos independente da disponibilidade ou do sucesso da IA.
- Atualizar testes, contratos e documentação para refletir o estado padronizado.
- Permitir rastrear as mudanças até requisitos, critérios de aceite, tasks e evidências de teste.

## 5. Métricas / critérios de sucesso

- Todos os conceitos de domínio afetados pela iniciativa usam nomenclatura em português de forma consistente.
- Todos os papéis arquiteturais afetados usam a nomenclatura convencional definida para o projeto, em inglês quando aplicável.
- Endpoints, campos JSON, modelos internos correspondentes, testes e documentação afetados usam a mesma convenção em português.
- As tabelas e demais nomes de persistência afetados seguem uma única convenção em português, sem perda ou alteração semântica dos dados.
- Todas as responsabilidades múltiplas identificadas no escopo são avaliadas e tratadas ou justificadas explicitamente.
- O backend, o frontend, os testes existentes, os testes adicionados para as novas fronteiras, os checks de qualidade e os fluxos integrados aplicáveis passam após a refatoração.
- Nenhuma regra funcional, invariante clínico ou comportamento de isolamento entre pacientes é alterado.
- Cada mudança relevante possui rastreabilidade até requisito, critério de aceite, task e evidência de teste.

## 6. Escopo funcional

### RF-001 — Padronização dos conceitos de negócio
**Descrição:**

Os nomes que representam conceitos de negócio, clínicos e operacionais devem permanecer em português e seguir uma convenção consistente em código, arquivos, contratos, testes e documentação afetados.

**Critérios de aceite:**

- AC-RF001-01 — Dado um conceito de negócio afetado pela refatoração, quando seus identificadores forem revisados, então variáveis, métodos, classes, arquivos e demais representações correspondentes usam nomenclatura em português, salvo papel arquitetural convencional explicitamente excepcionado.
- AC-RF001-02 — Dado que o mesmo conceito aparece em backend, frontend, contratos, testes ou documentação, quando a refatoração for concluída, então suas representações não usam nomes divergentes sem justificativa registrada.
- AC-RF001-03 — Dado um nome que represente diretamente o domínio clínico ou operacional, quando a iniciativa for validada, então ele não é substituído por uma tradução inglesa apenas por conveniência técnica.

### RF-002 — Padronização dos papéis arquiteturais
**Descrição:**

Os papéis e padrões arquiteturais convencionais devem usar nomenclatura de mercado em inglês, quando aplicável, sem alterar sua responsabilidade funcional.

**Critérios de aceite:**

- AC-RF002-01 — Dado um componente que representa um papel arquitetural convencional, quando sua nomenclatura for revisada, então o nome usa o termo convencional correspondente, como Domain, Model, UseCase, Controller, Repository, Adapter, Port, Entity, DTO, Mapper, Configuration ou Worker, quando aplicável.
- AC-RF002-02 — Dado um componente cujo papel não seja arquitetural convencional, quando sua nomenclatura for revisada, então seu nome representa o conceito de negócio em português.
- AC-RF002-03 — A padronização de nomes não altera as responsabilidades funcionais nem introduz uma abstração sem necessidade justificada.

### RF-003 — Padronização da API e dos contratos JSON
**Descrição:**

Endpoints da API e campos de requisições e respostas JSON devem usar nomes em português, mantendo consistência entre backend, frontend, documentação, testes, mensagens de erro e contratos de integração internos.

**Critérios de aceite:**

- AC-RF003-01 — Dado um endpoint afetado, quando o contrato for atualizado, então sua nomenclatura pública está em português e representa a mesma operação anterior.
- AC-RF003-02 — Dado um campo JSON afetado, quando uma requisição ou resposta for produzida ou consumida, então o mesmo nome em português é usado de forma consistente por backend, frontend, testes e documentação.
- AC-RF003-03 — Dado um contrato renomeado, quando os fluxos internos forem executados, então todos os consumidores e produtores do MVP utilizam o contrato atualizado.
- AC-RF003-04 — A renomeação de endpoint ou campo não altera a semântica dos dados, as validações, os estados, as regras de negócio ou o resultado da operação.

### RF-004 — Padronização da persistência
**Descrição:**

As tabelas e nomenclaturas de persistência afetadas devem usar nomes em português e uma convenção única, preservando os dados, os vínculos, as restrições e a semântica das operações.

**Critérios de aceite:**

- AC-RF004-01 — Dado um nome de tabela ou campo de persistência incluído no escopo, quando a padronização for concluída, então ele segue a convenção em português definida para o sistema.
- AC-RF004-02 — Dado o banco existente antes da refatoração, quando os nomes forem atualizados, então os registros, relacionamentos e significados dos dados são preservados.
- AC-RF004-03 — Dado o histórico de migrations, quando a persistência for validada, então as migrations permanecem consistentes e reproduzíveis.
- AC-RF004-04 — A renomeação não altera os invariantes de append-only dos registros clínicos e das análises, nem permite mistura de dados entre pacientes.

### RF-005 — Separação de responsabilidades
**Descrição:**

Todos os componentes identificados no escopo com múltiplas responsabilidades ou múltiplos motivos de mudança devem ser avaliados e, quando a sobreposição for confirmada, reorganizados em componentes coesos, testáveis e com uma responsabilidade principal clara.

Devem ser avaliados especialmente componentes que misturem validação estrutural, regra de negócio e segurança; schemas ou contratos sem relação direta; mapeamento, persistência, SQL, fila e processamento; conversão, validação e orquestração; execução, persistência, retry e integração externa; ou contratos, chamadas HTTP, apresentação e transformação de dados.

**Critérios de aceite:**

- AC-RF005-01 — Dado cada componente incluído no escopo, quando sua responsabilidade for analisada, então existe uma decisão registrada de manter, reorganizar ou justificar a ausência de mudança.
- AC-RF005-02 — Dado um componente com responsabilidades não coesas confirmadas, quando a refatoração for concluída, então seus motivos de mudança relevantes estão separados em fronteiras compreensíveis e testáveis.
- AC-RF005-03 — Dado um componente já coeso, quando a refatoração for concluída, então ele não é fragmentado sem justificativa de produto, risco ou manutenção.
- AC-RF005-04 — A separação de responsabilidades não cria dependências indevidas entre domínio, aplicação, adaptadores, contratos ou componentes frontend.

### RF-006 — Preservação do comportamento funcional e clínico
**Descrição:**

A refatoração deve manter as regras de negócio e os comportamentos existentes, incluindo os invariantes clínicos e de segurança do MVP.

**Critérios de aceite:**

- AC-RF006-01 — Dado qualquer fluxo funcional existente, quando executado após a refatoração, então produz o mesmo resultado de negócio, considerando apenas os nomes explicitamente padronizados.
- AC-RF006-02 — Dado o salvamento de um parecer ou complemento, quando a IA estiver indisponível ou falhar, então o registro clínico permanece persistido e disponível.
- AC-RF006-03 — Dado um registro clínico ou análise já existente, quando a refatoração for concluída, então sua preservação append-only permanece intacta.
- AC-RF006-04 — Dado dados de pacientes diferentes, quando qualquer fluxo for executado, então consultas, registros, gerações, análises e evidências permanecem isolados por paciente.
- AC-RF006-05 — Dado uma análise de IA, quando ela for gerada ou exibida, então continuam válidas as restrições de segurança clínica, evidências, limitações e decisão final do médico.

### RF-007 — Atualização coordenada dos consumidores internos
**Descrição:**

Todos os consumidores internos dos nomes e contratos alterados devem ser atualizados de forma coordenada, incluindo backend, frontend, testes, documentação e integrações existentes no repositório.

**Critérios de aceite:**

- AC-RF007-01 — Dado qualquer nome ou contrato alterado, quando a busca por referências antigas for realizada, então não permanecem referências funcionais não intencionais dentro do sistema.
- AC-RF007-02 — Dado um fluxo frontend que consome a API, quando executado após a refatoração, então ele utiliza os contratos atualizados e permanece funcional.
- AC-RF007-03 — Dado um teste ou fixture afetado, quando executado, então ele utiliza a nomenclatura e o contrato atualizados sem mascarar regressões.
- AC-RF007-04 — Dado um documento que descreve comportamento ou arquitetura afetada, quando a iniciativa for concluída, então ele reflete o estado atual e não apresenta nomes obsoletos como ativos.

### RF-008 — Qualidade, testes e rastreabilidade
**Descrição:**

A iniciativa deve preservar os testes existentes, adicionar testes para as novas fronteiras relevantes e manter evidências rastreáveis de que a refatoração não introduziu regressões.

**Critérios de aceite:**

- AC-RF008-01 — Dado o conjunto de checks aplicáveis ao repositório, quando executado após a refatoração, então os testes, verificações de tipos, lint, build e fluxos integrados aplicáveis passam.
- AC-RF008-02 — Dado uma nova fronteira criada ou alterada, quando houver risco comportamental relevante, então existe teste que verifica seu comportamento de negócio ou seu limite arquitetural.
- AC-RF008-03 — Dado cada mudança relevante implementada, quando sua evidência for revisada, então ela pode ser relacionada a um requisito, critério de aceite, task e resultado de teste.
- AC-RF008-04 — A suíte automatizada continua usando exclusivamente dados fictícios e não depende de rede externa ou provider real sem autorização explícita.

## 7. Jornada e fluxos principais

### Fluxo 1 — Inventário e entendimento do estado atual

1. A equipe identifica nomes, contratos, componentes, responsabilidades, consumidores, migrations, testes e documentos afetados.
2. Cada componente com possível sobreposição de responsabilidades é analisado.
3. As decisões de nomenclatura, fronteiras e preservação de comportamento são registradas para orientar a TechSpec.

### Fluxo 2 — Refatoração coordenada

1. A equipe aplica a padronização aos conceitos de domínio e papéis arquiteturais afetados.
2. A equipe atualiza endpoints, campos JSON, modelos consumidores, persistência e referências internas.
3. A equipe reorganiza componentes com responsabilidades múltiplas confirmadas.
4. O comportamento funcional e os invariantes clínicos permanecem preservados.

### Fluxo 3 — Validação do sistema único

1. A equipe executa os testes e checks existentes do backend, frontend e integração.
2. A equipe executa testes das novas fronteiras e dos riscos de migração ou renomeação.
3. A equipe verifica que dados, contratos, documentação e referências antigas estão consistentes.
4. A equipe registra a rastreabilidade entre requisitos, tasks e evidências.

## 8. Regras de negócio

- Os conceitos de negócio, clínicos e operacionais devem permanecer em português.
- Papéis e padrões arquiteturais convencionais devem manter sua nomenclatura de mercado em inglês, quando aplicável.
- Endpoints da API devem usar nomes em português.
- Campos JSON devem usar nomes em português de forma consistente entre requisições, respostas, frontend, documentação, testes, erros e integrações internas.
- Tabelas e nomenclaturas de persistência afetadas devem usar nomes em português e uma convenção única.
- Renomear não significa alterar a semântica de dados ou operações.
- O MVP não possui clientes externos nem versões antigas que exijam compatibilidade retroativa.
- Todos os consumidores internos podem ser atualizados em conjunto.
- A persistência de registros clínicos deve permanecer independente da IA.
- Registros clínicos e análises continuam append-only.
- O isolamento entre pacientes não pode ser enfraquecido.
- Os invariantes clínicos, os limites de segurança da IA e a decisão clínica final do médico não podem ser alterados por esta iniciativa.
- Nenhuma abstração ou fragmentação deve ser criada sem justificativa relacionada a responsabilidade, risco, teste ou manutenção.
- O uso do MVP continua restrito a dados fictícios.

## 9. Dados e informações envolvidas

- Identificadores e nomes de conceitos de domínio no backend e frontend.
- Nomes de classes, métodos, variáveis e arquivos afetados.
- Papéis arquiteturais e fronteiras entre domínio, aplicação, contratos, adaptadores e componentes de interface.
- Endpoints, parâmetros, campos JSON, mensagens de erro e documentação de API.
- Modelos internos e mapeamentos entre contratos e domínio.
- Nomes de tabelas, colunas, relacionamentos, constraints e migrations afetados.
- Testes unitários, de integração, de contrato, E2E, fixtures e evidências de validação.
- Documentação de negócio, técnica, onboarding e contratos.

Dados clínicos, dados pessoais sensíveis e informações de pacientes devem continuar protegidos pelas Rules do projeto. A refatoração não deve expor conteúdo clínico, CPF completo, secrets ou credenciais em logs, testes, exemplos ou documentação.

## 10. Requisitos não funcionais

### RNF-001 — Preservação funcional
**Descrição:**

A refatoração não deve alterar o comportamento funcional do sistema, exceto pelas mudanças de nomenclatura explicitamente previstas neste PRD.

**Critério mensurável:**

Os testes existentes, os testes adicionados para as novas fronteiras, os checks de qualidade e os fluxos integrados aplicáveis devem passar após a refatoração.

### RNF-002 — Integridade e preservação de dados
**Descrição:**

A atualização de nomes na persistência deve preservar dados, relações, histórico e semântica clínica.

**Critério mensurável:**

Uma validação antes e depois da mudança deve demonstrar que os registros e relacionamentos existentes permanecem acessíveis, íntegros e vinculados ao paciente correto, sem alteração indevida de conteúdo.

### RNF-003 — Coesão e fronteiras arquiteturais
**Descrição:**

Os componentes alterados devem ter responsabilidades compreensíveis, testáveis e sem dependências indevidas entre as fronteiras do sistema.

**Critério mensurável:**

Cada componente com múltiplas responsabilidades confirmadas deve possuir uma decisão registrada e, quando reorganizado, testes que cubram as novas fronteiras relevantes.

### RNF-004 — Consistência de nomenclatura
**Descrição:**

Uma mesma entidade ou operação não deve possuir nomenclaturas divergentes entre as áreas afetadas sem justificativa explícita.

**Critério mensurável:**

Uma revisão de referências e contratos deve confirmar que os nomes ativos de domínio, papéis arquiteturais, API, JSON, persistência, testes e documentação seguem as convenções deste PRD.

### RNF-005 — Rastreabilidade
**Descrição:**

A iniciativa deve permitir relacionar cada mudança relevante ao motivo e à evidência de validação.

**Critério mensurável:**

Cada mudança relevante deve estar associada a pelo menos um requisito, critério de aceite, task e resultado de teste ou revisão correspondente.

### RNF-006 — Privacidade e segurança clínica
**Descrição:**

A refatoração deve preservar as regras de privacidade, minimização de dados, segurança clínica e uso exclusivo de dados fictícios do MVP.

**Critério mensurável:**

Os testes e revisões não devem identificar mistura entre pacientes, exposição de conteúdo clínico ou comportamento de IA incompatível com as Rules do projeto.

## 11. Restrições e compliance de alto nível

- O MVP continua destinado exclusivamente a desenvolvimento e validação com dados fictícios.
- O sistema manipula conceitos de saúde e dados pessoais sensíveis; nenhuma mudança deve reduzir as proteções existentes.
- A ausência de clientes externos e versões antigas permite uma atualização coordenada dos consumidores internos, mas não permite deixar o sistema parcialmente atualizado.
- O comportamento append-only, o isolamento entre pacientes e a independência da persistência clínica em relação à IA são restrições não negociáveis nesta iniciativa.
- Logs, erros, testes, fixtures, exemplos e documentação não devem expor prontuários, respostas clínicas integrais da IA, CPF completo, secrets ou credenciais.
- O PRD não autoriza uso em produção clínica, autenticação, autorização, hospedagem real ou tratamento de dados reais.

## 12. Fora do escopo

- Criação de novas funcionalidades de produto.
- Alteração de regras clínicas da IA.
- Alteração dos invariantes de segurança, privacidade, isolamento ou append-only.
- Mudança do resultado funcional das operações, além dos nomes explicitamente padronizados.
- Manutenção de compatibilidade com clientes externos ou versões antigas, pois não existem no protótipo atual.
- Troca de framework, banco de dados ou provedor de IA sem justificativa independente.
- Introdução de microsserviços, broker, event bus, RAG, embeddings, banco vetorial, busca semântica ou tecnologias futuras sem necessidade concreta.
- Otimizações de desempenho não relacionadas à refatoração.
- Definição da estrutura final de pacotes, da divisão exata de classes, do mecanismo específico de migração do banco ou da estratégia técnica detalhada de compatibilidade; essas decisões pertencem à TechSpec.
- Uso do produto com dados reais de pacientes.

## 13. Riscos de produto e uso

- Uma renomeação incompleta pode deixar contratos, migrations, testes ou consumidores internos inconsistentes.
- Uma migration inadequada pode causar perda, inacessibilidade ou associação incorreta de dados.
- Uma alteração estrutural pode mudar inadvertidamente regras clínicas, transações, idempotência, retry ou isolamento entre pacientes.
- A separação excessiva pode aumentar a complexidade e criar arquivos ou abstrações sem valor.
- A manutenção de responsabilidades múltiplas pode preservar o problema de origem e reduzir o benefício da iniciativa.
- Testes insuficientes podem permitir que o sistema pareça padronizado enquanto um fluxo funcional ou contrato está quebrado.
- A mistura de nomenclaturas em português e inglês pode permanecer em pontos não cobertos pela revisão.
- A atualização de mensagens e documentação pode expor nomes antigos ou dados sensíveis se for feita sem as Rules de privacidade.

## 14. Dependências e premissas

- O repositório atual, suas Rules, testes, migrations, contratos e documentação são a base de referência para a refatoração.
- O sistema é um protótipo MVP sem clientes externos e sem versões antigas da API em operação.
- Backend, frontend, persistência, testes e documentação podem ser atualizados como uma unidade coordenada.
- A TechSpec definirá a nomenclatura final detalhada, o inventário completo, as fronteiras exatas dos componentes, a estratégia de migrations e a sequência de execução.
- Todos os testes e checks aplicáveis existentes devem continuar sendo executáveis e passar ao final.
- A iniciativa não altera as Rules do projeto nem os invariantes de produto.
- O uso de dados fictícios continua obrigatório durante desenvolvimento, validação e testes.

## 15. Perguntas em aberto

Não há perguntas de produto pendentes para iniciar a TechSpec. As decisões técnicas detalhadas de nomenclatura final, organização dos componentes, migrations e sequência de implementação deverão ser registradas na TechSpec sem alterar o escopo e os critérios deste PRD.
