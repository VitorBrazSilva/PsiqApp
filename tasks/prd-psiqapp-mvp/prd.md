# PRD - PsiqApp MVP

## 1. Visao geral

O PsiqApp MVP e um sistema de apoio ao atendimento psiquiatrico para um medico psiquiatra que atende em consultorio proprio. O produto centraliza pacientes, consultas e registros de evolucao clinica em um prontuario organizado e utiliza inteligencia artificial como apoio para produzir uma leitura longitudinal do historico clinico registrado pelo proprio medico.

A IA deve ajudar o medico a compreender rapidamente acontecimentos, recorrencias, padroes e pontos de atencao presentes no prontuario, sem substituir o julgamento clinico, diagnosticar, prescrever ou transformar hipoteses em fatos.

Esta primeira versao sera usada para desenvolvimento e validacao com dados ficticios, em ambiente controlado, com um unico medico e sem uso com prontuarios reais em producao.

## 2. Problema e motivacao

Em atendimentos psiquiatricos recorrentes, o historico de um paciente pode acumular dezenas ou centenas de pareceres ao longo de meses ou anos. Mesmo quando os registros estao organizados, compreender a evolucao completa antes de uma consulta exige releitura manual extensa.

Isso dificulta responder rapidamente perguntas como:

- como os sintomas relatados mudaram ao longo do tempo;
- quais temas aparecem repetidamente;
- quando ocorreram mudancas relevantes;
- quais medicacoes estavam registradas em determinados periodos;
- quais pontos merecem ser revisitados na proxima consulta.

O problema central do PsiqApp e transformar um historico clinico longitudinal em uma visao organizada, navegavel e rapidamente compreensivel, preservando sempre os registros originais como fonte de verdade.

## 3. Persona e contexto de uso

A persona inicial e um unico medico psiquiatra que atende em consultorio proprio. O medico nao deve precisar de conhecimento tecnico para usar o sistema.

No MVP:

- existe apenas um medico;
- nao existem diferentes perfis de usuario;
- nao existe portal do paciente;
- nao existe equipe administrativa usando o sistema;
- os dados usados na validacao devem ser ficticios;
- o ambiente de validacao e controlado e nao deve ser considerado pronto para dados clinicos reais.

## 4. Objetivos

- Permitir que o medico cadastre e encontre pacientes rapidamente.
- Centralizar consultas e historico clinico em um prontuario organizado.
- Permitir o registro simples de pareceres clinicos.
- Manter pareceres clinicos auditaveis e preservados.
- Apresentar o historico do paciente em uma linha do tempo compreensivel.
- Gerar analise longitudinal por IA de forma assincrona, sem bloquear o registro clinico.
- Permitir que observacoes relevantes da IA sejam rastreadas aos registros originais.
- Reduzir o esforco de preparacao para consultas sem substituir o julgamento clinico do medico.

## 5. Metricas / criterios de sucesso

O MVP deve ser avaliado por funcionamento dos fluxos e utilidade percebida da visao longitudinal. As metricas abaixo devem ser coletadas durante a validacao, sem estabelecer inicialmente um limite rigido de tempo como regra de produto.

- Tempo observado para encontrar um paciente e abrir seu prontuario.
- Tempo observado para registrar e salvar um novo parecer.
- Tempo observado para o medico revisar historico, analise atual e evidencias antes de uma consulta.
- Percepcao do medico sobre reducao de esforco de releitura manual do prontuario.
- Percepcao do medico sobre utilidade, clareza e confiabilidade da analise de IA.
- Capacidade de rastrear observacoes relevantes da IA ate os pareceres originais.
- Quantidade aproximada de pareceres e volume textual usados em cenarios de validacao, para observar quando o historico passa a impactar utilidade, tempo ou custo.

O criterio principal de sucesso e o medico conseguir encontrar um paciente, visualizar seu historico organizado, registrar uma nova evolucao sem complexidade, continuar usando o sistema apos salvar, receber posteriormente uma analise atualizada e acessar as evidencias originais que sustentam as observacoes da IA.

## 6. Escopo funcional

### RF-001 - Cadastro de paciente

**Descricao:**
O medico deve poder cadastrar um paciente com dados basicos.

Campos obrigatorios:

- nome;
- CPF;
- data de nascimento;
- telefone;
- e-mail.

Campo opcional:

- queixa inicial.

CPF deve ser valido e unico no cadastro de pacientes. E-mail e telefone devem possuir formato valido. A data de nascimento nao pode estar no futuro.

Detalhes tecnicos de normalizacao, mascara, algoritmo de validacao e armazenamento pertencem a TechSpec.

**Criterios de aceite:**

- AC-RF001-01 - Dado que o medico informa nome, CPF, data de nascimento, telefone e e-mail validos, quando salva o cadastro, entao o paciente e criado.
- AC-RF001-02 - Dado que o medico tenta salvar um paciente sem qualquer um dos campos obrigatorios, quando confirma o cadastro, entao o sistema impede o salvamento e informa quais campos precisam ser preenchidos.
- AC-RF001-03 - Dado que o medico nao informa queixa inicial, quando salva o cadastro com os campos obrigatorios validos, entao o paciente e criado mesmo assim.
- AC-RF001-04 - Dado que o medico informa CPF invalido, quando salva o cadastro, entao o sistema rejeita o valor.
- AC-RF001-05 - Dado que ja existe paciente cadastrado com o mesmo CPF, quando o medico tenta salvar novo paciente, entao o sistema impede a duplicidade e informa o conflito.
- AC-RF001-06 - Dado que o medico informa e-mail invalido, quando salva o cadastro, entao o sistema rejeita o valor.
- AC-RF001-07 - Dado que o medico informa data de nascimento futura, quando salva o cadastro, entao o sistema impede o salvamento.
- AC-RF001-08 - Dado que o medico informa telefone invalido, quando salva o cadastro, entao o sistema rejeita o valor.

### RF-002 - Busca de pacientes

**Descricao:**
O medico deve poder buscar pacientes pelo nome para localizar rapidamente um prontuario.

**Criterios de aceite:**

- AC-RF002-01 - Dado que existem pacientes cadastrados, quando o medico busca por parte do nome, entao o sistema apresenta pacientes correspondentes.
- AC-RF002-02 - Dado que nenhum paciente corresponde ao termo buscado, quando o medico realiza a busca, entao o sistema apresenta estado vazio compreensivel.
- AC-RF002-03 - Dado que um paciente aparece no resultado, quando o medico seleciona esse paciente, entao o prontuario correspondente pode ser aberto.

### RF-003 - Visualizacao de dados basicos do paciente

**Descricao:**
O medico deve poder visualizar os dados basicos cadastrados de um paciente.

**Criterios de aceite:**

- AC-RF003-01 - Dado que um paciente esta cadastrado, quando o medico abre seus dados, entao o sistema apresenta nome e demais campos preenchidos.
- AC-RF003-02 - Dado que campos opcionais nao foram preenchidos, quando o medico visualiza o paciente, entao o sistema nao apresenta informacoes inventadas ou inferidas.

### RF-004 - Criacao de consulta

**Descricao:**
O medico deve poder criar uma consulta associada a um paciente, inclusive de forma retroativa quando necessario.

Dados obrigatorios:

- paciente;
- data e hora.

Observacoes da consulta podem ser registradas opcionalmente.

Toda consulta criada deve iniciar com status `AGENDADA`, inclusive quando cadastrada retroativamente.

Observacoes de consulta nao fazem parte da fonte clinica utilizada pela IA. Somente registros clinicos escritos pelo medico, conforme RF-013, entram no snapshot de analise.

Consultas retroativas sao permitidas. O cadastro retroativo de consultas ou registros clinicos nao altera analises anteriores ja geradas. Novas analises futuras devem considerar o historico clinico disponivel no momento de sua solicitacao.

**Criterios de aceite:**

- AC-RF004-01 - Dado que o medico seleciona um paciente e informa data e hora validas, quando salva a consulta, entao a consulta e criada com status `AGENDADA`.
- AC-RF004-02 - Dado que o medico tenta criar uma consulta sem paciente, quando salva, entao o sistema impede o salvamento.
- AC-RF004-03 - Dado que o medico tenta criar uma consulta sem data ou hora, quando salva, entao o sistema impede o salvamento.
- AC-RF004-04 - Dado que a consulta e criada com observacoes opcionais, quando a consulta e visualizada, entao as observacoes ficam disponiveis.
- AC-RF004-05 - Dado que o medico informa data e hora no passado, quando salva uma consulta retroativa valida, entao o sistema permite o cadastro e a consulta nasce como `AGENDADA`.
- AC-RF004-06 - Dado que uma consulta ou registro clinico retroativo e adicionado depois de uma analise existente, quando o historico de analises e consultado, entao as analises anteriores permanecem imutaveis.
- AC-RF004-07 - Dado que uma consulta possui observacoes, quando uma analise de IA e gerada, entao essas observacoes nao sao utilizadas como fonte clinica da analise.

### RF-005 - Visualizacao da agenda

**Descricao:**
O medico deve poder visualizar as consultas cadastradas na agenda interna do PsiqApp, incluindo consultas agendadas, realizadas, canceladas e faltas.

**Criterios de aceite:**

- AC-RF005-01 - Dado que existem consultas cadastradas, quando o medico acessa a agenda, entao o sistema apresenta paciente, data, hora e status de cada consulta.
- AC-RF005-02 - Dado que nao existem consultas para o periodo consultado, quando o medico acessa a agenda, entao o sistema apresenta estado vazio compreensivel.
- AC-RF005-03 - Dado que o medico acessa o prontuario de um paciente, quando consulta a agenda desse paciente, entao visualiza as consultas vinculadas a ele.
- AC-RF005-04 - Dado que existem consultas com diferentes status, quando o medico acessa a agenda, entao consultas agendadas, realizadas, canceladas e faltas podem ser visualizadas com seus respectivos status.

### RF-006 - Atualizacao de status da consulta

**Descricao:**
O medico deve poder alterar uma consulta agendada para realizada, cancelada ou falta do paciente.

No MVP, realizada, cancelada e falta sao estados finais.

**Criterios de aceite:**

- AC-RF006-01 - Dado que existe uma consulta agendada, quando o medico marca a consulta como realizada, entao o status passa a indicar realizacao.
- AC-RF006-02 - Dado que existe uma consulta agendada, quando o medico cancela a consulta, entao o status passa a indicar cancelamento.
- AC-RF006-03 - Dado que existe uma consulta agendada, quando o medico registra falta, entao o status passa a indicar falta do paciente.
- AC-RF006-04 - Dado que uma consulta possui status atualizado, quando ela aparece na agenda ou no prontuario, entao seu status atual fica visivel.
- AC-RF006-05 - Dado que uma consulta esta realizada, cancelada ou marcada como falta, quando o medico tenta retornar o status para agendada, entao o sistema rejeita a alteracao.
- AC-RF006-06 - Dado que uma consulta esta em um estado final, quando o medico tenta alterar diretamente para outro estado final, entao o sistema rejeita a alteracao.

### RF-007 - Registro de parecer clinico

**Descricao:**
O medico deve poder registrar um parecer clinico durante ou depois de uma consulta. O parecer deve conter texto livre obrigatorio e pode conter estado/humor e medicacoes em uso como texto livre opcional.

Um parecer pode estar associado a uma consulta especifica, mas essa associacao nao e obrigatoria.

O parecer possui duas referencias temporais distintas:

- `clinicalDateTime`: data/hora clinica usada na linha do tempo e na analise longitudinal;
- `createdAt`: data/hora real de criacao no sistema, usada para auditoria.

Por padrao, `clinicalDateTime` deve assumir a data/hora atual no momento do cadastro. Antes de salvar, o medico pode alterar esse valor para representar uma data/hora clinica retroativa.

`createdAt` e gerado automaticamente pelo sistema e nao pode ser editado pelo medico.

**Criterios de aceite:**

- AC-RF007-01 - Dado que o medico informa o texto livre do parecer, quando salva o registro, entao o parecer e criado.
- AC-RF007-02 - Dado que o medico tenta salvar um parecer sem texto, quando confirma o registro, entao o sistema impede o salvamento e informa que o texto e obrigatorio.
- AC-RF007-03 - Dado que o medico informa estado/humor, quando salva o parecer, entao essa informacao fica vinculada ao parecer.
- AC-RF007-04 - Dado que o medico informa medicacoes em uso como texto livre, quando salva o parecer, entao essa informacao fica vinculada ao parecer sem validacao farmacologica.
- AC-RF007-05 - Dado que o medico nao associa o parecer a uma consulta, quando salva o parecer, entao o registro e criado como informacao clinica independente de consulta agendada.
- AC-RF007-06 - Dado que o medico associa o parecer a uma consulta, quando visualiza o historico, entao a relacao entre parecer e consulta fica identificavel.
- AC-RF007-07 - Dado que o medico nao altera `clinicalDateTime`, quando salva o parecer, entao o registro utiliza como data/hora clinica o valor atual apresentado no cadastro.
- AC-RF007-08 - Dado que o medico informa `clinicalDateTime` anterior ao momento atual, quando salva um parecer retroativo valido, entao o sistema permite o cadastro.
- AC-RF007-09 - Dado que um parecer e salvo, quando seus metadados sao consultados, entao e possivel distinguir `clinicalDateTime` de `createdAt`.
- AC-RF007-10 - Dado que o parecer e criado, quando o sistema registra `createdAt`, entao esse valor representa o momento efetivo de criacao e nao pode ser alterado pelo medico.

### RF-008 - Preservacao append-only dos pareceres e complementos

**Descricao:**
Pareceres ja registrados nao devem ser sobrescritos no MVP. Correcoes ou novas informacoes relacionadas a um parecer devem ser registradas como novo `Complemento`.

Complemento e um tipo de registro clinico escrito pelo medico e deve:

- possuir texto livre obrigatorio;
- referenciar obrigatoriamente um parecer original existente;
- pertencer ao mesmo paciente do parecer original;
- possuir `clinicalDateTime` proprio;
- possuir `createdAt` proprio, automatico e imutavel;
- permitir estado/humor opcional;
- permitir medicacoes em uso opcionais.

Por padrao, `clinicalDateTime` do complemento assume a data/hora atual, podendo ser alterado pelo medico antes do salvamento para representar informacao clinica retroativa.

Complementos fazem parte da fonte clinica das analises futuras, podem ser evidencias e disparam nova geracao automatica de analise.

**Criterios de aceite:**

- AC-RF008-01 - Dado que um parecer foi salvo, quando o medico precisa corrigir ou complementar informacoes, entao o sistema permite criar um novo Complemento.
- AC-RF008-02 - Dado que um Complemento e criado, quando o medico tenta salva-lo sem texto, entao o sistema impede o salvamento.
- AC-RF008-03 - Dado que um Complemento e criado, quando nao existe parecer original valido associado, entao o sistema impede o salvamento.
- AC-RF008-04 - Dado que um Complemento referencia um parecer original, quando o sistema valida a associacao, entao ambos devem pertencer ao mesmo paciente.
- AC-RF008-05 - Dado que um parecer original recebeu Complemento posterior, quando o historico e visualizado, entao o registro original permanece disponivel.
- AC-RF008-06 - Dado que existe um Complemento, quando ele aparece na linha do tempo, entao o parecer original relacionado fica identificavel.
- AC-RF008-07 - Dado que o medico nao altera `clinicalDateTime` do Complemento, quando salva o registro, entao e utilizado o valor atual apresentado no cadastro.
- AC-RF008-08 - Dado que o medico informa `clinicalDateTime` retroativo para o Complemento, quando salva um registro valido, entao o sistema permite o cadastro.
- AC-RF008-09 - Dado que um Complemento e salvo, quando o sistema processa atualizacao da analise, entao ele e considerado no novo snapshot e dispara nova geracao automatica.
- AC-RF008-10 - Dado que existem pareceres e complementos, quando o historico e visualizado, entao a ordem clinica permite reconstruir a sequencia dos registros.

### RF-009 - Linha do tempo do prontuario

**Descricao:**
O prontuario deve apresentar os pareceres e complementos do paciente em linha do tempo organizada.

A ordenacao principal da linha do tempo deve utilizar a data/hora clinica do registro (`clinicalDateTime`), apresentando os registros mais recentes clinicamente primeiro.

A data/hora de criacao no sistema (`createdAt`) deve ser preservada para auditoria e usada como criterio de desempate quando dois registros possuirem a mesma data/hora clinica. Em caso de empate de `clinicalDateTime`, o registro com `createdAt` mais recente deve aparecer primeiro.

**Criterios de aceite:**

- AC-RF009-01 - Dado que um paciente possui registros clinicos, quando o medico abre o prontuario, entao o sistema apresenta os registros do `clinicalDateTime` mais recente para o mais antigo.
- AC-RF009-02 - Dado que um parecer possui estado/humor ou medicacoes registradas, quando aparece na linha do tempo, entao essas informacoes ficam visiveis.
- AC-RF009-03 - Dado que um parecer esta associado a uma consulta, quando aparece na linha do tempo, entao a consulta relacionada fica identificavel.
- AC-RF009-04 - Dado que um paciente nao possui pareceres, quando o prontuario e aberto, entao o sistema apresenta estado vazio compreensivel.
- AC-RF009-05 - Dado que dois registros possuem o mesmo `clinicalDateTime`, quando aparecem na linha do tempo, entao o registro com `createdAt` mais recente aparece primeiro.
- AC-RF009-06 - Dado que um parecer retroativo e criado posteriormente, quando a linha do tempo e visualizada, entao ele aparece na posicao correspondente ao seu `clinicalDateTime`, sem alterar seu `createdAt`.

### RF-010 - Geracao automatica de analise por IA

**Descricao:**
Quando um novo parecer clinico ou complemento for salvo, o sistema deve iniciar automaticamente a geracao de uma nova analise de evolucao do paciente.

Esse processamento nao deve bloquear o salvamento do registro nem impedir que o medico continue usando o sistema.

Cada geracao deve considerar um snapshot logico do historico clinico existente no momento da solicitacao. Registros adicionados depois pertencem a geracoes posteriores.

Quando multiplas geracoes existirem, a analise atual deve ser determinada pelo snapshot clinico mais recente considerado, e nao pela ordem de conclusao dos processamentos.

**Criterios de aceite:**

- AC-RF010-01 - Dado que o medico salva um novo parecer ou complemento valido, quando o salvamento e concluido, entao o registro fica disponivel independentemente da conclusao da analise.
- AC-RF010-02 - Dado que um novo registro clinico foi salvo, quando o sistema inicia a atualizacao da analise, entao o medico consegue continuar usando o sistema.
- AC-RF010-03 - Dado que a analise esta sendo produzida, quando o medico visualiza o prontuario, entao o sistema indica que existe atualizacao em andamento.
- AC-RF010-04 - Dado que uma geracao considera determinado conjunto de registros, quando ela e criada, entao esse conjunto permanece o snapshot daquela geracao mesmo que novos registros sejam adicionados antes da conclusao.
- AC-RF010-05 - Dado que uma geracao mais antiga termina depois de uma geracao baseada em snapshot clinico mais recente, quando o sistema determina a analise atual, entao a geracao antiga nao substitui a mais recente.
- AC-RF010-06 - Dado que uma nova analise valida e concluida com o snapshot clinico mais recente, quando o medico visualiza a analise atual, entao ela passa a ser apresentada como atual.
- AC-RF010-07 - Dado que um parecer retroativo e salvo, quando o salvamento e concluido, entao ele dispara uma nova geracao automatica de analise como qualquer outro novo parecer.
- AC-RF010-08 - Dado que um parecer retroativo e salvo depois de uma analise anterior, quando a nova geracao e criada, entao o novo snapshot inclui esse parecer e as analises anteriores permanecem imutaveis.

### RF-011 - Regeneracao manual de analise por IA

**Descricao:**
O medico deve poder solicitar manualmente uma nova analise quando:

- existir pelo menos um parecer original para o paciente;
- nao houver outra geracao em andamento para esse paciente.

A indisponibilidade da acao manual deve seguir sempre essas duas regras, independentemente de haver falha anterior.

Quando o paciente nao possuir parecer original, nenhuma geracao manual deve ser iniciada.

**Criterios de aceite:**

- AC-RF011-01 - Dado que o paciente possui pelo menos um parecer original e nao existe geracao em andamento, quando o medico solicita nova analise manualmente, entao o sistema inicia uma nova geracao.
- AC-RF011-02 - Dado que existe uma geracao em andamento para o paciente, quando o medico visualiza a acao de regeneracao manual, entao a acao permanece indisponivel ate a conclusao ou falha da geracao atual.
- AC-RF011-03 - Dado que o paciente nao possui parecer original, quando o medico visualiza a acao de regeneracao manual, entao a acao permanece indisponivel e o sistema informa que nao ha conteudo clinico suficiente para gerar analise.
- AC-RF011-04 - Dado que houve falha anterior, existe pelo menos um parecer original e nao existe geracao em andamento, quando o medico solicita nova analise manualmente, entao o sistema permite nova geracao.
- AC-RF011-05 - Dado que uma nova analise manual e concluida, quando o medico consulta o historico de analises, entao a nova analise aparece como novo registro.
- AC-RF011-06 - Dado que a regeneracao manual considera o mesmo snapshot de registros clinicos de uma analise anterior, quando ambas sao consultadas, entao as duas permanecem preservadas como geracoes distintas.

### RF-012 - Conteudo da analise de evolucao

**Descricao:**
A analise de IA deve organizar o historico clinico em quatro areas principais:

- linha do tempo resumida;
- padroes observados;
- pontos de atencao;
- limitacoes da analise.

Padroes observados e pontos de atencao devem possuir evidencias obrigatorias. A linha do tempo resumida pode referenciar registros sem exigir evidencia por frase. Limitacoes nao exigem evidencia.

**Criterios de aceite:**

- AC-RF012-01 - Dado que uma analise e gerada, quando o medico a visualiza, entao as quatro areas principais estao presentes ou explicitamente indicadas como sem informacao suficiente.
- AC-RF012-02 - Dado que a analise apresenta um padrao observado, quando o medico consulta essa observacao, entao existem evidencias associadas.
- AC-RF012-03 - Dado que a analise apresenta um ponto de atencao, quando o medico consulta essa observacao, entao existem evidencias associadas.
- AC-RF012-04 - Dado que uma informacao nao existe nos registros clinicos escritos pelo medico, quando a analise e gerada, entao essa informacao nao deve ser afirmada como fato clinico.

### RF-013 - Fonte de verdade da analise por IA

**Descricao:**
Cada nova analise deve considerar todos os registros clinicos escritos pelo medico existentes ate o momento em que a geracao foi solicitada, incluindo pareceres originais e complementos, organizados cronologicamente por `clinicalDateTime`. Analises anteriores de IA nunca devem ser usadas como fonte clinica para gerar nova analise.

O conjunto de registros considerado por uma geracao deve permanecer congelado como snapshot daquela solicitacao.

Observacoes de consulta nao fazem parte do snapshot clinico da IA.

**Criterios de aceite:**

- AC-RF013-01 - Dado que um paciente possui pareceres e analises anteriores, quando uma nova analise e gerada, entao a fonte clinica considerada sao os registros escritos pelo medico, nao as analises anteriores.
- AC-RF013-02 - Dado que uma analise anterior contem interpretacao ou erro, quando uma nova analise e gerada, entao essa analise anterior nao e usada como entrada clinica.
- AC-RF013-03 - Dado que os registros clinicos estao disponiveis, quando uma analise e gerada, entao todos os registros pertencentes ao snapshot da solicitacao sao considerados em ordem cronologica baseada em `clinicalDateTime`.
- AC-RF013-04 - Dado que um novo registro clinico e salvo depois da criacao de uma geracao em andamento, quando essa geracao termina, entao o novo registro nao e incorporado retroativamente ao snapshot antigo.
- AC-RF013-05 - Dado que um parecer retroativo pertence ao snapshot de uma nova geracao, quando o historico e enviado para analise, entao ele e posicionado de acordo com seu `clinicalDateTime`, independentemente de seu `createdAt`.

### RF-014 - Tratamento de historico minimo

**Descricao:**
A analise deve respeitar a quantidade de pareceres clinicos originais disponiveis no snapshot e nao deve criar falsa tendencia quando o historico longitudinal e insuficiente.

Para esta regra:

- parecer original representa um ponto clinico temporal para avaliacao de evolucao;
- complemento faz parte da fonte clinica e deve ser considerado na analise;
- complemento nao aumenta, por si so, a quantidade de pontos temporais usados para decidir se existe historico longitudinal suficiente.

**Criterios de aceite:**

- AC-RF014-01 - Dado que o snapshot nao possui pareceres originais, quando o medico solicita ou espera uma analise, entao o sistema informa que nao ha conteudo suficiente para analise longitudinal.
- AC-RF014-02 - Dado que o snapshot possui apenas um parecer original, mesmo que existam um ou mais complementos associados, quando a analise e gerada, entao ela pode organizar ou resumir os registros clinicos, mas deve declarar que nao ha historico suficiente para identificar evolucao ou tendencia.
- AC-RF014-03 - Dado que o snapshot possui dois ou mais pareceres originais, quando a analise e gerada, entao ela pode apresentar leitura longitudinal baseada em todos os registros clinicos pertencentes ao snapshot, incluindo complementos.

### RF-015 - Evidencias das conclusoes da IA

**Descricao:**
Padroes observados e pontos de atencao produzidos pela IA devem ser rastreaveis aos registros que os sustentam.

Toda evidencia deve apontar para um registro existente e pertencente ao mesmo paciente da analise.

**Criterios de aceite:**

- AC-RF015-01 - Dado que a IA apresenta um padrao observado ou ponto de atencao, quando o medico consulta suas evidencias, entao o sistema apresenta referencias aos registros clinicos que sustentam a observacao, incluindo complementos quando aplicavel.
- AC-RF015-02 - Dado que uma observacao possui evidencias, quando o medico acessa uma evidencia, entao consegue localizar o registro original correspondente.
- AC-RF015-03 - Dado que a IA apresenta uma interpretacao baseada em evidencias, quando ela e exibida, entao fica claro que a evidencia mostra origem da interpretacao e nao transforma a interpretacao em fato clinico.
- AC-RF015-04 - Dado que uma evidencia referencia registro inexistente, quando a resposta da IA e validada, entao essa evidencia e considerada invalida.
- AC-RF015-05 - Dado que uma evidencia referencia registro pertencente a outro paciente, quando a resposta da IA e validada, entao essa evidencia e rejeitada.

### RF-016 - Limites de comportamento da IA

**Descricao:**
A IA deve atuar apenas como ferramenta de apoio a leitura do prontuario. Ela nao deve diagnosticar, prescrever, indicar condutas, inferir informacoes ausentes ou usar conhecimento medico externo para criar conclusoes clinicas novas sobre o paciente.

**Criterios de aceite:**

- AC-RF016-01 - Dado que a analise e apresentada ao medico, quando ele a visualiza, entao fica claro que se trata de ferramenta de apoio e que a decisao clinica permanece com o medico.
- AC-RF016-02 - Dado que os registros nao afirmam determinado diagnostico, quando a analise e gerada, entao a IA nao deve afirmar que o paciente possui tal diagnostico.
- AC-RF016-03 - Dado que os registros mencionam medicacoes, quando a analise e gerada, entao a IA nao deve indicar inicio, suspensao, troca ou alteracao de dose de medicamento.
- AC-RF016-04 - Dado que existem lacunas no historico, quando a analise e gerada, entao a IA nao deve preencher lacunas por suposicao.

### RF-017 - Historico imutavel de analises de IA

**Descricao:**
Cada geracao de IA deve criar uma nova analise preservada historicamente. Analises anteriores nao devem ser substituidas por analises novas.

**Criterios de aceite:**

- AC-RF017-01 - Dado que uma analise ja existe, quando uma nova analise e concluida, entao a analise anterior permanece disponivel.
- AC-RF017-02 - Dado que existem multiplas analises para um paciente, quando o medico consulta o historico de analises, entao consegue visualizar geracoes anteriores.
- AC-RF017-03 - Dado que uma analise antiga e consultada, quando o medico a visualiza, entao ela representa o snapshot gerado naquele momento.

### RF-018 - Auditabilidade da analise

**Descricao:**
Cada analise concluida e cada geracao falha devem permitir identificar informacoes basicas de auditoria conceitual sobre sua geracao e sobre o snapshot de registros clinicos considerado.

Para fins de auditoria, deve ser possivel distinguir:
- quantidade total de registros clinicos considerados;
- quantidade de pareceres originais considerados;
- quantidade de complementos considerados;
- ultimo registro clinico considerado no snapshot, definido como o registro com maior `clinicalDateTime`; em empate, maior `createdAt`.

**Criterios de aceite:**

- AC-RF018-01 - Dado que uma analise foi gerada, quando o medico ou avaliador a consulta, entao e possivel identificar quando foi gerada e para qual paciente.
- AC-RF018-02 - Dado que uma analise foi gerada, quando seus metadados sao consultados, entao e possivel identificar a quantidade total de registros clinicos considerados.
- AC-RF018-03 - Dado que uma analise foi gerada, quando seus metadados sao consultados, entao e possivel identificar separadamente quantos pareceres originais e quantos complementos foram considerados.
- AC-RF018-04 - Dado que uma analise foi gerada, quando seus metadados sao consultados, entao e possivel identificar como ultimo registro clinico o de maior `clinicalDateTime`; em empate, o de maior `createdAt`.
- AC-RF018-05 - Dado que uma observacao relevante aparece na analise, quando suas evidencias sao consultadas, entao e possivel identificar os registros clinicos originais usados como suporte, incluindo complementos quando aplicavel.
- AC-RF018-06 - Dado que uma geracao falha, quando seus metadados sao consultados, entao e possivel identificar paciente, momento da solicitacao, estado de falha e snapshot ou ultimo registro clinico considerado, quando aplicavel.

### RF-019 - Tratamento de falhas da IA

**Descricao:**
Falhas na geracao de analise por IA nao devem comprometer pareceres, consultas, dados antigos ou analises anteriores.

Respostas invalidas, inseguras ou incompativeis com o contrato esperado nao devem ser exibidas como analise valida.

Quando apenas uma observacao ou evidencia especifica for invalida, o sistema pode rejeitar somente esse elemento, desde que o restante da analise permaneca valido, consistente e seguro. Se a estrutura global da resposta for invalida, se houver conteudo inseguro que nao possa ser isolado com seguranca, ou se a consistencia geral da analise ficar comprometida, a geracao inteira deve ser considerada falha.

Quando existir analise valida anterior, ela deve permanecer como atual.

Geracoes falhas devem manter metadados minimos de auditoria suficientes para identificar paciente, momento da solicitacao, estado de falha e snapshot ou ultimo registro clinico considerado, quando aplicavel.

**Criterios de aceite:**

- AC-RF019-01 - Dado que a geracao de IA falha, quando o medico consulta o prontuario, entao o parecer salvo permanece disponivel.
- AC-RF019-02 - Dado que a geracao de IA falha, quando o medico consulta analises anteriores, entao elas continuam disponiveis.
- AC-RF019-03 - Dado que a geracao de IA falha, quando o medico visualiza o estado da analise, entao o sistema apresenta falha de maneira compreensivel.
- AC-RF019-04 - Dado que a geracao de IA falhou e nao existe outra geracao em andamento, quando o medico solicita nova tentativa manual, entao o sistema inicia uma nova geracao.
- AC-RF019-05 - Dado que a IA retorna resposta globalmente invalida, insegura ou incompativel com o contrato esperado, quando a resposta e validada, entao ela nao e exibida como analise valida e a geracao e marcada como falha.
- AC-RF019-06 - Dado que apenas uma observacao ou evidencia especifica e invalida, quando o restante da resposta continua valido, consistente e seguro, entao o elemento invalido pode ser rejeitado sem invalidar obrigatoriamente toda a analise.
- AC-RF019-07 - Dado que a remocao do elemento invalido compromete a consistencia global da analise, quando a resposta e validada, entao a geracao inteira e marcada como falha.
- AC-RF019-08 - Dado que uma geracao falha e existe uma analise valida anterior, quando o medico visualiza a analise atual, entao a ultima analise valida permanece apresentada como atual.
- AC-RF019-09 - Dado que uma geracao falha, quando seus metadados de auditoria sao consultados, entao e possivel identificar paciente, momento da solicitacao, estado de falha e snapshot ou ultimo registro clinico considerado, quando aplicavel.
- AC-RF019-10 - Dado que uma observacao ou evidencia invalida e rejeitada individualmente, quando a analise validada e exibida ao medico, entao apenas o conteudo validado e apresentado; a existencia do item rejeitado deve permanecer registrada para auditoria tecnica, sem expor conteudo inseguro ao medico.

### RF-020 - Isolamento entre pacientes

**Descricao:**
Consultas, pareceres, complementos, analises, geracoes de analise e evidencias devem permanecer estritamente associadas ao mesmo paciente.

Qualquer associacao cruzada entre pacientes deve ser rejeitada.

**Criterios de aceite:**

- AC-RF020-01 - Dado que uma consulta pertence a um paciente, quando outro paciente e consultado, entao essa consulta nao aparece em seu contexto.
- AC-RF020-02 - Dado que um parecer ou complemento pertence a um paciente, quando o historico de outro paciente e carregado, entao esse registro nao e retornado.
- AC-RF020-03 - Dado que uma geracao de analise pertence a um paciente, quando seu contexto clinico e montado, entao somente registros desse mesmo paciente sao considerados.
- AC-RF020-04 - Dado que uma evidencia aponta para registro de outro paciente, quando a analise e validada, entao a associacao e rejeitada.
- AC-RF020-05 - Dado que uma analise e concluida, quando ela e persistida ou apresentada, entao permanece vinculada exclusivamente ao paciente que originou a geracao.

## 7. Jornada e fluxos principais

### Fluxo 1 - Cadastro e localizacao de paciente

1. O medico cadastra um paciente informando nome, CPF, data de nascimento, telefone e e-mail; a queixa inicial e opcional.
2. O sistema salva o paciente.
3. O medico busca o paciente pelo nome.
4. O sistema apresenta os resultados correspondentes.
5. O medico abre o prontuario do paciente.

### Fluxo 2 - Criacao e acompanhamento de consulta

1. O medico cria uma consulta informando paciente, data e hora.
2. O sistema apresenta a consulta na agenda interna.
3. O medico pode marcar a consulta como realizada, cancelada ou falta.
4. O status atualizado fica visivel na agenda e no contexto do paciente.

### Fluxo 3 - Registro de parecer e atualizacao automatica da analise

1. O medico abre o prontuario do paciente.
2. O medico registra um parecer com texto livre obrigatorio e, opcionalmente, estado/humor e medicacoes em uso como texto livre; quando necessario, pode informar `clinicalDateTime` retroativo.
3. O medico salva o parecer.
4. O sistema preserva o parecer no prontuario.
5. O sistema inicia a geracao de nova analise em segundo plano.
6. O medico continua usando o sistema sem aguardar a conclusao da IA.
7. Quando concluida e baseada no snapshot clinico mais recente, a nova analise passa a ser apresentada como analise atual.
8. Analises anteriores permanecem consultaveis.

### Fluxo 4 - Falha na geracao de analise

1. O medico salva um novo parecer ou solicita regeneracao manual.
2. O sistema inicia a geracao de analise.
3. A geracao falha por indisponibilidade, lentidao, resposta invalida ou outra causa.
4. O parecer e os dados existentes permanecem preservados.
5. O sistema informa a falha de forma compreensivel.
6. O medico pode solicitar nova tentativa manual.

### Fluxo 5 - Revisao longitudinal antes da consulta

1. O medico busca e abre o prontuario do paciente.
2. O medico consulta a linha do tempo de registros clinicos, incluindo pareceres originais e complementos.
3. O medico consulta a analise atual.
4. O medico revisa padroes, pontos de atencao, limitacoes e evidencias.
5. O medico retorna aos registros clinicos originais usados como evidencia quando precisa verificar a fonte.

## 8. Regras de negocio

- Nome, CPF, data de nascimento, telefone e e-mail do paciente sao obrigatorios no MVP.
- Queixa inicial e opcional.
- CPF deve possuir formato valido e nao pode duplicar outro paciente.
- E-mail deve possuir validacao basica de formato.
- Data de nascimento nao pode estar no futuro.
- Telefone deve possuir validacao basica de formato.
- Toda consulta deve estar associada a um paciente e possuir data e hora.
- Toda consulta criada inicia com status `AGENDADA`, inclusive quando retroativa.
- Observacoes de consulta nao fazem parte da fonte clinica da IA.

- Consultas retroativas sao permitidas.
- Pareceres retroativos sao permitidos.
- Todo parecer deve preservar separadamente a data/hora clinica (`clinicalDateTime`) e a data/hora real de criacao (`createdAt`).
- A linha do tempo e a ordenacao clinica usada pela IA devem utilizar `clinicalDateTime`.
- `createdAt` deve ser preservado para auditoria e nao deve ser editavel.
- Parecer retroativo salvo deve disparar nova geracao automatica de analise.
- Parecer retroativo entra apenas em snapshots criados depois de seu salvamento; analises anteriores permanecem imutaveis.
- A agenda do MVP e interna ao PsiqApp e alimentada manualmente.
- A agenda pode apresentar consultas agendadas, realizadas, canceladas e faltas.
- Uma consulta agendada pode passar para realizada, cancelada ou falta.
- Realizada, cancelada e falta sao estados finais no MVP.
- Um parecer deve possuir texto livre obrigatorio.
- Estado/humor e medicacoes em uso sao opcionais.
- Medicacoes em uso devem ser registradas como texto livre.
- Um parecer pode estar associado a uma consulta, mas essa associacao nao e obrigatoria.
- Pareceres salvos nao devem ser sobrescritos.
- Correcoes e complementos devem ser registrados como novo registro de complemento.
- Todo complemento deve referenciar o parecer original correspondente.
- O registro original deve permanecer preservado.
- Pareceres e complementos sao considerados registros clinicos para novas analises.
- Complementos podem alterar ou corrigir a interpretacao de pareceres anteriores e devem ser considerados em analises futuras, mas nao criam sozinhos um novo ponto temporal para determinar suficiencia longitudinal.
- Cada novo parecer ou complemento salvo deve iniciar uma nova geracao de analise por IA.
- A geracao de analise por IA nao deve bloquear o salvamento do registro clinico.
- A indisponibilidade da IA nao deve impedir o uso do prontuario.
- Cada geracao deve utilizar snapshot logico dos registros clinicos existentes no momento da solicitacao.
- Registros adicionados depois de uma solicitacao nao entram retroativamente no snapshot daquela geracao.
- Cada nova analise deve considerar todos os registros clinicos escritos pelo medico pertencentes ao snapshot do paciente, incluindo pareceres originais e complementos.
- Analises anteriores de IA nunca devem ser usadas como fonte clinica para gerar nova analise.
- Cada geracao de IA deve criar uma nova analise preservada historicamente.
- Analises anteriores nao devem ser substituidas.
- A analise atual deve ser determinada pelo snapshot clinico mais recente, nao pela ordem de termino do processamento.
- Regeneracao manual nao deve ser permitida enquanto houver outra geracao em andamento para o mesmo paciente.
- Sem parecer original, nao ha conteudo suficiente para analise longitudinal.
- Com apenas um parecer original, mesmo que existam complementos, a IA pode organizar ou resumir os registros clinicos, mas deve declarar ausencia de historico suficiente para evolucao ou tendencia.
- Com dois ou mais pareceres originais, a IA pode produzir analise longitudinal usando todos os registros clinicos do snapshot, incluindo complementos.
- Padroes observados e pontos de atencao devem possuir evidencias.
- Toda evidencia deve apontar para registro existente do mesmo paciente.
- A IA nao deve diagnosticar, prescrever, recomendar inicio, suspensao, troca ou alteracao de dose de medicamento.
- A IA nao deve afirmar informacoes ausentes nos registros do medico.
- Resposta invalida, insegura ou incompativel com o contrato esperado nao deve ser exibida como analise valida.
- Quando uma geracao falhar, a ultima analise valida permanece como atual quando existir.
- Consultas, pareceres, complementos, analises, geracoes e evidencias devem permanecer isolados por paciente.
- Geracoes falhas devem preservar metadados minimos de auditoria.
- Quando apenas uma observacao ou evidencia da IA for invalida, ela pode ser rejeitada individualmente se o restante da analise continuar valido, consistente e seguro.
- Logs nao devem expor prontuario completo, resposta clinica integral da IA, CPF completo sem necessidade operacional explicita, secrets ou dados clinicos sensiveis em mensagens de erro.
- Somente dados necessarios devem ser enviados ao provedor de IA, sempre restritos ao paciente analisado.
- A decisao clinica final permanece sempre com o medico.

## 9. Dados e informacoes envolvidas

### Paciente

- nome;
- CPF;
- data de nascimento;
- telefone;
- e-mail;
- queixa inicial.

### Consulta

- paciente associado;
- data e hora;
- status;
- observacoes opcionais.

Status previstos:

- futura/agendada;
- realizada;
- cancelada;
- falta do paciente.

### Parecer clinico

- paciente associado;
- `clinicalDateTime` - data/hora clinica usada na linha do tempo e na analise longitudinal;
- `createdAt` - data/hora real de criacao no sistema para auditoria;
- texto livre;
- estado/humor opcional;
- medicacoes em uso como texto livre opcional;
- consulta relacionada, quando houver;
- indicacao de complemento, quando aplicavel;
- referencia ao parecer original, quando for complemento.

### Analise de IA
### Analise de IA

- paciente associado;
- data de geracao;
- estado da geracao;
- linha do tempo resumida;
- padroes observados;
- pontos de atencao;
- limitacoes da analise;
- quantidade total de registros clinicos considerados;
- quantidade de pareceres originais considerados;
- quantidade de complementos considerados;
- ultimo registro clinico considerado;
- evidencias relacionadas a observacoes relevantes;
- historico de geracoes anteriores;

Estados previstos para geracao de analise:

- em geracao;
- concluida;
- falha.

Quando nao existir nenhum parecer original, nenhuma analise deve ser gerada por falta de fonte clinica minima. Quando existir apenas um parecer original, a geracao pode ser concluida como resumo organizado, mas deve declarar explicitamente insuficiencia de historico para evolucao ou tendencia.

## 10. Requisitos nao funcionais

### RNF-001 - Usabilidade para medico sem conhecimento tecnico

**Descricao:**
O sistema deve ser compreensivel por um medico sem conhecimento tecnico.

**Criterio mensuravel:**
Durante a validacao, o medico deve conseguir executar os fluxos principais de cadastro, busca, abertura de prontuario, registro de parecer e consulta da analise sem auxilio tecnico direto apos orientacao inicial do produto.

### RNF-002 - Nao bloqueio do prontuario por dependencia de IA

**Descricao:**
A operacao de salvar parecer clinico nao deve depender da conclusao da IA.

**Criterio mensuravel:**
Em cenario de indisponibilidade, lentidao ou falha da IA, um parecer valido deve permanecer salvo e visivel no prontuario.

### RNF-003 - Auditabilidade clinica basica

**Descricao:**
Registros clinicos e analises devem preservar informacoes suficientes para reconstrucao cronologica e verificacao das fontes.

**Criterio mensuravel:**
Para cada registro clinico deve ser possivel identificar paciente, tipo do registro, conteudo registrado, data/hora clinica (`clinicalDateTime`) e data/hora real de criacao no sistema (`createdAt`). Para cada analise concluida deve ser possivel identificar paciente, data de geracao, quantidade total de registros clinicos considerados, quantidade de pareceres originais, quantidade de complementos, ultimo registro clinico considerado e evidencias das observacoes relevantes. Para geracoes falhas, devem ser preservados os metadados minimos definidos em RF-018.

Para parecer retroativo, `clinicalDateTime` e `createdAt` devem permanecer distintos e auditaveis.

### RNF-004 - Privacidade no MVP de validacao

**Descricao:**
O MVP de desenvolvimento e validacao deve ser tratado como ambiente para dados ficticios, sem premissa de prontidao para dados clinicos reais.

**Criterio mensuravel:**
Durante todo o uso do ambiente de desenvolvimento/validacao, deve existir aviso persistente e visivel na aplicacao informando que dados reais de pacientes nao devem ser inseridos no MVP. A localizacao e composicao visual exatas pertencem ao design/TechSpec.

### RNF-005 - Clareza sobre limites da IA

**Descricao:**
A analise de IA deve deixar claro seu papel de apoio e suas limitacoes.

**Criterio mensuravel:**
Toda analise exibida deve apresentar limitacoes da analise e nao deve conter diagnostico fechado, prescricao, recomendacao terapeutica ou afirmacao de informacao inexistente nos registros.

### RNF-006 - Privacidade operacional de logs

**Descricao:**
Logs e mensagens operacionais nao devem expor dados clinicos sensiveis ou secrets.

**Criterio mensuravel:**
Logs nao devem conter prontuario completo, resposta clinica integral da IA, CPF completo sem necessidade operacional explicita, secrets, credenciais ou dados clinicos sensiveis em mensagens de erro.

### RNF-007 - Minimizacao de dados enviados ao provedor de IA

**Descricao:**
Somente dados necessarios para a analise devem ser enviados ao provedor de IA.

**Criterio mensuravel:**
O contexto enviado ao provedor deve conter apenas dados do paciente analisado e somente informacoes necessarias para a geracao. Campos cadastrais sem necessidade para a analise nao devem ser enviados, e o nome do paciente deve ser omitido sempre que nao houver necessidade explicita.

### RNF-008 - Volume inicial de validacao

**Descricao:**
O MVP deve ser avaliado considerando volumes iniciais estimados para evitar criterios de desempenho arbitrarios.

**Criterio mensuravel:**
A validacao do MVP integrado deve registrar comportamento observado em cenarios representativos de aproximadamente 100 a 500 pacientes, 20 a 100 registros clinicos por paciente e casos longos com 200 ou mais registros, ainda que esses volumes sejam estimativas e nao limites rigidos do produto. Esses volumes nao sao pre-requisitos para iniciar a TechSpec nem o desenvolvimento das primeiras Tasks.

## 11. Restricoes e compliance de alto nivel

- O sistema manipula informacoes de saude e dados pessoais sensiveis.
- O MVP nao deve ser considerado pronto para armazenar prontuarios reais em producao.
- No MVP de desenvolvimento e validacao devem ser usados dados ficticios.
- O ambiente de desenvolvimento/validacao deve exibir aviso persistente de que dados reais de pacientes nao devem ser inseridos.
- Nao ha premissa de que qualquer provedor de IA possa receber dados clinicos reais.
- Antes do uso com pacientes reais, devem ser tratados requisitos adicionais de LGPD, autenticacao, autorizacao, criptografia, hospedagem, backup, seguranca operacional, retencao, logs, fornecedores externos e tratamento de dados por provedores de IA.
- A ausencia de autenticacao no prototipo local nao significa que autenticacao seja desnecessaria para o produto final.
- Logs operacionais nao devem expor dados clinicos sensiveis, prontuario completo, resposta clinica integral da IA ou secrets.
- O envio de dados ao provedor de IA deve seguir principio de minimizacao e isolamento por paciente.
- A IA deve ser apresentada como ferramenta de apoio, nao como agente de decisao clinica.

## 12. Fora do escopo

Nao fazem parte do MVP:

- multiplos medicos;
- multiplos perfis de acesso;
- portal ou aplicativo do paciente;
- equipe administrativa;
- prescricao eletronica;
- assinatura digital;
- emissao de atestado;
- faturamento;
- convenios;
- financeiro;
- integracao com Google Calendar;
- integracao com WhatsApp;
- integracao com sistemas externos de agendamento;
- integracao com sistemas de clinicas;
- RAG;
- banco vetorial;
- embeddings;
- busca semantica no prontuario;
- resumo incremental como fonte principal da proxima analise;
- catalogo farmacologico;
- validacao de medicamentos;
- mecanismo de prescricao;
- regras de dose;
- regras de interacao medicamentosa;
- recomendacao terapeutica;
- diagnostico automatizado;
- dashboard clinico avancado;
- uso em producao com dados reais;
- infraestrutura completa de seguranca para operacao clinica real;
- exportacao avancada do prontuario.

## 13. Riscos de produto e uso

- A IA pode gerar interpretacoes incorretas, incompletas ou excessivamente confiantes.
- O medico pode interpretar a analise de IA como fato clinico se os limites nao forem claros.
- Historicos curtos podem induzir falsa percepcao de tendencia se a insuficiencia de dados nao for explicitada.
- Falhas, lentidao ou indisponibilidade da IA podem reduzir a utilidade percebida do produto.
- O uso acidental de dados reais no MVP criaria risco relevante de privacidade e compliance.
- A ausencia de autenticacao no prototipo local impede uso seguro com dados reais.
- Historicos muito longos podem tornar a geracao de analise lenta, custosa ou inviavel sem estrategias futuras.
- Registro de medicacoes como texto livre pode dificultar analises estruturadas futuras, embora preserve simplicidade no MVP.
- A preservacao append-only pode exigir cuidado de experiencia para que complementos continuem compreensiveis na linha do tempo.

## 14. Dependencias e premissas

- A validacao inicial sera feita com dados ficticios.
- Existe apenas um medico usuario no MVP.
- A agenda e manual e interna ao PsiqApp.
- O medico e responsavel pelo julgamento clinico e pela decisao final.
- Os registros clinicos escritos pelo medico sao a fonte clinica de verdade. Eles incluem pareceres originais e complementos.
- A IA e uma dependencia externa ou separada do fluxo de persistencia do prontuario e pode falhar.
- Estrategias como RAG, embeddings, busca vetorial ou sumarizacao incremental poderao ser avaliadas futuramente se houver necessidade comprovada.
- Requisitos tecnicos detalhados de autenticacao, autorizacao, criptografia, hospedagem, logs, backup, fornecedores e operacao segura serao tratados antes de qualquer uso com dados reais.
- Detalhes tecnicos adicionais de auditoria, como versao de prompt ou modelo utilizado, poderao ser definidos na TechSpec.

## 15. Perguntas em aberto

- Qual sera o limite minimo aceitavel de tempo percebido para considerar que a revisao longitudinal reduziu significativamente o esforco do medico?
- Quais instrumentos de validacao serao usados para medir utilidade percebida da analise de IA durante o MVP?
- Como o produto deve comunicar visualmente complementos sem prejudicar a leitura cronologica?
- Qual texto final de UX deve ser usado para comunicar os limites da IA, preservando os requisitos minimos ja definidos?
- Em que momento, apos a validacao com dados ficticios, o produto passara a exigir requisitos completos de seguranca e compliance para dados reais?
