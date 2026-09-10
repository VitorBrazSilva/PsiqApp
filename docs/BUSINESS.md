# PsiqApp MVP - Documentação de Negócio

## 1. Visão geral

O PsiqApp MVP é um sistema de apoio ao atendimento psiquiátrico para um único médico psiquiatra em consultório próprio. O produto centraliza pacientes, consultas e registros clínicos em um prontuário organizado e usa inteligência artificial para apoiar a leitura longitudinal do histórico registrado pelo médico.

O objetivo principal é reduzir o esforço de releitura manual do prontuário antes de uma consulta, mantendo os registros clínicos originais como fonte de verdade. A IA ajuda a organizar acontecimentos, recorrências, padrões e pontos de atenção, mas não decide, diagnostica, prescreve nem substitui o julgamento clínico.

**Status atual do repositório:** esta documentação descreve o MVP aprovado em PRD e TechSpec. Ainda não há aplicação implementada no repositório; portanto, o documento deve ser lido como a descrição funcional canônica do produto especificado para implementação.

## 2. Contexto de uso

O MVP foi desenhado para validação controlada com dados fictícios. Ele não deve ser usado com prontuários reais, dados reais de pacientes ou em produção clínica.

Premissas do MVP:

- existe apenas um médico usuário;
- não existem perfis administrativos;
- não existe portal do paciente;
- a agenda é interna ao PsiqApp e alimentada manualmente;
- a validação inicial usa apenas dados fictícios;
- a ausência de autenticação no protótipo local não significa que autenticação seja desnecessária no produto final.

Antes de qualquer uso com pacientes reais, o produto precisará de decisões e implementação adicionais sobre LGPD, autenticação, autorização, criptografia, hospedagem, backup, retenção, auditoria, fornecedores externos, logs e tratamento de dados por provedores de IA.

## 3. Linguagem ubíqua

| Termo | Significado no PsiqApp |
|---|---|
| Médico | Usuário único do MVP, responsável pelos registros e pela decisão clínica final. |
| Paciente | Pessoa cadastrada no sistema para organização de consultas, prontuário e análise longitudinal. No MVP, deve ser fictícia. |
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

## 4. Capacidades do MVP

### Cadastro e localização de pacientes

O médico pode cadastrar pacientes com nome, CPF, data de nascimento, telefone, e-mail e queixa inicial opcional. Nome, CPF, data de nascimento, telefone e e-mail são obrigatórios.

Regras funcionais:

- CPF deve ser válido e único.
- E-mail deve ter formato válido.
- Telefone deve ter formato válido.
- Data de nascimento não pode estar no futuro.
- A ausência de queixa inicial não impede o cadastro.
- Pacientes podem ser buscados por parte do nome.
- Quando nenhum paciente corresponde à busca, o sistema deve apresentar estado vazio compreensível.

### Consultas e agenda

O médico pode criar consultas associadas a pacientes. Toda consulta precisa de paciente, data e hora. Observações são opcionais.

Status de consulta no MVP:

| Status | Significado |
|---|---|
| `AGENDADA` | Consulta criada e ainda sem estado final. Toda consulta nasce assim, inclusive retroativa. |
| `REALIZADA` | Consulta marcada como realizada. Estado final no MVP. |
| `CANCELADA` | Consulta cancelada. Estado final no MVP. |
| `FALTA` | Falta do paciente. Estado final no MVP. |

Regras funcionais:

- Consultas retroativas são permitidas.
- Toda consulta criada inicia como `AGENDADA`.
- Uma consulta `AGENDADA` pode ser marcada como `REALIZADA`, `CANCELADA` ou `FALTA`.
- Estados `REALIZADA`, `CANCELADA` e `FALTA` são finais.
- O MVP não permite retornar uma consulta final para `AGENDADA`.
- O MVP não permite alterar diretamente uma consulta de um estado final para outro estado final.
- Observações de consulta não entram como fonte clínica da IA.

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
- dispara nova geração automática de análise quando salvo.

Um complemento:

- também é um registro clínico escrito pelo médico;
- possui texto livre obrigatório;
- referencia obrigatoriamente um parecer original;
- deve pertencer ao mesmo paciente do parecer original;
- possui data/hora clínica própria;
- possui data/hora real de criação própria;
- pode ter estado/humor e medicações opcionais;
- entra nas análises futuras e pode ser usado como evidência;
- também dispara nova geração automática de análise quando salvo.

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

## 5. Análise de IA

### Papel da IA

A IA existe para apoiar a leitura longitudinal do prontuário. Ela deve organizar e destacar informações que já estejam registradas pelo médico, sempre com limites explícitos.

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

Padrões observados e pontos de atenção devem possuir evidências. Evidências indicam registros clínicos originais ou complementos que sustentam a observação.

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

## 6. Fluxos principais

### Fluxo 1 - Cadastro e abertura de prontuário

1. O médico cadastra um paciente com dados obrigatórios válidos.
2. O sistema salva o paciente.
3. O médico busca o paciente pelo nome.
4. O sistema apresenta os resultados correspondentes.
5. O médico abre o prontuário do paciente.

### Fluxo 2 - Criação e acompanhamento de consulta

1. O médico cria uma consulta para um paciente, informando data e hora.
2. A consulta nasce como `AGENDADA`.
3. A consulta aparece na agenda interna.
4. O médico pode marcá-la como `REALIZADA`, `CANCELADA` ou `FALTA`.
5. O status atualizado aparece na agenda e no contexto do paciente.

### Fluxo 3 - Registro de parecer e geração automática

1. O médico abre o prontuário do paciente.
2. O médico registra um parecer com texto obrigatório.
3. O médico pode informar estado/humor, medicações e data/hora clínica retroativa.
4. O sistema salva o parecer.
5. O parecer fica disponível imediatamente no prontuário.
6. O sistema inicia uma nova geração de análise em segundo plano.
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

## 7. Regras de negócio consolidadas

### Pacientes

- Nome, CPF, data de nascimento, telefone e e-mail são obrigatórios.
- Queixa inicial é opcional.
- CPF deve ser válido e único.
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
- Todo novo parecer ou complemento dispara geração automática de análise.

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

- Apenas dados fictícios devem ser usados no MVP.
- Dados de pacientes diferentes nunca podem se misturar.
- Toda evidência deve apontar para registro existente do mesmo paciente.
- Logs não devem expor prontuário completo, resposta clínica integral da IA, CPF completo sem necessidade, secrets ou dados clínicos sensíveis.
- O contexto enviado ao provedor de IA deve conter apenas dados necessários do paciente analisado.

## 8. Fora do escopo do MVP

Não fazem parte do MVP:

- múltiplos médicos;
- múltiplos perfis de acesso;
- portal ou aplicativo do paciente;
- equipe administrativa;
- prescrição eletrônica;
- assinatura digital;
- emissão de atestado;
- faturamento, convênios ou financeiro;
- integração com Google Calendar, WhatsApp ou sistemas externos;
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

## 9. Métricas de validação

O MVP deve ser avaliado pela utilidade percebida e pelo funcionamento dos fluxos principais. As métricas previstas são observacionais, sem definir inicialmente um limite rígido como regra de produto.

Indicadores de validação:

- tempo para encontrar paciente e abrir prontuário;
- tempo para registrar e salvar novo parecer;
- tempo para revisar histórico, análise atual e evidências antes da consulta;
- percepção de redução do esforço de releitura manual;
- percepção de utilidade, clareza e confiabilidade da análise de IA;
- capacidade de rastrear observações da IA até os registros originais;
- comportamento com volumes de validação entre 100 e 500 pacientes, 20 a 100 registros por paciente e casos longos com 200 ou mais registros.

## 10. Fontes canônicas

Este documento foi criado a partir de:

- `tasks/prd-psiqapp-mvp/prd.md`;
- `tasks/prd-psiqapp-mvp/spec-review.md`;
- `tasks/prd-psiqapp-mvp/techspec.md`;
- `.agents/rules/product-invariants.md`;
- `.agents/rules/clinical-data-privacy.md`;
- `.agents/rules/clinical-ai-safety.md`;
- `.agents/rules/documentation-maintenance.md`.
