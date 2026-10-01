# PRD — Integração com Google Agenda

## 1. Visão geral

Permitir que o médico conecte sua conta Google ao PsiqApp para consultar indisponibilidades do calendário principal e manter eventos correspondentes às consultas criadas no PsiqApp. O PsiqApp continua sendo a fonte de verdade para os dados e o status das consultas.

## 2. Problema e motivação

O médico mantém compromissos em dois lugares: a agenda do PsiqApp e o Google Agenda. A falta de sincronização pode levar a trabalho duplicado, horários ocupados sem indicação e consultas que não aparecem no calendário usado no dia a dia.

A integração deve mostrar indisponibilidades antes do agendamento, reduzir conflitos e refletir no Google as consultas e mudanças de status registradas no PsiqApp.

## 3. Persona e contexto de uso

- **Persona:** médico que usa o PsiqApp para organizar pacientes e consultas e conecta sua própria conta Google.
- **Contexto:** ao consultar horários disponíveis ou criar uma consulta, o médico precisa considerar consultas já marcadas no PsiqApp e eventos ocupados existentes no calendário principal do Google.
- **Ambiente:** a funcionalidade atende ao médico usuário do PsiqApp. A conexão Google é opcional até ser estabelecida; quando estabelecida, a verificação de disponibilidade Google é necessária para novos agendamentos.

## 4. Objetivos

- Evitar novos agendamentos em horários ocupados no PsiqApp ou no Google Agenda.
- Refletir no calendário principal do Google as consultas criadas no PsiqApp e as mudanças de status.
- Preservar a consulta no PsiqApp e tornar visível qualquer falha ao sincronizar o evento Google.
- Limitar os dados pessoais enviados ao Google ao necessário para identificar a consulta.

## 5. Métricas / critérios de sucesso

Não foram definidas metas quantitativas de produto. O sucesso desta feature será verificado pelo cumprimento dos critérios de aceite: conexão e estado visíveis, horários ocupados bloqueados, falha inesperada numa conexão ativa comunicada sem permitir novo agendamento, agenda local funcional quando a conta não está conectada por escolha do médico, eventos criados/atualizados ou sinalizados como pendentes e ausência de importação de eventos Google para a agenda do PsiqApp.

## 6. Escopo funcional

### RF-001 — Conectar e desconectar conta Google

**Descrição:** O médico pode autorizar e encerrar voluntariamente a conexão do PsiqApp com sua conta Google. O PsiqApp usa o calendário principal da conta conectada e apresenta o estado atual da conexão. Sem uma conexão ativa por escolha do médico, a agenda do PsiqApp continua funcionando de forma independente; uma falha inesperada ou revogação de uma conexão ainda ativa é tratada como integração indisponível.

**Critérios de aceite:**
- AC-RF001-01 — Dado que o médico não conectou uma conta Google, quando inicia a conexão e conclui a autorização, então o PsiqApp informa que a conta está conectada.
- AC-RF001-02 — Dada uma conta conectada, quando o médico usa a ação de desconectar, então o PsiqApp encerra a conexão, informa que a agenda passará a funcionar somente com os dados do PsiqApp e permite continuar criando consultas sem verificação Google, mantendo eventuais sincronizações pendentes até uma nova conexão.
- AC-RF001-03 — Dada uma conexão encerrada voluntariamente, quando o médico consulta o estado da integração, então a interface apresenta o estado desconectado e uma ação para conectar novamente.
- AC-RF001-04 — Dada uma conta conectada, quando a autorização é revogada ou a conexão falha sem ação voluntária do médico, então o PsiqApp apresenta a integração como indisponível e informa que não pode consultar a agenda Google.
- AC-RF001-05 — Dada uma conexão indisponível, quando o médico consulta o estado da integração, então a interface apresenta um estado compreensível e uma ação para restabelecer a conta.
- AC-RF001-06 — Dada uma conexão encerrada voluntariamente, quando existem eventos Google criados anteriormente pelo PsiqApp, então a desconexão não os remove do Google e informa que eles permanecerão lá sem novas atualizações do PsiqApp.

### RF-002 — Consultar disponibilidade e prevenir conflitos

**Descrição:** Ao apresentar horários para novo agendamento, o sistema considera consultas `AGENDADA` do PsiqApp e eventos ocupados no calendário principal Google conectado. Cada consulta do PsiqApp ocupa exatamente uma hora.

**Critérios de aceite:**
- AC-RF002-01 — Dado um período consultado, quando há uma consulta `AGENDADA` do PsiqApp que se sobrepõe ao horário, então esse horário é indicado como ocupado e não pode ser selecionado para nova consulta.
- AC-RF002-02 — Dado um período consultado, quando o Google informa um evento ocupado que se sobrepõe ao horário, então esse horário é indicado como ocupado e não pode ser selecionado para nova consulta.
- AC-RF002-03 — Dado um horário que não se sobrepõe a consulta `AGENDADA` do PsiqApp nem, quando houver conexão Google ativa, a evento ocupado do Google, quando o médico o seleciona, então o sistema pode prosseguir com a tentativa de agendamento.
- AC-RF002-04 — Dada uma conexão Google ativa, quando não for possível consultar sua disponibilidade por falha ou revogação inesperada, então o PsiqApp não apresenta horários como disponíveis e impede novo agendamento até conseguir verificar a agenda. Esse bloqueio não se aplica quando o médico nunca conectou ou desconectou voluntariamente a conta; nesses casos, vale somente a disponibilidade interna do PsiqApp.
- AC-RF002-05 — Quando a verificação Google encontra horário ocupado, o sistema informa conflito de horário. Quando a verificação falha por indisponibilidade ou autorização, o sistema informa que não foi possível verificar a agenda; não apresenta a falha como conflito.
- AC-RF002-06 — A indicação de ocupação e o resultado da verificação respeitam a data, hora e o fuso `America/Sao_Paulo`, já usado para exibição de datas na interface do PsiqApp.

### RF-003 — Criar evento Google para consulta do PsiqApp

**Descrição:** Ao criar uma consulta no PsiqApp, o sistema persiste a consulta. Se houver conexão Google ativa, solicita a criação de um evento correspondente no calendário principal Google. Sem conexão ativa, inclusive antes da primeira conexão ou depois de uma desconexão voluntária, a consulta funciona na agenda do PsiqApp e a sincronização fica pendente para quando uma conexão for estabelecida ou restabelecida. O evento contém nome completo do paciente, e-mail, data e horário da consulta. Não inclui CPF nem conteúdo clínico.

**Critérios de aceite:**
- AC-RF003-01 — Dada uma consulta criada com sucesso no PsiqApp e uma conexão Google disponível, quando a sincronização é concluída, então existe um evento correspondente no calendário principal Google com nome completo, e-mail, data e horário corretos.
- AC-RF003-02 — Dada uma consulta persistida no PsiqApp, quando a criação ou atualização do evento Google falha, então a consulta permanece disponível no PsiqApp e seu estado de sincronização indica pendência ou falha.
- AC-RF003-03 — Dado um evento pendente de sincronização, quando a integração volta a estar disponível e uma nova tentativa é concluída, então o estado passa a indicar sincronização concluída.
- AC-RF003-04 — Dado que a sincronização ainda não foi concluída, quando o médico consulta a agenda ou o estado da integração, então a interface indica claramente que o evento Google correspondente ainda não foi salvo ou atualizado.
- AC-RF003-05 — Dada uma consulta criada sem conexão Google ativa, quando a consulta é salva, então ela permanece disponível na agenda do PsiqApp e sua sincronização Google fica pendente, sem impedir a criação.
- AC-RF003-06 — Dadas consultas com sincronização pendente antes de uma conexão Google ser estabelecida ou restabelecida, quando a sincronização é concluída, então os eventos passam a refletir o estado atual dessas consultas no PsiqApp.

### RF-004 — Refletir mudanças de status

**Descrição:** Mudanças de status de uma consulta no PsiqApp devem ser refletidas no evento Google correspondente. Para consultas `REALIZADA` ou `FALTA`, o evento permanece no calendário e permite identificar o status final. Para consultas `CANCELADA`, o evento pode ser atualizado ou removido conforme a decisão técnica documentada na TechSpec, desde que o resultado não represente a consulta como ativa. Mudanças feitas sem conexão Google ativa ficam pendentes e são sincronizadas quando uma conexão for estabelecida ou restabelecida.

**Critérios de aceite:**
- AC-RF004-01 — Dada uma consulta com evento Google sincronizado, quando o status da consulta muda no PsiqApp, então a sincronização do evento correspondente é solicitada e seu estado fica visível.
- AC-RF004-02 — Dada uma consulta cancelada, quando a sincronização é concluída, então o evento correspondente foi removido ou marcado de modo que não apareça como uma consulta ativa.
- AC-RF004-03 — Dada uma falha ao refletir uma mudança de status, quando o médico consulta a integração, então a falha ou pendência é indicada e a mudança de status já salva no PsiqApp permanece preservada.
- AC-RF004-04 — Dada uma consulta com status `REALIZADA` ou `FALTA` e conexão Google disponível, quando a sincronização é concluída, então o evento correspondente continua no calendário e permite identificar qual desses status finais foi registrado no PsiqApp.
- AC-RF004-05 — Dada uma mudança de status feita sem conexão Google ativa, quando uma conexão é estabelecida ou restabelecida e a sincronização é concluída, então o evento correspondente passa a refletir o status atual da consulta no PsiqApp.

### RF-005 — Manter eventos Google fora da agenda de consultas

**Descrição:** Eventos que já existem no Google são usados somente para calcular indisponibilidade. Eles não são importados nem apresentados como consultas do PsiqApp.

**Critérios de aceite:**
- AC-RF005-01 — Dado um evento existente no Google, quando o médico consulta a agenda do PsiqApp, então esse evento não aparece como consulta do PsiqApp.
- AC-RF005-02 — Dado um evento Google ocupado, quando o médico consulta horários disponíveis, então o sistema usa a ocupação para bloquear sobreposições sem importar o evento ou seus detalhes como consulta.

### RF-006 — Preservar data e horário da consulta

**Descrição:** Nesta etapa, a consulta criada não pode ter sua data ou horário alterados. A sincronização reflete apenas criação e mudanças de status.

**Critérios de aceite:**
- AC-RF006-01 — Dada uma consulta existente, quando o médico consulta suas ações disponíveis, então não existe ação para alterar sua data ou horário.
- AC-RF006-02 — Quando um status da consulta é sincronizado com o Google, então a data e o horário do evento permanecem iguais aos da consulta no PsiqApp.

## 7. Jornada e fluxos principais

1. O médico conecta sua conta Google e verifica o estado da conexão.
2. O médico consulta a agenda para escolher data e horário. O PsiqApp indica ocupações de consultas `AGENDADA` internas e eventos ocupados no Google.
3. Se o Google não puder responder à consulta de disponibilidade, o PsiqApp não apresenta horários livres e não permite criar uma nova consulta; informa que a verificação está indisponível.
4. Se o horário estiver livre, o médico cria a consulta no PsiqApp. A consulta é salva no PsiqApp e um evento correspondente é criado no calendário Google.
5. Se a sincronização Google falhar depois de a consulta ter sido salva, o PsiqApp conserva a consulta, mostra a pendência/falha e permite que a sincronização seja tentada novamente. Quando o serviço retornar, a nova tentativa pode concluir a sincronização.
6. Quando o médico muda o status da consulta, o evento Google correspondente é atualizado ou removido conforme a regra de cancelamento definida para a integração.

## 8. Regras de negócio

- O calendário usado é o calendário principal da conta Google conectada pelo médico.
- Toda consulta do PsiqApp ocupa exatamente uma hora.
- A disponibilidade de um horário depende da ausência de sobreposição com consultas `AGENDADA` no PsiqApp e, enquanto houver conexão Google ativa, eventos ocupados no Google.
- Antes da primeira conexão ou depois de uma desconexão voluntária, novos agendamentos consideram somente consultas do PsiqApp e a agenda local continua funcionando.
- A verificação de conflitos Google é obrigatória para novos agendamentos enquanto a conta estiver conectada. Se uma conexão ativa ficar indisponível por falha ou revogação inesperada, o sistema não pode tratar o horário como livre e bloqueia novos agendamentos até a verificação voltar.
- Conflito conhecido e falha ao consultar Google são estados distintos e devem ter mensagens distintas.
- Eventos Google já existentes servem apenas como sinal de indisponibilidade; não se tornam consultas do PsiqApp.
- A criação da consulta no PsiqApp não depende do sucesso da criação do evento Google. Falha externa não apaga a consulta salva.
- A data e o horário da consulta não são alteráveis nesta feature; somente o status é sincronizado após a criação.
- Consultas já salvas no PsiqApp continuam visíveis em qualquer estado da integração. Se uma conexão ativa ficar indisponível inesperadamente, a tela de escolha de horários não apresenta disponibilidade e novos agendamentos ficam bloqueados. Se a conta nunca foi conectada ou foi desconectada voluntariamente, a tela usa apenas a agenda do PsiqApp e permite novos agendamentos.
- Desconectar voluntariamente encerra as consultas e atualizações futuras ao Google, mas não remove eventos já criados no calendário Google; esses eventos permanecem como estavam até que o médico os altere diretamente no Google.
- O estado de sincronização precisa distinguir pelo menos sincronizado, pendente/falha, desconectado voluntariamente e integração indisponível por falha inesperada.

## 9. Dados e informações envolvidas

O evento Google correspondente contém:

- nome completo do paciente;
- e-mail do paciente;
- data e hora de início e término da consulta, considerando a duração de uma hora e o fuso horário aplicável.

O evento não contém CPF, observações da consulta, registros do prontuário, diagnóstico, medicações ou outros dados clínicos. O PsiqApp mantém a associação entre consulta e evento necessária para refletir atualizações de status. Durante períodos de desconexão voluntária, criação e mudanças de status ficam pendentes; quando a conexão é restabelecida, a sincronização usa o estado atual da consulta no PsiqApp.

Para verificar disponibilidade, o PsiqApp necessita saber os intervalos de eventos Google marcados como ocupados; os detalhes desses eventos não são importados para a agenda do produto.

## 10. Requisitos não funcionais

### RNF-001 — Proteção da autorização Google

**Descrição:** A autorização da conta Google deve ser tratada de modo a impedir acesso não autorizado e exposição de credenciais ou tokens.

**Critério mensurável:** Credenciais e tokens não aparecem em respostas da API, interface ou logs. Tokens persistidos não podem ser armazenados em texto puro.

### RNF-002 — Minimização e privacidade dos dados

**Descrição:** O tratamento de dados enviados ao Google deve limitar-se ao necessário para identificar e sincronizar o evento da consulta.

**Critério mensurável:** O payload do evento contém nome completo, e-mail e data/horário; não contém CPF ou campos clínicos. Logs não contêm credenciais, tokens nem dados clínicos desnecessários.

### RNF-003 — Clareza dos estados de integração

**Descrição:** A interface deve distinguir sucesso, pendência/falha de sincronização, desconexão voluntária, perda/revogação inesperada de autorização e impossibilidade de consultar disponibilidade.

**Critério mensurável:** Para cada estado listado, a interface exibe uma mensagem específica e uma ação compatível quando houver ação disponível, sem reportar falha técnica como conflito de horário. A desconexão voluntária informa que a agenda interna continua funcionando; uma falha inesperada em conexão ativa informa que novos agendamentos aguardam a verificação Google.

## 11. Restrições e compliance de alto nível

- Nome e e-mail são dados pessoais. Como o contexto do evento pode revelar que a pessoa realiza consulta psiquiátrica, a integração deve tratar a informação com proteção compatível com dados referentes à saúde, classificados como sensíveis pela LGPD.
- Durante esta etapa do MVP, a integração deve ser usada exclusivamente com dados fictícios de pacientes, conforme a Rule `clinical-data-privacy.md`. A conexão com uma conta Google não autoriza inserir ou enviar dados reais de pacientes.
- A LGPD define o princípio da necessidade como limitação do tratamento ao mínimo necessário e proporcional à finalidade. CPF fica fora do evento nesta feature, pois nome completo e e-mail já foram definidos como identificadores do evento. A definição da base legal, transparência ao titular e condições contratuais do serviço externo deve ser validada antes de uso real.
- O uso de dados reais só pode ser permitido após decisão explícita e documentação atualizada sobre LGPD, autenticação, autorização, criptografia, hospedagem, backup, retenção, auditoria, gestão de secrets, logs e fornecedores externos, conforme a Rule `clinical-data-privacy.md`.
- Nenhuma credencial ou token Google pode ser exposto em logs, interface ou mensagens de erro.
- Referência: [Lei nº 13.709/2018 — LGPD, artigos 5º e 6º](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).

## 12. Fora do escopo

- Importar eventos do Google como consultas do PsiqApp.
- Exibir detalhes de eventos existentes no Google na agenda do PsiqApp.
- Alterar data ou horário de consulta depois da criação.
- Sincronizar consultas criadas fora do PsiqApp para dentro do produto.
- Enviar CPF, observações, prontuário ou outros dados clínicos ao Google.
- Sincronizar calendários Google diferentes do calendário principal conectado.

## 13. Riscos de produto e uso

- Indisponibilidade, revogação de acesso ou atraso do Google pode impedir consulta de disponibilidade ou atrasar a criação/atualização de eventos.
- A tentativa posterior de sincronização pode deixar, temporariamente, a agenda Google diferente do estado salvo no PsiqApp; a indicação visível de pendência reduz o risco de o médico presumir sincronização concluída.
- Acesso compartilhado ao calendário Google pode expor nome, e-mail e horário dos pacientes a pessoas com permissão de visualizar detalhes. O médico precisa considerar as permissões de compartilhamento de seu calendário.
- Uma resposta de indisponibilidade não comprova conflito; tratar os estados separadamente evita mensagens enganosas.
- Uma alteração de status não refletida no Google pode deixar um evento desatualizado até a sincronização ser concluída.

## 14. Dependências e premissas

- O médico tem uma conta Google e pode autorizar o PsiqApp a consultar disponibilidade e gerenciar os eventos correspondentes às consultas criadas pelo produto.
- O médico usa o calendário principal da conta conectada.
- O PsiqApp é a fonte de verdade para existência, data, horário e status da consulta.
- As consultas têm duração fixa de uma hora.
- O fuso horário `America/Sao_Paulo`, já usado para exibição de datas na interface do PsiqApp, deve ser consistente entre exibição, verificação de disponibilidade e evento Google.
- A estratégia técnica de persistência da relação consulta/evento, processamento de novas tentativas, tratamento da remoção/atualização de cancelamentos e configuração OAuth será definida na TechSpec.
- Antes da primeira conexão e depois de uma desconexão voluntária, a agenda local permite novos agendamentos somente com as verificações internas. O bloqueio por falha Google aplica-se apenas enquanto uma conexão ativa fica indisponível inesperadamente; consultas já salvas permanecem visíveis no PsiqApp.
- Ao estabelecer ou restabelecer uma conexão, o PsiqApp tenta sincronizar consultas e estados que ficaram pendentes, usando o estado atual de cada consulta.

## 15. Perguntas em aberto

- Não há perguntas de produto impeditivas para iniciar a TechSpec.
- Metas quantitativas de sucesso não foram definidas; os critérios de aceite deste PRD são a referência verificável para esta feature.
