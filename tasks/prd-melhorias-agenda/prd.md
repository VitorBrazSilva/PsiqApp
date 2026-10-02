# PRD — Busca de horários e organização da Agenda

## 1. Visão geral

Esta feature melhora o agendamento de consultas e a consulta da Agenda no PsiqApp. O médico poderá navegar por um calendário mensal para encontrar horários livres antes de escolher uma data e hora. As listas da Agenda geral e da agenda dentro do prontuário do paciente também terão filtros por período e por situação da consulta, com contagens visíveis.

O cadastro da consulta segue o mesmo fluxo de busca, seleção e confirmação de horários na Agenda geral e dentro do prontuário. A única diferença é a identificação do paciente: fora do prontuário, o médico precisa selecionar um paciente; dentro do prontuário, o paciente aberto já está definido e não precisa ser escolhido novamente.

A busca considera consultas `AGENDADA` no PsiqApp e, quando a conexão Google está ativa, intervalos ocupados no Google Agenda. A interface segue os padrões visuais já usados no PsiqApp, usando o calendário de referência como inspiração para seleção progressiva de data, horário e confirmação.

## 2. Problema e motivação

Hoje o médico escolhe uma data e hora antes de saber se ela está livre e precisa acionar “Verificar disponibilidade”. O fluxo confirma uma opção já escolhida, mas não ajuda a descobrir quais dias e horários podem funcionar.

Além disso, o médico precisa percorrer as listas de consultas nas duas telas da Agenda para localizar registros por período ou situação. As contagens junto aos filtros ajudam a entender rapidamente quantas consultas existem em cada grupo.

## 3. Persona e contexto de uso

- **Persona:** médico, usuário único do MVP, responsável por cadastrar e acompanhar consultas.
- **Contexto:** uso da Agenda geral para acompanhar todas as consultas e uso da agenda dentro do prontuário para acompanhar as consultas de um paciente específico.
- **Agendamento:** o mesmo fluxo está disponível nos dois contextos. Fora do prontuário, a seleção do paciente é obrigatória; no prontuário, a consulta pertence ao paciente aberto.
- O MVP continua destinado exclusivamente a validação com dados fictícios.

## 4. Objetivos

- Mostrar dias com horários livres antes de o médico escolher a data e a hora da consulta.
- Permitir consultar e selecionar horários livres em qualquer dia da semana, inclusive sábados e domingos.
- Permitir localizar consultas nas duas telas da Agenda por período e situação.
- Manter as informações e operações atuais das consultas, dando destaque visual ao dia da semana e ao horário.

## 5. Métricas / critérios de sucesso

Não foi definida uma meta numérica de redução de tempo ou de uso. O sucesso será observado pela conclusão do fluxo de busca, seleção e confirmação sem precisar testar manualmente várias datas e horas, e pela capacidade de localizar consultas por período e situação nas duas telas da Agenda.

## 6. Escopo funcional

### RF-001 — Consultar dias com horários livres

**Descrição:** Na Agenda geral e no agendamento dentro do prontuário, o médico pode navegar por um calendário mensal a partir de hoje e ver quais datas têm ao menos um horário livre. A busca percorre o dia inteiro, com inícios candidatos em intervalos de 30 minutos, todos os dias da semana.

**Critérios de aceite:**

- AC-RF001-01 — Dado que o médico abre a busca, quando um mês é exibido, então todas as datas de hoje em diante, inclusive sábados e domingos, são consideradas.
- AC-RF001-02 — Uma data é identificada como disponível somente quando há pelo menos um início candidato livre para uma consulta de uma hora.
- AC-RF001-03 — Os inícios candidatos são considerados em intervalos de 30 minutos durante todo o dia. Para hoje, horários anteriores ao momento atual não são oferecidos.
- AC-RF001-04 — A disponibilidade local considera conflitos com consultas `AGENDADA` do PsiqApp. Consultas `REALIZADA`, `CANCELADA` e `FALTA` não bloqueiam o horário.
- AC-RF001-05 — Quando há conexão Google ativa, períodos ocupados do calendário conectado também bloqueiam horários. Eventos do Google continuam sendo tratados apenas como intervalos ocupados, sem aparecer como consultas do PsiqApp.
- AC-RF001-06 — Sem conexão Google ativa, a busca considera a agenda local. Se a verificação Google falhar enquanto a conexão estiver ativa, o sistema informa uma falha de disponibilidade distinta de “nenhum horário livre” e não apresenta horários como confirmados.
- AC-RF001-07 — A busca mensal de horários está disponível tanto na Agenda geral quanto no agendamento dentro do prontuário e aplica as mesmas regras de disponibilidade nos dois contextos.

### RF-002 — Exibir e selecionar horários disponíveis

**Descrição:** Ao escolher uma data disponível, o médico vê e seleciona os horários livres daquele dia, seguindo o mesmo fluxo na Agenda geral e no agendamento dentro do prontuário.

**Critérios de aceite:**

- AC-RF002-01 — Ao selecionar uma data disponível, o sistema exibe somente os horários livres dessa data, em ordem cronológica e agrupados por período do dia.
- AC-RF002-02 — O médico pode selecionar um horário e visualizar a data, o dia da semana e a hora escolhidos antes de confirmar o agendamento.
- AC-RF002-03 — Se uma data não tiver horários livres, ela não é apresentada como disponível. Se não houver datas disponíveis no mês consultado, a interface informa que não foram encontrados horários.
- AC-RF002-04 — A exibição, a seleção e a revisão dos horários seguem o mesmo fluxo na Agenda geral e no agendamento dentro do prontuário.

### RF-003 — Confirmar uma consulta a partir de um horário encontrado

**Descrição:** O horário exibido pela busca serve como verificação de disponibilidade para o mesmo fluxo de confirmação na Agenda geral e no agendamento dentro do prontuário. O médico não precisa repetir uma ação separada de “Verificar disponibilidade”. Fora do prontuário, o paciente deve ser selecionado pelo médico; dentro do prontuário, a confirmação usa o paciente aberto, sem solicitar uma nova escolha.

**Critérios de aceite:**

- AC-RF003-01 — Ao confirmar um horário selecionado, o sistema cria a consulta com o paciente selecionado fora do prontuário ou com o paciente aberto no prontuário e mantém o status inicial `AGENDADA`.
- AC-RF003-02 — Se o horário deixar de estar disponível antes da confirmação, o sistema não cria a consulta e informa que o médico deve escolher outro horário.
- AC-RF003-03 — Quando a conexão Google está ativa e a verificação de disponibilidade falha, o sistema não confirma o agendamento como disponível.
- AC-RF003-04 — A consulta criada continua seguindo o fluxo atual de sincronização com Google Agenda, quando aplicável. Falha de sincronização posterior não apaga a consulta local.
- AC-RF003-05 — A busca de disponibilidade começa hoje e não oferece datas passadas. A permissão atual para cadastrar consultas retroativas permanece fora desta busca e não é alterada por esta feature.
- AC-RF003-06 — Fora do prontuário de um paciente, o médico precisa selecionar o paciente da consulta; o sistema não permite confirmar o agendamento sem essa seleção.
- AC-RF003-07 — No prontuário, o sistema usa o paciente aberto sem apresentar uma escolha de paciente; a consulta confirmada pertence a esse paciente.

### RF-004 — Filtrar consultas por situação nas duas telas da Agenda

**Descrição:** A Agenda geral e a agenda dentro do prontuário exibem filtros por grupo de consultas, acompanhados do número de registros em cada grupo.

**Critérios de aceite:**

- AC-RF004-01 — As duas telas disponibilizam os grupos “Próximas”, “Agendadas anteriores”, “Realizadas”, “Canceladas” e “Faltas”, cada um com a contagem de registros correspondente.
- AC-RF004-02 — “Próximas” inclui somente consultas `AGENDADA` com data e hora futuras.
- AC-RF004-03 — “Agendadas anteriores” inclui somente consultas `AGENDADA` cuja data e hora sejam anteriores ao momento atual.
- AC-RF004-04 — “Realizadas”, “Canceladas” e “Faltas” incluem, respectivamente, consultas `REALIZADA`, `CANCELADA` e `FALTA`.
- AC-RF004-05 — Na agenda dentro do prontuário, os registros e as contagens ficam limitados ao paciente aberto.
- AC-RF004-06 — As consultas mantêm as informações e operações disponíveis hoje em cada tela. O dia da semana e a hora recebem destaque visual com ícones, seguindo os padrões visuais do PsiqApp.

### RF-005 — Filtrar consultas por período

**Descrição:** O médico pode limitar as consultas mostradas nas listas da Agenda a um intervalo entre duas datas.

**Critérios de aceite:**

- AC-RF005-01 — O filtro aceita uma data inicial e uma data final e considera inclusivas as duas extremidades do período.
- AC-RF005-02 — Quando o filtro de período não está preenchido, as listas não restringem as consultas por data.
- AC-RF005-03 — Quando o período é aplicado, todas as abas mostram apenas registros dentro do período e atualizam suas contagens para refletir os registros exibidos.
- AC-RF005-04 — O filtro não permite aplicar um período incompleto ou cuja data inicial seja posterior à data final; a interface explica o que precisa ser corrigido.

## 7. Jornada e fluxos principais

### Fluxo 1 — Encontrar um horário e agendar

1. O médico inicia o cadastro da consulta na Agenda geral ou dentro do prontuário. Fora do prontuário, escolhe o paciente; dentro do prontuário, o sistema usa o paciente aberto sem solicitar essa escolha. As etapas seguintes são iguais nos dois contextos.
2. O médico abre o calendário de disponibilidade, que mostra o mês atual e permite navegar por outros meses a partir de hoje.
3. O sistema destaca as datas que têm ao menos um horário livre, considerando a agenda local e, quando conectada, a disponibilidade do Google Agenda.
4. O médico escolhe uma data e vê os horários livres daquele dia, agrupados por período.
5. O médico escolhe um horário e revisa a data, o dia da semana e a hora.
6. O médico confirma o agendamento. Se o horário ainda estiver livre, a consulta é criada como `AGENDADA`; se não estiver, o sistema informa o conflito e permite escolher outro horário.

### Fluxo 2 — Localizar consultas na Agenda geral

1. O médico abre a Agenda geral.
2. O médico escolhe um grupo de consultas e pode, opcionalmente, preencher um período entre duas datas.
3. A lista e as contagens refletem os filtros ativos.
4. O médico acompanha os dados e as operações atuais de cada consulta, com o dia da semana e a hora destacados.

### Fluxo 3 — Localizar consultas no prontuário

1. O médico abre o prontuário de um paciente e consulta sua agenda.
2. O médico escolhe um grupo de consultas e pode, opcionalmente, preencher um período entre duas datas.
3. A lista e as contagens refletem os filtros ativos e incluem somente consultas daquele paciente.

## 8. Regras de negócio

- O fluxo de cadastro da consulta é o mesmo na Agenda geral e dentro do prontuário, incluindo busca, seleção e confirmação de horários. A única diferença é a identificação do paciente: seleção obrigatória fora do prontuário e uso do paciente aberto dentro dele.
- Uma consulta ocupa uma hora. A disponibilidade local compara intervalos com fim exclusivo.
- Horários candidatos começam em intervalos de 30 minutos, ao longo de todo o dia e em todos os dias da semana.
- A busca de agendamento começa hoje; horários anteriores ao momento atual não são oferecidos para a data de hoje.
- Consultas `AGENDADA` do PsiqApp bloqueiam disponibilidade. Consultas em estado final (`REALIZADA`, `CANCELADA` ou `FALTA`) não bloqueiam.
- Com conexão Google ativa, intervalos ocupados do calendário conectado também bloqueiam disponibilidade. Sem conexão ativa, a busca usa somente a agenda local.
- Falha ao verificar disponibilidade no Google impede confirmar um novo agendamento e é apresentada separadamente de ausência de horários livres.
- A disponibilidade pode mudar depois da busca. A confirmação deve impedir a criação se o horário selecionado tiver ficado indisponível.
- Toda consulta criada continua iniciando como `AGENDADA`, inclusive consultas retroativas cadastradas pelo fluxo atual.
- “Próximas” contém somente consultas `AGENDADA` futuras. “Agendadas anteriores” contém consultas `AGENDADA` com data e hora passadas, preservando o acesso a consultas retroativas sem classificá-las como próximas.
- O filtro de período das listas é independente da busca mensal de disponibilidade.
- No MVP, utilizar exclusivamente dados fictícios de pacientes. Eventos existentes no Google contribuem somente com intervalos ocupados e não são exibidos como consultas.

## 9. Dados e informações envolvidas

- Data inicial e data final do filtro das listas, quando preenchido.
- Data da consulta, hora de início, status e paciente associado.
- Dia da semana, derivado da data da consulta, e horário de início para apresentação nas listas.
- Intervalos ocupados das consultas `AGENDADA` do PsiqApp.
- Intervalos ocupados do Google Agenda, somente quando houver conexão ativa.
- A busca não apresenta conteúdo ou detalhes de eventos do Google que não são consultas do PsiqApp.

## 10. Requisitos não funcionais

### RNF-001 — Privacidade de dados

**Descrição:** A feature deve respeitar as regras atuais de privacidade e o escopo do MVP.

**Critério mensurável:** Nenhuma tela, resultado da busca ou mensagem de erro apresenta conteúdo de eventos Google além da indicação de disponibilidade, nem conteúdo clínico ou dados de pacientes diferentes do contexto exibido. O MVP permanece restrito a dados fictícios.

### RNF-002 — Clareza de estados

**Descrição:** A interface deve distinguir resultados sem disponibilidade de falhas ao consultar uma fonte de disponibilidade.

**Critério mensurável:** Em caso de falha Google com conexão ativa, o médico vê um estado de falha identificável e nenhum horário é apresentado como verificado enquanto essa falha impedir a consulta de disponibilidade.

## 11. Restrições e compliance de alto nível

- A feature respeita as regras de privacidade clínica existentes e não altera o escopo de uso com dados fictícios.
- A consulta do Google continua opcional e limitada ao calendário principal já conectado.
- Eventos Google preexistentes permanecem apenas como intervalos ocupados; não são importados ou exibidos como consultas.
- Nenhum dado clínico, observação de consulta, CPF ou credencial Google é necessário para apresentar horários livres.

## 12. Fora do escopo

- Alterar a duração atual de uma consulta, que permanece em uma hora.
- Alterar os status de consulta ou suas transições atuais.
- Alterar as regras de sincronização de consultas existentes com o Google Agenda.
- Exibir eventos Google como consultas ou importar dados desses eventos.
- Definir dias úteis, horários comerciais ou pausas; a busca cobre o dia inteiro conforme solicitado.
- Alterar as informações clínicas do prontuário ou gerar conteúdo por IA.
- Remover a possibilidade atual de cadastrar consultas retroativas pelo fluxo existente.

## 13. Riscos de produto e uso

- Como a busca cobre o dia inteiro, horários noturnos também podem aparecer se estiverem livres. O médico deve conseguir identificar claramente cada horário antes de confirmar.
- A disponibilidade pode mudar enquanto o médico escolhe um horário; a confirmação deve tratar o conflito sem criar uma consulta sobreposta.
- Se a conexão Google ativa estiver indisponível, o sistema deve evitar sugerir que um horário foi validado apenas contra a agenda local.
- Consultas retroativas com status `AGENDADA` não pertencem à aba “Próximas”; a aba “Agendadas anteriores” mantém esses registros acessíveis nas listas.

## 14. Dependências e premissas

- A duração de uma consulta permanece de uma hora, conforme a regra atual do produto.
- A busca de disponibilidade examina todas as datas de hoje em diante, incluindo sábados e domingos, com horários de início a cada 30 minutos durante o dia inteiro.
- O período da busca de consultas nas listas usa uma data inicial e uma data final; sem período preenchido, não há restrição por data.
- A Agenda geral e a agenda dentro do prontuário recebem os filtros por período e situação, além das contagens.
- Conforme decisão do usuário, RF-001, RF-002 e RF-003 se aplicam ao agendamento na Agenda geral e dentro do prontuário, com o mesmo fluxo. Fora do prontuário é necessário selecionar o paciente; dentro dele, o paciente aberto já está definido.
- Foi incluída a aba “Agendadas anteriores”, conforme decisão do usuário, para manter acessíveis consultas retroativas que continuam `AGENDADA`, separadas das consultas futuras.
- As informações atuais de consulta em cada tela e as ações atuais permanecem disponíveis; a apresentação destaca dia da semana e hora com ícones, sem adicionar dados de profissional ou local que não fazem parte do contexto atual.
- As consultas de disponibilidade e os estados de conexão/sincronização atuais permanecem fontes do comportamento observado pelo médico.

## 15. Perguntas em aberto

Nenhuma pergunta de produto bloqueia esta versão do PRD.
