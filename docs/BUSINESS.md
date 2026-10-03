# PsiqApp MVP - Documentação de Negócio

## 1. Visão geral

O PsiqApp MVP é um sistema de apoio ao atendimento psiquiátrico para um único médico psiquiatra em consultório próprio. O produto centraliza pacientes, consultas e registros clínicos em um prontuário organizado e usa inteligência artificial para apoiar a leitura longitudinal do histórico registrado pelo médico.

O objetivo principal é reduzir o esforço de releitura manual do prontuário antes de uma consulta, mantendo os registros clínicos originais como fonte de verdade. A IA ajuda a organizar acontecimentos, recorrências, padrões e pontos de atenção, mas não decide, diagnostica, prescreve nem substitui o julgamento clínico.

**Capacidade atual:** o backend já permite cadastrar, buscar e visualizar pacientes por API, criar e listar consultas, consultar disponibilidade local e do Google Agenda, incluindo uma leitura mensal de datas e horários livres, sincronizar eventos por worker durável, atualizar consultas para estados finais, criar pareceres originais e complementos, consultar a linha do tempo clínica, processar gerações de IA e consultar análises e seu histórico. A sincronização Google é opcional, usa o calendário principal e mantém a consulta do PsiqApp como fonte de verdade. O provider local padrão da IA é fake e determinístico; o adapter OpenAI pode ser habilitado por ambiente. No frontend, já é possível cadastrar, buscar e abrir pacientes, visualizar dados, criar e acompanhar consultas agrupadas por estado, filtrar as listas por paciente e período, registrar pareceres e complementos, consultar a linha do tempo clínica, ver análises e solicitar regeneração manual quando permitida pela API. A Agenda e o agendamento do prontuário compartilham a busca mensal, seleção e confirmação de horários, conservando o caminho manual para consultas retroativas. As listas mostram o estado de sincronização Google de cada consulta, com nova tentativa quando aplicável.

Este documento descreve as capacidades implementadas e as regras de negócio que elas devem respeitar. As invariantes vigentes estão nas Rules. O MVP deve ser usado exclusivamente com dados fictícios.

## 2. Contexto de uso

Premissas do MVP:

- o uso é restrito a desenvolvimento e validação com dados fictícios;
- existe apenas um médico usuário;
- não existem perfis administrativos;
- não existe portal do paciente;
- o PsiqApp mantém a fonte de verdade das consultas e pode consultar/sincronizar opcionalmente o calendário principal Google;
- a ausência de autenticação no protótipo local não significa que autenticação seja desnecessária no produto final.

Antes de qualquer uso com pacientes reais, o produto precisará de decisões e implementação adicionais sobre LGPD, autenticação, autorização, criptografia, hospedagem, backup, retenção, auditoria, fornecedores externos, logs e tratamento de dados por provedores de IA.

## 3. Linguagem ubíqua

| Termo | Significado no PsiqApp |
|---|---|
| Médico | Usuário único do MVP, responsável pelos registros e pela decisão clínica final. |
| Paciente | Pessoa cadastrada no sistema para organização de consultas, prontuário e análise longitudinal; no MVP, deve ser fictícia. |
| Prontuário | Conjunto organizado de dados do paciente, consultas, registros clínicos e análises de IA associadas. |
| Consulta | Evento de agenda associado a um paciente, com data, hora, status e observações opcionais. |
| Parecer clínico | Registro clínico original escrito pelo médico. É fonte clínica de verdade e não deve ser sobrescrito. |
| Complemento | Novo registro clínico usado para corrigir ou complementar um parecer original. Deve referenciar o parecer original. |
| Registro clínico | Nome comum para parecer original e complemento. Apenas registros clínicos entram na análise de IA. |
| Data/hora clínica | Momento clínico do registro, usado na linha do tempo e na análise longitudinal. Pode ser retroativo. |
| Data/hora de criação | Momento real em que o registro foi criado no sistema, usado para auditoria. Não é editável pelo médico. |
| Linha do tempo | Visualização dos registros clínicos do paciente em ordem clínica. |
| Análise de IA | Artefato derivado, gerado a partir dos registros clínicos de um paciente, com timeline resumida, padrões, pontos de atenção e limitações. |
| Evidência | Referência a um trecho de registro clínico que sustenta uma observação da análise. |
| Snapshot | Conjunto congelado de registros clínicos considerado por uma geração de análise. Registros posteriores não entram retroativamente. |
| Análise atual | Análise válida baseada no snapshot clínico mais recente; não é escolhida pela ordem em que a IA terminou. |
| Geração | Processo de produção de uma análise de IA, podendo estar em geração, concluído ou falho. |

## 4. Pacientes e consultas

### Cadastro e localização de pacientes

O sistema permite cadastrar pacientes pela interface e pela API, com nome, CPF, data de nascimento, telefone, e-mail e queixa inicial opcional. Nome, CPF, data de nascimento, telefone e e-mail são obrigatórios.

Regras funcionais:

- CPF deve ser válido e único.
- Por privacidade operacional do MVP, respostas da API exibem o CPF mascarado; o CPF completo normalizado permanece usado internamente apenas para validação e unicidade.
- E-mail deve ter formato válido.
- Telefone deve ter formato válido.
- Data de nascimento não pode estar no futuro.
- A ausência de queixa inicial não impede o cadastro.
- Pacientes podem ser buscados por parte do nome.
- Quando nenhum paciente corresponde à busca, o sistema deve apresentar estado vazio compreensível.

### Consultas e agenda

O sistema permite criar consultas associadas a pacientes pela interface e pela API. Toda consulta precisa de paciente, data e hora. Observações são opcionais.

Status de consulta no MVP:

| Status | Significado |
|---|---|
| `AGENDADA` | Consulta criada e ainda sem estado final. Toda consulta nasce assim, inclusive retroativa. |
| `REALIZADA` | Consulta marcada como realizada. Estado final no MVP. |
| `CANCELADA` | Consulta cancelada. Estado final no MVP. |
| `FALTA` | Falta do paciente. Estado final no MVP. |

Regras funcionais:

- Consultas retroativas são permitidas.
- As listas da Agenda e da seção Consultas do prontuário podem ser filtradas por Próximas, Agendadas anteriores, Realizadas, Canceladas e Faltas. Próximas inclui consultas agendadas no instante atual ou depois dele; Agendadas anteriores inclui as agendadas antes do instante atual.
- As duas listas aceitam período por datas civis inclusivas. No prontuário, itens e contagens ficam limitados ao paciente aberto; na Agenda, também é possível filtrar por paciente.
- Cada grupo mostra sua contagem completa para o paciente/período atual, mesmo quando os itens são exibidos em páginas.
- Toda consulta criada inicia como `AGENDADA`.
- Uma consulta `AGENDADA` pode ser marcada como `REALIZADA`, `CANCELADA` ou `FALTA`.
- Estados `REALIZADA`, `CANCELADA` e `FALTA` são finais.
- O MVP não permite retornar uma consulta final para `AGENDADA`.
- O MVP não permite alterar diretamente uma consulta de um estado final para outro estado final.
- Observações de consulta não entram como fonte clínica da IA.
- Cada consulta ocupa uma hora; a disponibilidade local compara instantes em intervalos com fim exclusivo.
- A busca mensal de disponibilidade do backend aceita um mês a partir do mês atual (ou usa o mês atual quando omitido) e retorna apenas horários ainda não passados, em inícios de 30 minutos ao longo do dia, incluindo fins de semana. Ela consulta ocupações locais e, quando há conexão ativa, Google; não reserva nem garante o horário até a confirmação da consulta.
- A criação revalida o horário selecionado antes de persistir. Se ele ficar ocupado entre a busca e a confirmação, a consulta não é criada.
- A Agenda e o diálogo de agendamento do prontuário compartilham a busca mensal, seleção de data/horário e revisão antes da confirmação. Os horários aparecem em São Paulo, agrupados por Madrugada, Manhã, Tarde e Noite; a busca não oferece datas ou horários passados e não exige uma verificação separada após a seleção.
- Na Agenda, selecionar o paciente é obrigatório. No prontuário, a consulta usa o paciente aberto sem seletor; trocar de prontuário fecha o agendamento e descarta respostas do contexto anterior.
- O caminho secundário “Informar data e hora” conserva o cadastro retroativo e exige a verificação explícita atual. Alterar a data/hora ou alternar o caminho invalida a verificação anterior.
- Conflito na confirmação exige escolher outro horário; falha Google remove a disponibilidade anterior até nova busca válida. Se a resposta de criação se perder, repetir a confirmação recupera a mesma operação sem duplicar a consulta.
- Sem conexão Google ativa por escolha do médico, o agendamento considera somente consultas `AGENDADA` do PsiqApp. Com conexão ativa, a disponibilidade Google também é consultada; falha nessa verificação impede novo agendamento e é distinta de conflito.
- Consulta nova e sua intenção de sincronização são persistidas juntas. Indisponibilidade Google após a criação não desfaz a consulta; o estado de sincronização fica visível pela API e o worker tenta novamente.
- A Agenda apresenta o estado Google por consulta e permite solicitar nova tentativa para sincronização pendente ou falha. Consultas legadas sem evento correspondente continuam locais e aparecem como `NAO_APLICAVEL`.
- O evento gerenciado no calendário principal contém nome, e-mail e horário. Não inclui CPF, observações nem conteúdo clínico. Eventos Google preexistentes contribuem apenas com intervalos ocupados e não aparecem como consultas do PsiqApp.
- Mudanças para `REALIZADA` e `FALTA` atualizam o evento sem alterar o horário; `CANCELADA` remove o evento após a sincronização.
- A integração não cria vínculos para consultas legadas. Elas permanecem na agenda local com estado Google `NAO_APLICAVEL`.

## 5. Registros clínicos e prontuário

### Registros clínicos

O prontuário clínico é formado por pareceres originais e complementos. Eles são a fonte clínica de verdade do sistema.

Um parecer clínico:

- pertence a um paciente;
- tem texto livre obrigatório;
- pode ter estado/humor opcional;
- pode ter medicações em uso como texto livre opcional;
- pode estar associado a uma consulta, mas essa associação não é obrigatória;
- possui data/hora clínica;
- possui data/hora real de criação;
- cria uma solicitação persistente de geração automática de análise quando salvo. O processamento assíncrono pode ser executado pelo worker configurável do backend.

Um complemento:

- também é um registro clínico escrito pelo médico;
- possui texto livre obrigatório;
- referencia obrigatoriamente um parecer original;
- deve pertencer ao mesmo paciente do parecer original;
- possui data/hora clínica própria;
- possui data/hora real de criação própria;
- pode ter estado/humor e medicações opcionais;
- entra nas análises futuras e pode ser usado como evidência;
- também cria uma solicitação persistente de geração automática de análise quando salvo. O processamento assíncrono pode ser executado pelo worker configurável do backend.

### Preservação append-only

Pareceres já salvos não devem ser sobrescritos no MVP. Se o médico precisar corrigir, contextualizar ou acrescentar informação, deve criar um complemento.

Essa regra protege a auditabilidade clínica:

- o registro original permanece disponível;
- a correção fica explícita como novo registro;
- análises antigas continuam representando o histórico existente no momento em que foram geradas;
- análises futuras consideram o original e seus complementos dentro do snapshot correspondente.

### Linha do tempo

A linha do tempo mostra os registros clínicos do paciente em ordem clínica, dos mais recentes para os mais antigos.

Ordenação funcional:

1. primeiro por data/hora clínica;
2. em empate, por data/hora real de criação;
3. registros mais recentes aparecem antes.

Um registro retroativo aparece na posição correspondente à sua data/hora clínica, mas sua data/hora real de criação continua preservada para auditoria.

## 6. Análise de IA

### Papel da IA

A IA existe para apoiar a leitura longitudinal do prontuário. Ela deve organizar e destacar informações que já estejam registradas pelo médico, sempre com limites explícitos.

O backend possui o núcleo persistente para guardar gerações, análises validadas, evidências e tentativas técnicas, além de contratos para consulta de estado, histórico, análise e regeneração manual. O worker de IA reivindica gerações elegíveis, chama o provider fora da transação, valida a resposta e conclui a geração de forma transacional.

A IA não pode:

- diagnosticar;
- prescrever;
- recomendar início, suspensão, troca ou alteração de dose de medicamento;
- recomendar conduta terapêutica;
- transformar hipótese em fato;
- inventar sintomas, eventos, medicações ou informações ausentes;
- preencher lacunas por suposição;
- usar análises anteriores como fonte clínica;
- ocultar insuficiência de histórico.

A decisão clínica final permanece sempre com o médico.

### Fonte clínica da IA

Cada nova análise deve considerar todos os registros clínicos escritos pelo médico existentes no snapshot da geração. Isso inclui pareceres originais e complementos.

Não entram como fonte clínica:

- análises anteriores de IA;
- observações de consulta;
- dados cadastrais que não sejam necessários para a análise;
- registros de outros pacientes.

### Conteúdo da análise

A análise de IA é organizada em quatro áreas:

| Área | O que representa |
|---|---|
| Linha do tempo resumida | Organização dos acontecimentos relevantes do histórico clínico considerado. |
| Padrões observados | Recorrências ou padrões identificados a partir dos registros. |
| Pontos de atenção | Aspectos que merecem revisão ou acompanhamento pelo médico. |
| Limitações | Limites, lacunas e insuficiências do histórico analisado. |

Cada item da linha do tempo resumida, dos padrões e dos pontos de atenção exige evidência. As evidências indicam registros clínicos originais ou complementos que sustentam a observação; limitações não exigem evidência.

### Suficiência de histórico

O comportamento da IA depende da quantidade de pareceres originais no snapshot:

| Condição | Comportamento esperado |
|---|---|
| Nenhum parecer original | Não há conteúdo mínimo para gerar análise longitudinal. |
| Um parecer original | A IA pode organizar ou resumir registros, mas deve declarar ausência de histórico suficiente para evolução ou tendência. |
| Dois ou mais pareceres originais | A IA pode produzir leitura longitudinal usando todos os registros clínicos do snapshot, incluindo complementos. |

Complementos fazem parte da fonte clínica e podem alterar a interpretação de registros anteriores, mas não contam como novos pareceres originais para decidir se existe histórico longitudinal suficiente.

### Falhas da IA

Falha, lentidão, timeout, indisponibilidade ou resposta inválida da IA não podem comprometer o prontuário.

Quando uma geração falha:

- o parecer ou complemento salvo continua preservado;
- consultas e dados anteriores não são alterados;
- análises válidas anteriores continuam disponíveis;
- a última análise válida permanece como atual, quando existir;
- o sistema deve apresentar a falha de forma compreensível;
- o médico pode solicitar nova tentativa manual quando houver pelo menos um parecer original e nenhuma geração em andamento.

### Regeneração manual

O backend permite solicitar uma nova geração manual quando existe pelo menos um parecer original e não há outra geração ativa para o paciente. A solicitação é idempotente: repetir a mesma operação com a mesma chave não cria gerações duplicadas.

### Histórico disponível

A interface mostra o histórico de gerações com estado, data de solicitação, revisão do snapshot e contagens. Quando uma geração concluída inclui `analiseId`, a interface permite abrir sua análise histórica; a API também permite consultar esse conteúdo pelo identificador.

## 7. Fluxos principais

### Fluxo 1 - Cadastro e abertura de prontuário

As etapas de cadastro, busca e visualização de dados básicos existem no backend por API e já estão disponíveis no frontend.

1. O médico cadastra um paciente com dados obrigatórios válidos.
2. O sistema salva o paciente.
3. O médico busca o paciente pelo nome.
4. O sistema apresenta os resultados correspondentes.
5. O médico abre o prontuário do paciente.

### Fluxo 2 - Criação e acompanhamento de consulta

As etapas de criação, listagem de agenda e atualização de status estão disponíveis no frontend. A agenda global exibe paciente, data, hora, status da consulta e estado Google; quando o nome do paciente ainda não foi carregado na página, o frontend exibe o identificador técnico do paciente como fallback.

1. O médico seleciona o paciente na Agenda ou usa o paciente aberto no prontuário. Busca uma data e um horário livres no calendário mensal e revisa a seleção; também pode informar data e hora pelo caminho manual, inclusive para consultas retroativas.
2. O sistema consulta a disponibilidade local e, quando há conexão ativa, também o Google. A seleção pela busca dispensa uma verificação separada; o caminho manual exige essa ação. Sem conexão, a disponibilidade usa a agenda local; conflito ou falha de disponibilidade impede criar a consulta.
3. Se a data e hora permanecem disponíveis, o médico cria a consulta, que nasce como `AGENDADA` e aparece na agenda interna.
4. A agenda mostra o estado de sincronização Google da consulta e permite nova tentativa quando houver pendência ou falha.
5. O médico pode marcá-la como `REALIZADA`, `CANCELADA` ou `FALTA`; o status atualizado aparece na agenda e no contexto do paciente.

### Fluxo 3 - Registro de parecer e geração automática

1. O médico abre o prontuário do paciente.
2. O médico registra um parecer com texto obrigatório.
3. O médico pode informar estado/humor, medicações e data/hora clínica retroativa.
4. O sistema salva o parecer.
5. O parecer fica disponível imediatamente no prontuário.
6. O backend cria uma solicitação persistente de geração de análise; o worker processa a fila quando estiver habilitado no ambiente.
7. O médico continua usando o sistema sem aguardar a IA.
8. Quando uma análise válida baseada no snapshot mais recente é concluída, ela passa a ser apresentada como análise atual.

### Fluxo 4 - Complemento de parecer

1. O médico identifica necessidade de corrigir ou complementar um parecer.
2. O médico cria um complemento ligado ao parecer original.
3. O complemento fica preservado como novo registro clínico.
4. O parecer original permanece inalterado.
5. O complemento entra em análises futuras e pode servir como evidência.

### Fluxo 5 - Revisão longitudinal antes da consulta

1. O médico busca e abre o prontuário.
2. O médico revisa dados básicos, consultas e linha do tempo.
3. O médico consulta a análise atual.
4. O médico avalia padrões, pontos de atenção, limitações e evidências.
5. O médico abre os registros originais quando precisa conferir a fonte.

## 8. Regras de negócio consolidadas

### Pacientes

- Nome, CPF, data de nascimento, telefone e e-mail são obrigatórios.
- Queixa inicial é opcional.
- CPF deve ser válido e único.
- Respostas da API não devem expor CPF completo.
- E-mail e telefone devem ter formato válido.
- Data de nascimento não pode estar no futuro.
- Campos opcionais ausentes não devem gerar informação inventada.

### Consultas

- Toda consulta pertence a um paciente.
- Toda consulta precisa de data e hora.
- Toda consulta nasce como `AGENDADA`.
- Consultas retroativas são permitidas.
- Observações de consulta não entram na IA.
- `REALIZADA`, `CANCELADA` e `FALTA` são estados finais.

### Pareceres e complementos

- Todo parecer precisa de texto.
- Todo complemento precisa de texto.
- Complemento sempre referencia um parecer original.
- Complemento deve pertencer ao mesmo paciente do parecer original.
- Parecer e complemento podem ter data/hora clínica retroativa.
- Data/hora real de criação é automática e não editável.
- Pareceres e complementos são append-only.
- Correções devem ser registradas como complementos.
- Todo novo parecer ou complemento cria solicitação persistente de geração automática de análise; o processamento dessa geração é feito pelo worker assíncrono quando habilitado.

### Linha do tempo e snapshots

- A linha do tempo usa data/hora clínica como ordem principal.
- Data/hora real de criação é usada para auditoria e desempate.
- Cada geração de IA usa um snapshot lógico congelado.
- Registros criados depois da solicitação não entram retroativamente no snapshot.
- Registros retroativos entram apenas em snapshots criados depois do seu salvamento.

### Análises

- Cada geração concluída cria uma nova análise histórica.
- Análises anteriores nunca são sobrescritas.
- A análise atual é a válida com snapshot clínico mais recente.
- Ordem de conclusão da IA não define a análise atual.
- Regeneração manual exige pelo menos um parecer original.
- Regeneração manual não é permitida enquanto houver geração em andamento para o paciente.

### Segurança clínica e privacidade

- No MVP, usar exclusivamente dados fictícios de pacientes, conforme a Rule `clinical-data-privacy.md`.
- Dados de pacientes diferentes nunca podem se misturar.
- Toda evidência deve apontar para registro existente do mesmo paciente.
- Logs não devem expor prontuário completo, resposta clínica integral da IA, CPF completo sem necessidade, secrets ou dados clínicos sensíveis.
- O contexto enviado ao provedor de IA deve conter apenas dados necessários do paciente analisado.

## 9. Fora do escopo do MVP

Não fazem parte do MVP:

- múltiplos médicos;
- múltiplos perfis de acesso;
- portal ou aplicativo do paciente;
- equipe administrativa;
- prescrição eletrônica;
- assinatura digital;
- emissão de atestado;
- faturamento, convênios ou financeiro;
- RAG, embeddings, banco vetorial ou busca semântica;
- resumo incremental como fonte clínica principal;
- catálogo farmacológico;
- validação de medicamentos;
- mecanismo de prescrição;
- regras de dose ou interação medicamentosa;
- recomendação terapêutica;
- diagnóstico automatizado;
- dashboard clínico avançado;
- uso em produção com dados reais;
- infraestrutura completa de segurança para operação clínica real;
- exportação avançada do prontuário.

## 10. Métricas de validação

O MVP deve ser avaliado pela utilidade percebida e pelo funcionamento dos fluxos principais. As métricas previstas são observacionais, sem definir inicialmente um limite rígido como regra de produto.

Indicadores de validação:

- tempo para encontrar paciente e abrir prontuário;
- tempo para registrar e salvar novo parecer;
- tempo para revisar histórico, análise atual e evidências antes da consulta;
- percepção de redução do esforço de releitura manual;
- percepção de utilidade, clareza e confiabilidade da análise de IA;
- capacidade de rastrear observações da IA até os registros originais;
- comportamento com volumes de validação entre 100 e 500 pacientes, 20 a 100 registros por paciente e casos longos com 200 ou mais registros.

Esses indicadores orientam a avaliação de utilidade e funcionamento do MVP. A decisão clínica final continua pertencendo ao médico.

## 11. Fontes relacionadas

Arquitetura e detalhes de implementação: `docs/TECHNICAL.md`. Configuração e execução: `README.md`. Invariantes: `.agents/rules/product-invariants.md`, `.agents/rules/clinical-data-privacy.md`, `.agents/rules/clinical-ai-safety.md` e `.agents/rules/documentation-maintenance.md`.
