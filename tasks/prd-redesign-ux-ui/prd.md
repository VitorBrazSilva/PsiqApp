# PRD — Redesign de UX/UI do PsiqApp — Foco clínico

## 1. Visão geral

Reorganizar a experiência do PsiqApp existente para tornar a leitura clínica, o registro de atendimentos e a conferência das análises de IA mais claros, confortáveis e previsíveis. A direção visual é **A — Foco clínico**, escolhida pelo usuário e revisada em 23/09/2026. O redesign preserva os dados, as capacidades e as regras de negócio do MVP.

O trabalho cobre Pacientes, Agenda e Prontuário, incluindo cadastro, pareceres, complementos, consultas, análise atual, evidências, histórico de análises e estados de operação. O produto continua destinado a um único médico e à validação local exclusivamente com dados fictícios.

**Exigência de completude reforçada pelo usuário:** todas as funcionalidades atuais das telas, todos os endpoints existentes e todos os dados devem ser preservados. Nenhuma capacidade ou informação pode ser omitida por simplificação do protótipo, prioridade visual, tamanho de tela ou conveniência de implementação. RF-019 torna essa exigência um critério obrigatório de aceite, apoiado pelos inventários de dados da seção 9 e de capacidades/endpoints da seção 14.

O escopo é a experiência do frontend. **Exceção confirmada pelo usuário nesta descoberta:** permitir somente o ajuste mínimo de contrato necessário para localizar e abrir uma análise a partir de sua geração histórica, sem mudança de banco, regras clínicas ou estrutura do conteúdo de IA. A lacuna existente e seus limites estão registrados na seção 14.

Este documento está preparado para revisão pelo `spec-reviewer`; não representa aprovação do PRD, conclusão do redesign ou aprovação dos gates do MVP. A inspeção do repositório nesta descoberta confirmou que a proposta visual permanece em `docs/redesign/` e ainda não foi aplicada ao frontend funcional.

## 2. Problema e motivação

O usuário considera a experiência e a qualidade visual atuais insuficientes. A interface funcional distribui dados cadastrais, consultas, formulários, histórico clínico e IA em uma sequência que dificulta priorizar a leitura. O cadastro ocupa espaço mesmo durante a busca; os estados de IA e de geração expõem termos técnicos; o vínculo entre uma observação, suas citações e a fonte completa precisa de uma navegação mais clara.

O [diagnóstico inicial](../../docs/redesign/diagnostico.md) documenta esses problemas como hipóteses fundamentadas na interface e no código, sem observação formal de uso por um médico ou medição de tempo de tarefa. Sua referência a cadastro ainda ausente no protótipo foi superada pela revisão de 23/09/2026.

A exploração visual está encerrada: a direção A foi escolhida e revisada para incluir cadastro e várias observações por seção de IA, cada uma com evidências próprias. O problema agora é transportar essa experiência para os fluxos reais, incluindo estados, volumes e falhas que o estudo não demonstra integralmente.

## 3. Persona e contexto de uso

**Persona:** médico psiquiatra, usuário único do MVP, responsável pelo registro e pela decisão clínica. Precisa localizar pacientes, preparar consultas, escrever pareceres e revisar fontes sem depender de conhecimento técnico da aplicação.

**Momentos principais:** preparação antes do atendimento, registro do atendimento e revisão do acompanhamento longitudinal.

**Dispositivos confirmados:** desktop é prioritário para trabalho prolongado. Todos os fluxos deste PRD também serão avaliados nas larguras de 375, 768, 1024 e 1440 px, preservando conteúdo e ações. Essas larguras são referências de aceite, não uma declaração de suporte a todos os navegadores e dispositivos existentes.

**Contexto de validação:** aplicação local com pacientes e conteúdo fictícios; a aparência profissional não deve sugerir prontidão para prontuários reais. Não há novos perfis de usuário, autenticação ou operação remota neste escopo.

## 4. Objetivos

- Aplicar a direção A ao produto funcional, preservando sua hierarquia, sobriedade, legibilidade e distinção entre registro médico e conteúdo derivado de IA.
- Tornar explícitos o paciente em atendimento, a localização na aplicação e os caminhos de retorno.
- Priorizar busca e leitura; abrir formulários por ação intencional e preservar o preenchimento durante interrupções previstas.
- Permitir conferir cada observação da IA até suas evidências e fontes completas, inclusive em análises históricas.
- Manter os fluxos clínicos utilizáveis durante processamento, falha ou indisponibilidade da IA.
- Preservar capacidades reais que o protótipo apenas simula ou omite, incluindo associação opcional de parecer a consulta e acesso a conjuntos maiores de dados.
- Demonstrar cobertura integral das funcionalidades, endpoints e dados existentes, com destino e evidência para cada item inventariado; omissões impedem o aceite do redesign.

## 5. Métricas / critérios de sucesso

| Critério | Evidência esperada na avaliação da entrega |
|---|---|
| Fluxos completos | Execução dos critérios de aceite de Pacientes, Prontuário, IA e Agenda com dados fictícios e integração real do aplicativo. |
| Paridade integral | Cada funcionalidade, endpoint e campo dos inventários possui destino na experiência ou função de suporte preservada, requisito e evidência correspondente; nenhum item fica sem cobertura. RF-019. |
| Segurança da experiência | Nenhuma mistura entre pacientes, perda de registro salvo, alteração de original, substituição indevida de análise ou falso sucesso nos cenários especificados. |
| Fidelidade visual | Comparação da implementação com a direção A e suas referências locais nas larguras confirmadas, incluindo formulários, análise, fontes e estados ausentes no estudo. |
| Rastreabilidade da IA | Conferência de múltiplas observações, seus conjuntos distintos de evidências, campos de origem e versões históricas corretas. |
| Continuidade e acessibilidade | Execução por teclado, recuperação dos rascunhos previstos, correção de erros e acesso ao conteúdo e às ações nas quatro larguras de aceite. |
| Volume | Registro do comportamento observado nos volumes já previstos no MVP: aproximadamente 100–500 pacientes, 20–100 registros por paciente e casos com 200 ou mais registros. São cenários de validação, não limites de cadastro. |
| Usabilidade percebida | Após orientação inicial, observar se o médico consegue localizar paciente, abrir prontuário, registrar parecer e consultar análise/evidências sem auxílio técnico direto; registrar dificuldades encontradas. |

Tempo de tarefa, esforço de releitura e percepção de clareza podem ser observados na avaliação com dados fictícios. Não há metas numéricas de melhoria, latência ou satisfação aprovadas, nem resultados já medidos que este PRD possa declarar. A aprovação do protótipo comprova a escolha visual; a validação funcional e visual da entrega continua necessária.

## 6. Escopo funcional

Os IDs abaixo pertencem a este PRD. Referências a IDs do MVP são qualificadas na seção 14 para evitar confusão entre documentos.

### RF-001 — Navegação e contexto do paciente

**Descrição:**
Orientar o médico entre Pacientes, Agenda e Prontuário, com identificação inequívoca do paciente antes das ações clínicas. No desktop, seguir a navegação lateral da direção A. O prontuário terá as seções Histórico clínico, Análise de IA, Consultas e Dados pessoais.

**Critérios de aceite:**

- AC-RF001-01 — Ao navegar entre Pacientes e Agenda, a localização atual fica identificável e ambas permanecem acessíveis; o acesso ao prontuário identifica o paciente selecionado.
- AC-RF001-02 — Ao abrir qualquer seção do prontuário ou formulário clínico, o nome e o contexto correspondem ao paciente da operação. Pacientes de mesmo nome devem poder ser distinguidos por dados cadastrais disponíveis, preservando o CPF mascarado.
- AC-RF001-03 — “Novo parecer” é a ação principal do prontuário e “Agendar consulta” é secundária. Os formulários são abertos por intenção explícita, sem ocupar permanentemente a área principal de leitura.
- AC-RF001-04 — Voltar/avançar do navegador restabelece a tela, o paciente e a seção correspondentes à localização navegada; retornar à lista preserva a busca durante a navegação na mesma aba.
- AC-RF001-05 — Ao entrar sem paciente selecionado, com localização inválida ou com paciente indisponível, a interface explica a situação e oferece retorno a Pacientes, sem substituir silenciosamente pelo prontuário de outra pessoa.

### RF-002 — Listagem e busca de pacientes

**Descrição:**
Priorizar a localização de pacientes, com busca por nome, resultados identificáveis e acesso ao cadastro pelo cabeçalho da página.

**Critérios de aceite:**

- AC-RF002-01 — Com busca vazia, a listagem de pacientes cadastrados fica acessível; ao buscar parte do nome, os resultados respeitam a busca existente sem distinção de acentos ou maiúsculas/minúsculas.
- AC-RF002-02 — Quando não houver correspondências, a interface distingue “nenhum resultado” de falha de carregamento e permite alterar a busca ou iniciar cadastro.
- AC-RF002-03 — Ao selecionar um resultado, abre-se o prontuário daquele paciente; nome e demais informações apresentadas não são substituídos por dados da demonstração.
- AC-RF002-04 — “Novo paciente” permanece localizável no cabeçalho, inclusive sem pacientes cadastrados ou sem resultados de busca.
- AC-RF002-05 — Se a busca mudar antes da resposta anterior, somente os resultados correspondentes à busca vigente são apresentados como atuais. Todos os resultados existentes devem poder ser alcançados, sem limite silencioso decorrente do primeiro conjunto carregado.
- AC-RF002-06 — Nome, e-mail e CPF mascarado, já disponíveis nos resultados da interface atual, permanecem consultáveis no contexto da lista para identificação do paciente. A simplificação dos cartões do protótipo não autoriza retirar essas informações.

### RF-003 — Cadastro e abertura do novo prontuário

**Descrição:**
Disponibilizar o cadastro já existente em formulário sob demanda, com validação compreensível, e abrir o novo prontuário após sucesso confirmado.

**Critérios de aceite:**

- AC-RF003-01 — Nome, CPF, nascimento, telefone e e-mail são obrigatórios; queixa inicial é opcional. Campos obrigatórios vazios ou compostos apenas por espaços, quando aplicável, impedem o cadastro.
- AC-RF003-02 — CPF inválido, com sequência repetida ou já cadastrado é rejeitado com indicação do campo; entrada com ou sem máscara respeita a mesma validação e unicidade existentes.
- AC-RF003-03 — Nascimento futuro, telefone brasileiro inválido com DDD ou e-mail de formato inválido impedem o cadastro e recebem mensagens individuais. A validação não aceita nem rejeita dados em desacordo com as regras cadastrais vigentes.
- AC-RF003-04 — Se vários campos forem inválidos, todos os erros correspondentes ficam identificáveis e associados aos respectivos campos. Os demais valores preenchidos são preservados para correção.
- AC-RF003-05 — Após confirmação do cadastro, o novo prontuário abre com sua identidade e seus dados, sem registros, consultas ou análise de outro paciente. A ausência de queixa inicial não impede esse resultado.
- AC-RF003-06 — Falha ou ausência de confirmação não produz mensagem de cadastro concluído nem prontuário ficticiamente criado. O formulário permanece recuperável conforme RF-008 e a repetição da operação segue RF-017.

### RF-004 — Dados pessoais e prontuário vazio

**Descrição:**
Apresentar os dados cadastrais e os estados iniciais sem inventar conteúdo ou confundir ausência de informação com indisponibilidade.

**Critérios de aceite:**

- AC-RF004-01 — Dados pessoais mostra nome, nascimento, telefone, e-mail, CPF mascarado e queixa inicial, quando informada, e permite consultar a data de criação do cadastro disponibilizada pelo sistema. Opcionais ausentes são identificados como não informados.
- AC-RF004-02 — Um paciente recém-cadastrado apresenta histórico clínico vazio e orientação para “Novo parecer”, ausência de análise e consultas vazias, sem amostras pré-preenchidas.
- AC-RF004-03 — Ao consultar dados pessoais, não há ação que prometa edição cadastral inexistente no MVP.
- AC-RF004-04 — Em falha de obtenção dos dados, a interface informa indisponibilidade; não apresenta a falha como se o paciente tivesse prontuário vazio.

### RF-005 — Leitura do histórico clínico

**Descrição:**
Apresentar pareceres originais e complementos com conteúdo integral, metadados compreensíveis e vínculo explícito entre complemento e original. No histórico desktop, os registros ficam à esquerda e a análise em painel diferenciado à direita, conforme a direção A.

**Critérios de aceite:**

- AC-RF005-01 — Os registros aparecem do mais recente para o mais antigo por data/hora clínica; em empate, pela data/hora de criação mais recente, preservando a ordenação estável do sistema. Um registro retroativo aparece na posição clínica correspondente.
- AC-RF005-02 — Cada registro permite ler seu tipo, texto original completo, data/hora clínica, data/hora de criação e, quando preenchidos, humor e medicações. O conteúdo não é reescrito, resumido ou descartado para caber no layout.
- AC-RF005-03 — Um complemento identifica o parecer original relacionado, que continua consultável e inalterado. A ação contextual de adicionar complemento refere-se ao original correto.
- AC-RF005-04 — Quando um parecer está associado a consulta, essa relação fica identificável; quando não está, nenhuma consulta é inferida.
- AC-RF005-05 — Textos longos, campos opcionais extensos e registros além do primeiro conjunto exibido continuam acessíveis. Ao chegar ao fim do conteúdo disponível, a interface não sugere término do histórico se ainda houver registros a consultar.
- AC-RF005-06 — Em telas menores, a composição se adapta sem esconder registros, análise ou ações; a leitura integral permanece possível sem exigir rolagem horizontal da página.
- AC-RF005-07 — Os identificadores de consulta e parecer original já apresentados pelo histórico permanecem recuperáveis junto aos vínculos contextualizados. Os demais metadados do registro, inclusive identificação e revisão, possuem caminho de consulta, sem substituir a leitura clínica por códigos técnicos.

### RF-006 — Novo parecer

**Descrição:**
Permitir registrar um parecer no contexto do paciente, com os campos e associações do contrato existente, mantendo o salvamento independente da IA.

**Critérios de aceite:**

- AC-RF006-01 — Ao acionar “Novo parecer”, o formulário identifica o paciente e apresenta texto obrigatório, humor e medicações opcionais, data/hora clínica e associação opcional a consulta.
- AC-RF006-02 — Texto vazio impede o salvamento e recebe erro associado. A ausência de humor, medicações ou consulta não impede salvar um parecer válido; medicações continuam como texto livre, sem validação farmacológica nova.
- AC-RF006-03 — A data/hora clínica atual é apresentada inicialmente e pode ser alterada para momento retroativo. A data/hora real de criação é determinada pelo sistema e não pode ser editada pelo médico.
- AC-RF006-04 — A associação opcional permite escolher somente consulta do mesmo paciente ou não associar consulta. Salvar o parecer não altera por si só o status da consulta.
- AC-RF006-05 — Após confirmação do salvamento, o parecer aparece na posição correta do histórico e o preenchimento concluído é encerrado, mesmo se a análise ainda estiver em processamento, indisponível ou falhar.
- AC-RF006-06 — A solicitação automática de análise segue o fluxo existente. A interface distingue “parecer salvo” de “análise concluída” e permite continuar o trabalho sem aguardar a IA.

### RF-007 — Complemento contextual e preservação do original

**Descrição:**
Criar complementos como novos registros, a partir do parecer original escolhido, sem edição ou exclusão do histórico já salvo.

**Critérios de aceite:**

- AC-RF007-01 — Ao acionar “Adicionar complemento”, o formulário identifica paciente, parecer original e sua data clínica. Não permite criar complemento sem original válido do mesmo paciente.
- AC-RF007-02 — O complemento exige texto, aceita humor e medicações opcionais e possui data/hora clínica própria, inicialmente atual e passível de registro retroativo.
- AC-RF007-03 — O complemento não oferece associação independente a consulta, conforme o contrato atual. Também não é apresentado como edição do original ou complemento de outro complemento.
- AC-RF007-04 — Após confirmação do salvamento, original e complemento permanecem disponíveis com conteúdo e datas próprios; não há substituição, exclusão ou reescrita do original.
- AC-RF007-05 — O complemento salvo participa das gerações futuras aplicáveis e pode ser evidência, sem aumentar a contagem de pareceres originais usada para suficiência longitudinal. Seu salvamento independe do resultado da IA.

### RF-008 — Continuidade, recuperação e descarte de rascunhos

**Descrição:**
Preservar temporariamente o cadastro em preenchimento e os rascunhos de parecer e complemento durante o uso da mesma aba. Essa recuperação não equivale a registro salvo e não se estende a recarregar, fechar ou reabrir a página.

**Critérios de aceite:**

- AC-RF008-01 — Fechar um formulário de cadastro, parecer ou complemento, inclusive por Escape, e reabri-lo na mesma aba recupera os valores preenchidos e informa que o rascunho foi mantido temporariamente.
- AC-RF008-02 — Navegar entre Pacientes, Agenda, seções do prontuário e pacientes na mesma aba preserva os rascunhos previstos. Pareceres ficam separados por paciente; complementos, por paciente e parecer original. O cadastro em andamento permanece separado dos formulários clínicos.
- AC-RF008-03 — Erros de validação, falhas de operação e atualizações da IA não apagam o preenchimento. Isso inclui dados de consulta enquanto seu formulário estiver em edição; a recuperação ao fechar/reabrir prevista neste requisito se aplica a cadastro, parecer e complemento.
- AC-RF008-04 — Ao retomar, a interface identifica o contexto e oferece continuidade ou descarte explícito. Fechar o formulário não equivale a descartar; após descarte intencional, a reabertura não recupera o conteúdo descartado.
- AC-RF008-05 — O sucesso confirmado limpa somente o rascunho da operação concluída. Falha não o limpa; o rascunho de outro paciente ou outro original não é afetado.
- AC-RF008-06 — A interface informa que os rascunhos não são salvos no prontuário e podem ser perdidos ao sair ou recarregar. Em saída/recarregamento com rascunho, apresenta aviso quando o navegador permitir, sem prometer impedir fechamento ou interrupção forçada.
- AC-RF008-07 — Recarregar ou reabrir a página não recupera esses rascunhos. Não há sincronização entre abas, recuperação entre sessões ou armazenamento persistente de rascunhos aprovado neste escopo.

### RF-009 — Análise com múltiplas observações

**Descrição:**
Apresentar a análise como conteúdo derivado de IA, com linha do tempo resumida, padrões observados, pontos de atenção e limitações. Cada observação preserva seu texto, sua natureza e suas próprias evidências.

**Critérios de aceite:**

- AC-RF009-01 — Todas as observações válidas das três listas ficam acessíveis, sem mostrar apenas a primeira nem fixar as quantidades do protótipo. Uma lista vazia é identificada como sem itens disponíveis, respeitando o modo da análise.
- AC-RF009-02 — Cada observação diferencia por texto “relato registrado” de “interpretação da IA” e oferece acesso somente às evidências vinculadas àquele item.
- AC-RF009-03 — No painel lateral, os grupos são expansíveis e exibem suas contagens; na abertura inicial, Padrões observados começa aberto. Na seção completa, os três grupos começam abertos. Recolher grupos não oculta a existência das limitações.
- AC-RF009-04 — O painel e a seção completa identificam IA como apoio à leitura e mantêm as limitações consultáveis. Uma lista de limitações não é transformada em observações que exijam evidências próprias.
- AC-RF009-05 — Na massa de referência aprovada, ficam acessíveis os oito itens e dez vínculos de evidência; uma massa com outras quantidades também é exibida integralmente. Esses números são exemplos de verificação, não limites do produto.
- AC-RF009-06 — O acesso à análise completa permanece disponível em telas pequenas e em históricos extensos, sem exigir que o usuário percorra todos os registros para encontrá-lo.

### RF-010 — Evidências, fonte completa e retorno ao contexto

**Descrição:**
Permitir conferir a sustentação de cada observação, abrir a fonte integral e retornar ao ponto correto da leitura, mantendo paciente e versão da análise.

**Critérios de aceite:**

- AC-RF010-01 — Ao abrir evidências, são apresentados a observação de origem, sua natureza e seu conjunto de citações, com campo, identificação, tipo e data do registro de origem.
- AC-RF010-02 — Duas observações com conjuntos de registros distintos ou trechos diferentes do mesmo registro preservam essas diferenças. A interface não funde as evidências no nível da seção nem atribui a um item as citações de outro.
- AC-RF010-03 — Evidências em Texto, Estado/humor e Medicações abrem o registro completo com destaque do trecho no campo correspondente, preservando o conteúdo integral do médico. O destaque não pode marcar outro trecho apenas por semelhança.
- AC-RF010-04 — Uma evidência de complemento abre o próprio complemento e identifica sua relação com o parecer original. “Fonte” não restringe a navegação a registros do tipo parecer.
- AC-RF010-05 — Voltar da fonte às evidências recupera a observação e a versão de origem; fechar a consulta devolve o foco ao acionador e mantém o contexto de leitura. Também é possível localizar a fonte no histórico clínico, mesmo quando não estava no conjunto inicialmente visível.
- AC-RF010-06 — Uma atualização da análise atual durante a conferência não troca a observação, as evidências ou a fonte que o médico está lendo por conteúdo de outra versão.
- AC-RF010-07 — Fonte indisponível, inexistente, de outro paciente ou incompatível com a evidência não é substituída silenciosamente. A interface comunica a impossibilidade de conferência, preserva o retorno e não inventa uma citação ou um destaque.

### RF-011 — Estado, suficiência e cobertura da análise

**Descrição:**
Explicar quando há análise válida, quais registros ela considera e o que ocorre durante atualização ou falha, sem bloquear o prontuário nem confundir quantidade de registros com suficiência longitudinal.

**Critérios de aceite:**

- AC-RF011-01 — Sem parecer original, a interface informa ausência de conteúdo mínimo, não oferece geração e não apresenta análise demonstrativa.
- AC-RF011-02 — Em análise cujo conjunto considerado contém um original, mesmo com complementos, o modo é apresentado como resumo/organização e a insuficiência para evolução ou tendência permanece explícita. Não há apresentação de padrões longitudinais como se houvesse vários originais.
- AC-RF011-03 — Com dois ou mais originais no conjunto considerado, pode ser apresentada análise longitudinal baseada nos registros aplicáveis, inclusive complementos. A interface não usa a quantidade atual do prontuário para reclassificar uma análise histórica de um único original.
- AC-RF011-04 — Fila, execução e espera de nova tentativa são comunicadas em linguagem compreensível como atualização em andamento. O médico pode continuar lendo, cadastrando consultas e registrando pareceres ou complementos.
- AC-RF011-05 — Durante processamento, falha, timeout ou indisponibilidade da IA, registros salvos e a análise válida anterior permanecem disponíveis, quando existente. Sem análise anterior, a interface informa a ausência de resultado válido, sem preencher a área com conteúdo inventado.
- AC-RF011-06 — A análise permite identificar sua data de geração, total de registros considerados, separação entre originais e complementos e último registro clínico considerado. Se houver registros posteriores ao conjunto analisado, informa que eles ainda não estão cobertos. Falha ao obter esses dados não autoriza afirmar cobertura completa.
- AC-RF011-07 — A análise atual segue a indicação do sistema. Uma geração antiga concluída depois não substitui uma análise baseada em conjunto clínico mais recente apenas pela ordem de chegada das respostas.
- AC-RF011-08 — Falha de carregamento da análise é distinguida de geração falha e de ausência de análise; o erro não bloqueia a leitura dos dados clínicos disponíveis nem apresenta resposta inválida da IA como resultado válido.

### RF-012 — Regeneração manual

**Descrição:**
Preservar a solicitação de nova geração quando permitida pelo sistema, com motivo compreensível quando indisponível.

**Critérios de aceite:**

- AC-RF012-01 — A ação só está disponível quando a permissão fornecida pelo sistema autoriza a regeneração; ausência de original ou geração ativa mantém a ação indisponível com motivo identificável.
- AC-RF012-02 — Ao solicitar regeneração, a interface mostra o envio em andamento e impede reenvio acidental. O aceite da solicitação não é comunicado como análise concluída.
- AC-RF012-03 — Após falha de geração, havendo original e permissão atual, o médico pode solicitar nova análise. Se a permissão mudar durante a operação, a interface apresenta o estado vigente sem presumir que a solicitação foi aceita.
- AC-RF012-04 — Gerar novamente, inclusive sobre o mesmo conjunto de registros, preserva as análises anteriores. A falha de solicitação permite recuperação sem apagar a análise válida ou os formulários em edição.

### RF-013 — Histórico completo de gerações e análises

**Descrição:**
Consultar as gerações do paciente e abrir o conteúdo de análises anteriores, preservando o conjunto de registros, observações, evidências e limitações de cada versão. Inclui a exceção mínima de contrato confirmada pelo usuário, sem redesenho do modelo clínico.

**Critérios de aceite:**

- AC-RF013-01 — O histórico apresenta gerações concluídas, em andamento e falhas com estado compreensível, data de solicitação e dados disponíveis do conjunto considerado: total de registros, originais, complementos e referência ao último registro clínico.
- AC-RF013-02 — A partir de uma geração concluída com análise válida, o médico consegue abrir essa análise sem conhecer ou digitar identificadores técnicos. Todas as versões existentes podem ser alcançadas, inclusive além do primeiro conjunto carregado.
- AC-RF013-03 — Uma análise histórica apresenta seu próprio conteúdo, modo, data, limitações e evidências. Seus registros de origem pertencem ao mesmo paciente e ao conjunto congelado daquela versão; registros posteriores não são incorporados retroativamente.
- AC-RF013-04 — A análise atual é distinguível de versões anteriores. Selecionar uma versão histórica não a torna atual; atualizações em segundo plano não retiram silenciosamente o médico da versão selecionada.
- AC-RF013-05 — As interações de RF-009 e RF-010 também funcionam em versões históricas. Retornar de uma evidência mantém a versão e a observação selecionadas, mesmo se existir análise atual mais recente.
- AC-RF013-06 — Geração falha ou ainda em andamento não oferece conteúdo inexistente como análise concluída. Falha ao abrir uma versão informa a indisponibilidade e mantém o retorno ao histórico, sem substituir seu conteúdo pelo da versão atual.
- AC-RF013-07 — A abertura das versões deve funcionar também após reabrir a aplicação, usando o histórico efetivamente preservado. Não pode depender de ter observado a geração anteriormente na mesma aba ou de dados simulados do protótipo.
- AC-RF013-08 — Além do resumo compreensível, cada geração permite consultar seus metadados disponíveis: identificação, paciente, estado, revisão do conjunto considerado, sequência da solicitação, data de solicitação, total de registros, originais, complementos, último registro clínico e modo. A tradução visual dos termos não elimina os valores originais de auditoria.

### RF-014 — Agenda global e consultas do paciente

**Descrição:**
Organizar consultas globalmente e no contexto do paciente, mantendo acesso a datas, horários, status e observações. O histórico clínico destaca a próxima consulta quando houver, conforme a proposta aprovada.

**Critérios de aceite:**

- AC-RF014-01 — A Agenda global identifica paciente, data, hora e status de cada consulta e permite acessar o prontuário correspondente. O nome do paciente não é substituído por um identificador técnico como apresentação normal da agenda.
- AC-RF014-02 — A seção Consultas do prontuário mostra somente consultas do paciente selecionado. Agendadas, realizadas, canceladas e faltas permanecem consultáveis com seus respectivos status e observações preenchidas.
- AC-RF014-03 — Ausência de consultas no contexto consultado é apresentada como estado vazio; falha ao obtê-las é apresentada como erro. Todos os resultados existentes continuam alcançáveis, sem corte silencioso pelo primeiro conjunto carregado.
- AC-RF014-04 — Quando houver próxima consulta a apresentar no histórico, seu destaque usa os dados efetivos do paciente e oferece acesso às consultas. Datas e contagens fixas da demonstração não são usadas na aplicação.
- AC-RF014-05 — Uma consulta atualizada em Agenda ou no prontuário apresenta o estado confirmado ao ser consultada em qualquer uma dessas visões; falhas de atualização não são apresentadas como mudança concluída.
- AC-RF014-06 — A consulta permite acessar todos os seus dados retornados, incluindo identificação, paciente, data/hora agendada, status, observações, data de criação e data da alteração de status, quando existente. Metadados podem ficar em detalhe contextual, mantendo caminho de acesso identificável.
- AC-RF014-07 — A consulta da agenda por período e por paciente, já suportada pelo contrato, permanece utilizável: o contexto/filtro aplicado fica explícito e pode ser alterado ou removido, preservando o acesso ao conjunto completo correspondente.

### RF-015 — Agendamento

**Descrição:**
Criar consultas por ação explícita na Agenda ou no prontuário, preservando o contrato existente e a possibilidade de agendamento retroativo.

**Critérios de aceite:**

- AC-RF015-01 — Na Agenda, o médico consegue selecionar um paciente cadastrado, inclusive fora do primeiro conjunto da listagem. No prontuário, o paciente da consulta é o paciente em contexto e fica identificado no formulário.
- AC-RF015-02 — Paciente, data e hora são obrigatórios; observações são opcionais. Entradas inválidas recebem mensagens associadas e mantêm os demais valores para correção.
- AC-RF015-03 — Uma consulta válida, futura ou retroativa, é criada como Agendada. As observações preenchidas ficam disponíveis e não entram na análise de IA.
- AC-RF015-04 — O sucesso confirmado torna a consulta acessível na Agenda e nas consultas do paciente. Em erro, o formulário preserva o preenchimento e não informa agendamento concluído.

### RF-016 — Atualização para status final da consulta

**Descrição:**
Permitir marcar consultas agendadas como Realizada, Cancelada ou Falta por ação deliberada e contextualizada, sem introduzir reversão de status final.

**Critérios de aceite:**

- AC-RF016-01 — Uma consulta Agendada oferece os três estados finais existentes. Antes da confirmação, ficam identificáveis paciente, data/hora, novo status e caráter definitivo da alteração no MVP.
- AC-RF016-02 — Após confirmação bem-sucedida, a consulta exibe o estado escolhido. Não há ação para retornar a Agendada ou trocar diretamente entre estados finais.
- AC-RF016-03 — Se o médico desistir antes de confirmar, o status permanece inalterado. Em falha ou conflito, a interface informa a situação sem apresentar como concluída uma transição não confirmada.
- AC-RF016-04 — A atualização de status não altera pareceres, complementos ou análises associados ao paciente.

### RF-017 — Estados de operação e prevenção de reenvio

**Descrição:**
Apresentar carregamento, vazio, sucesso, erro de campo, falha de operação e indisponibilidade de maneira consistente, com caminhos de recuperação e sem falsos resultados.

**Critérios de aceite:**

- AC-RF017-01 — Pacientes, dados pessoais, registros, consultas, análise, histórico de gerações e fontes distinguem carregamento, ausência de dados e falha. Uma falha não é renderizada como lista vazia confirmada.
- AC-RF017-02 — Cada operação de cadastro, salvamento, agendamento, status ou regeneração indica envio em andamento e impede ativação repetida acidental enquanto aguarda resultado.
- AC-RF017-03 — Sucesso só é apresentado após confirmação da operação correspondente. Se o resultado estiver incerto por interrupção da comunicação, a interface informa a falta de confirmação e orienta a recuperação, sem afirmar sucesso ou garantir que nada foi salvo.
- AC-RF017-04 — Repetir a mesma tentativa de criação após falha de comunicação respeita a proteção existente contra duplicidade. Reenviar não cria dois pacientes, consultas, registros ou solicitações de geração para uma única operação lógica.
- AC-RF017-05 — Erros são apresentados em linguagem do produto, associados ao campo ou à operação correspondente, sem mensagens brutas de infraestrutura, dados sensíveis ou resposta integral do provedor.
- AC-RF017-06 — Falhas recuperáveis oferecem nova tentativa adequada à operação; erros de validação permitem corrigir os campos. A recuperação não exige apagar o preenchimento ou perder a referência ao paciente.
- AC-RF017-07 — Atualizações em segundo plano não fecham formulários, não mudam foco ou posição de leitura arbitrariamente e não apagam mensagens de erro que ainda precisem ser resolvidas pelo médico.

### RF-018 — Isolamento de contexto durante navegação e requisições

**Descrição:**
Impedir mistura de pacientes e versões durante carregamentos, navegação, salvamento e conferência de evidências.

**Critérios de aceite:**

- AC-RF018-01 — Ao trocar de paciente durante uma requisição, resposta, falha ou indicação de carregamento do paciente anterior não é apresentada como pertencente ao novo prontuário.
- AC-RF018-02 — Antes, durante e após a troca, nome, registros, consultas, análise e fontes exibidos pertencem ao mesmo paciente em contexto. Não há intervalo em que a nova identidade apareça junto ao conteúdo clínico anterior.
- AC-RF018-03 — Formulários e rascunhos não migram para outro paciente ou original. Uma operação iniciada para um paciente não passa a usar o paciente selecionado posteriormente.
- AC-RF018-04 — Se uma operação do paciente anterior concluir após a navegação, seu resultado não é inserido no prontuário atualmente aberto nem elimina rascunhos de outro contexto.
- AC-RF018-05 — Ao consultar fonte ou análise histórica, o vínculo entre paciente, versão, observação e registro permanece verificável; uma referência incompatível não abre conteúdo de outro paciente.

### RF-019 — Paridade integral de funcionalidades, endpoints e dados

**Descrição:**
Preservar integralmente o produto existente ao aplicar o redesign. Toda ação, campo de entrada, informação de saída, vínculo, filtro, estado e integração já disponível deve ter cobertura explícita. O protótipo é referência visual e não pode ser utilizado como lista reduzida das capacidades a entregar.

**Critérios de aceite:**

- AC-RF019-01 — Antes da implementação e no aceite final, o inventário é reconciliado com todas as telas, serviços consumidores, contratos e endpoints vigentes. Cada item possui referência de origem, destino na experiência ou função operacional preservada, RF/AC correspondente e evidência; nenhum item pode ficar sem mapeamento.
- AC-RF019-02 — Todas as operações de produto listadas na seção 14 possuem fluxo utilizável com a integração real, incluindo operações menos visíveis no frontend atual, como análise histórica, associação de parecer à consulta, filtros da agenda e acesso a páginas seguintes. Endpoints existentes não são removidos, abandonados ou substituídos por mocks permanentes.
- AC-RF019-03 — Todos os campos de entrada e dados de produto retornados nos contratos da seção 9 são preservados. Campos clínicos, cadastrais, vínculos e metadados de auditoria permanecem consultáveis; sua reorganização em seção ou detalhe contextual deve manter um caminho identificável e verificável. Campos técnicos de transporte e proteção mantêm sua função, conforme o inventário, sem exposição indevida de dados sensíveis.
- AC-RF019-04 — A mesma operação com a mesma massa fictícia permite recuperar todos os dados e vínculos antes e depois do redesign. Nenhum registro, campo opcional preenchido, observação, evidência, limitação ou versão histórica desaparece, é resumido em substituição ao original ou tem seu significado alterado.
- AC-RF019-05 — A matriz de paridade cobre também estados de carregamento, vazio, erro, indisponibilidade, envio, sucesso e ações condicionais. Todos os fluxos e dados continuam alcançáveis nas quatro larguras de aceite, sem exclusões silenciosas para celular.
- AC-RF019-06 — Os endpoints de saúde, prontidão e documentação existentes continuam disponíveis em suas funções operacionais. O redesign não reduz sua disponibilidade ou os dados de contrato que documentam e não cria uma interface administrativa nova por esse motivo.
- AC-RF019-07 — Uma funcionalidade, endpoint ou dado sem cobertura é uma lacuna bloqueadora da entrega, mesmo que o protótipo não o demonstre ou que testes dos demais fluxos passem. Qualquer exclusão requer decisão explícita posterior do usuário e atualização deste PRD antes de ser tratada como mudança aceita de escopo.
- AC-RF019-08 — A cobertura integral preserva as restrições vigentes: CPF continua mascarado na visualização, mensagens sensíveis continuam protegidas e ações proibidas pelas Rules não se tornam disponíveis. Divergências do código devem ser corrigidas ou registradas como dependência; não são novas regras de produto.

## 7. Jornada e fluxos principais

| Jornada | Sequência esperada | Requisitos principais |
|---|---|---|
| Localizar e preparar atendimento | Pacientes → busca → prontuário identificado → histórico e próxima consulta, quando houver → análise → evidências → fonte → retorno ao ponto de leitura. | RF-001, RF-002, RF-005, RF-009 a RF-011, RF-014 |
| Iniciar acompanhamento | Novo paciente → preenchimento/validação → cadastro confirmado → novo prontuário vazio → Novo parecer. | RF-003, RF-004, RF-006 |
| Registrar atendimento | Novo parecer → texto, data clínica e opcionais → salvar → registro disponível → atualização da IA independente. | RF-006, RF-011, RF-017 |
| Corrigir ou acrescentar informação | Localizar original → Adicionar complemento → identificar original/paciente → salvar novo registro → original preservado. | RF-005, RF-007 |
| Interromper e retomar preenchimento | Digitar → fechar formulário ou navegar na mesma aba → retornar ao contexto → recuperar rascunho → continuar, salvar ou descartar. | RF-008, RF-018 |
| Conferir versão anterior | Análise de IA → histórico → geração concluída → análise histórica → observação → suas evidências/fontes → retorno à mesma versão. | RF-009, RF-010, RF-013 |
| Recuperar atualização de IA | Identificar falha → continuar usando prontuário e última análise válida → solicitar regeneração se permitida → acompanhar estado. | RF-011, RF-012, RF-017 |
| Organizar consulta | Agenda ou prontuário → Agendar consulta → paciente/data/hora → confirmação → consulta Agendada → atualização explícita para estado final. | RF-014 a RF-017 |

Todos os fluxos respeitam o isolamento de RF-018, os estados de RF-017, a paridade integral de RF-019 e os critérios de acessibilidade e responsividade da seção 10.

## 8. Regras de negócio

As regras abaixo são preservadas das Rules e do MVP; a reorganização visual não as redefine.

| Regra | Aplicação no redesign |
|---|---|
| Registros do médico são a fonte clínica de verdade. | Conteúdo original e IA ficam separados; relato e interpretação não se confundem. RF-005, RF-009, RF-010. |
| Pareceres e complementos são append-only. | Correção cria complemento do mesmo paciente, mantendo original e datas. RF-006 e RF-007. |
| Salvar registro independe da IA. | Falha, timeout ou indisponibilidade da IA não desfazem salvamento nem bloqueiam o trabalho. RF-006, RF-007 e RF-011. |
| Cada nova análise parte dos registros clínicos do seu conjunto congelado. | Inclui originais e complementos aplicáveis; exclui análises anteriores, observações de consultas e informações cadastrais sem finalidade clínica prevista. RF-009 a RF-013. |
| Zero, um e vários originais têm comportamentos distintos. | Sem original não há geração; com um, somente resumo/organização sem evolução ou tendência; com dois ou mais, leitura longitudinal permitida. Complementos não aumentam a contagem de originais. RF-011. |
| Análises antigas são imutáveis. | Novos registros, inclusive retroativos, só participam dos conjuntos posteriores aplicáveis; versões anteriores mantêm suas próprias fontes. RF-010 e RF-013. |
| A análise atual corresponde ao conjunto clínico válido mais recente. | Não é escolhida pela mera ordem de conclusão. Em empate do conjunto, respeita a ordenação da solicitação definida pelo sistema. RF-011. |
| Regeneração depende de original e ausência de geração ativa. | A interface respeita a permissão vigente e seu motivo. RF-012. |
| Evidência pertence a uma observação, ao paciente e ao conjunto daquela análise. | Pode apontar para original ou complemento, nos campos Texto, Estado/humor e Medicações. RF-010 e RF-013. |
| Paciente exige dados cadastrais válidos. | Nome, CPF, nascimento, telefone e e-mail obrigatórios; queixa inicial opcional; CPF válido/único e mascarado na visualização. RF-003 e RF-004. |
| Consulta é interna e manual. | Exige paciente/data/hora, aceita passado e nasce Agendada; somente Agendada pode transitar para Realizada, Cancelada ou Falta. RF-014 a RF-016. |
| Parecer pode existir sem consulta. | Associação, se informada, é com consulta do mesmo paciente. Complemento referencia original e não recebe associação independente a consulta. RF-006 e RF-007. |
| Datas clínicas e de criação têm significados diferentes. | Histórico ordenado clinicamente; criação preservada para auditoria. Exibição segue America/Sao_Paulo. RF-005 a RF-007 e RNF-008. |
| IA não decide conduta. | Não diagnostica, prescreve, recomenda início/suspensão/troca/dose de medicamento, transforma hipótese em fato ou inventa informação ausente. RNF-007. |

**Decisão adicional de experiência confirmada:** cadastro, parecer e complemento têm rascunhos temporários recuperáveis durante navegação na mesma aba, com descarte explícito e limpeza após sucesso. A política está em RF-008 e não altera a preservação dos registros efetivamente salvos.

## 9. Dados e informações envolvidas

| Informação | Conteúdo relevante para a experiência | Cuidados |
|---|---|---|
| Paciente | Nome, CPF, nascimento, telefone, e-mail e queixa inicial opcional. | Dados fictícios; CPF mascarado após cadastro; ausência de opcional não autoriza inferência. |
| Consulta | Paciente, data/hora, status e observações opcionais. | Observações não são fonte da IA; estados finais não são reversíveis neste escopo. |
| Registro clínico | Paciente, tipo, texto, humor e medicações opcionais, data/hora clínica e de criação, consulta opcional do parecer e original do complemento. | Texto integral e datas preservados; vínculo correto e append-only. |
| Geração | Paciente, estado, solicitação, conjunto de registros considerado, contagens e último registro clínico considerado. | Distinguir processo de resultado; não inventar motivos técnicos ou metadados ausentes. |
| Análise | Versão, paciente, geração de origem, data, modo, três listas de observações e limitações. | Conteúdo derivado e imutável; não substituir versão em consulta pela atual. |
| Observação | Texto, natureza e lista própria de evidências. | Vários itens ou lista vazia; não fundir fontes entre itens. |
| Evidência | Registro de origem, campo e citação literal. | Mesmo paciente e conjunto da versão; fonte pode ser complemento. |
| Rascunho | Valores ainda não salvos e seu contexto de cadastro, paciente e original, quando aplicável. | Temporário, isolado e distinguível de registro salvo; sem recuperação entre sessões. |
| Contexto de leitura | Busca, tela, seção, paciente, versão, observação e fonte em consulta. | Preservar retorno sem incluir conteúdo clínico ou dados cadastrais sensíveis no endereço ou telemetria. |

Os nomes `linhaDoTempo`, `padroes`, `pontosDeAtencao`, `texto`, `natureza`, `evidencias`, `apelidoRegistro`, `registroId`, `campo`, `citacao` e `limitacoes` localizam o contrato existente em [analise-ia.md](../../docs/redesign/analise-ia.md). Não constituem uma proposta de novo modelo de dados.

### Inventário de dados para verificação de paridade

Os nomes abaixo foram conferidos nos contratos atuais em 23/09/2026 e constituem evidência de cobertura, não desenho de um novo contrato. **Cada campo listado deve constar da rastreabilidade técnica e da evidência de paridade.** A informação pode ser reorganizada em apresentação principal e detalhes contextuais, sem ser perdida. Identificadores e metadados devem permanecer disponíveis para seus vínculos e consulta; não devem ocupar o lugar do nome do paciente ou do conteúdo clínico.

| ID | Origem atual e campos | Destino/uso que deve ser preservado | Requisitos |
|---|---|---|---|
| D-01 | Cadastro: `nome`, `cpf`, `dataNascimento`, `telefone`, `email`, `queixaInicial`. | Preenchimento integral, obrigatoriedade/opcionalidade, validações e recuperação de erros. | RF-003, RF-008, RF-017, RF-019 |
| D-02 | Paciente: `id`, `nome`, `cpf`, `dataNascimento`, `telefone`, `email`, `queixaInicial`, `criadoEm`. | Identificação, resultado de busca, Dados pessoais, vínculo de prontuário e data de cadastro; CPF retornado sempre mascarado. | RF-001 a RF-004, RF-019 |
| D-03 | Consulta: paciente escolhido/contextual; entrada `agendadaPara`, `observacoes`; mudança de `status`. | Agendamento, observações opcionais e transições existentes. | RF-015, RF-016, RF-019 |
| D-04 | Consulta retornada: `id`, `pacienteId`, `agendadaPara`, `status`, `observacoes`, `criadaEm`, `statusAlteradoEm`. | Agenda, consultas do paciente e detalhe de auditoria da consulta, preservando nulos/ausências. | RF-014 a RF-016, RF-019 |
| D-05 | Parecer/complemento: paciente e original contextual, quando aplicável; entrada `texto`, `humor`, `medicamentos`, `dataHoraClinica`, `consultaId`. | Todos os campos clínicos e suas associações. `consultaId` opcional em parecer e não preenchido em complemento, segundo a regra vigente. | RF-006 a RF-008, RF-019 |
| D-06 | Registro clínico: `id`, `pacienteId`, `tipo`, `parecerOriginalId`, `consultaId`, `dataHoraClinica`, `criadoEm`, `texto`, `humor`, `medicamentos`, `revisao`. | Histórico e fonte completa, tipo/vínculos, datas distintas, conteúdo integral e metadados consultáveis. | RF-005 a RF-007, RF-010, RF-019 |
| D-07 | Resultado de salvamento: `registro`, `geracaoId`, `geracao`. | Confirmação do registro efetivamente salvo e sua relação com a geração automática; os campos internos desses objetos seguem D-06 e D-09. | RF-006, RF-007, RF-011, RF-017, RF-019 |
| D-08 | Estado de IA: `analiseAtual`, `ultimaGeracao`, `geracaoAtiva`, `podeRegenerar`, `motivo`. | Análise atual, acompanhamento da última geração e da ativa, disponibilidade da regeneração e explicação do impedimento. Os três contextos não devem ser confundidos. | RF-011 a RF-013, RF-019 |
| D-09 | Geração: `id`, `pacienteId`, `estado`, `revisaoSnapshot`, `sequenciaRequest`, `solicitadaEm`, `totalRegistros`, `totalOriginais`, `totalComplementos`, `ultimoRegistroClinicoId`, `modo`. | Histórico/detalhe de geração, estado, cobertura, suficiência e auditoria de cada conjunto considerado, incluindo sequência e revisão. | RF-011 a RF-013, RF-019 |
| D-10 | Análise: `id`, `geracaoId`, `pacienteId`, `geradaEm`, `modo`, `linhaDoTempo`, `padroes`, `pontosDeAtencao`, `limitacoes`. | Análise atual e histórica, contexto de versão e conteúdo integral de todas as listas. | RF-009 a RF-013, RF-019 |
| D-11 | Cada item das três listas: `texto`, `natureza`, `evidencias`. | Observação completa, distinção relato/interpretação e conjunto próprio de evidências, sem quantidade fixa. | RF-009, RF-010, RF-013, RF-019 |
| D-12 | Cada evidência: `apelidoRegistro`, `registroId`, `campo`, `citacao`. | Referência de origem preservada, campo e citação literal, navegação para o registro correto e retorno à observação/versão. | RF-010, RF-013, RF-019 |
| D-13 | Listagens: `itens`, `pagina`, `tamanho`, `total`; filtros `nome`, `de`, `ate`, `pacienteId`, conforme a operação. | Conjunto completo acessível, busca/período/paciente compreensíveis e informação de continuidade/total verdadeira. A forma visual de navegação pertence à TechSpec. | RF-002, RF-005, RF-013, RF-014, RF-019 |
| D-14 | Erros: `type`, `title`, `status`, `detail`, `instance`, `codigo`, `errosDeCampo` (`campo`, `mensagem`), `idRequisicao`. | Preservar semântica do erro, associação aos campos e identificação operacional segura. A política existente de mensagens locais e de não reter/exibir texto remoto bruto continua vigente; não reproduzir dados sensíveis em nome de paridade. | RF-017, RF-019, RNF-005 |
| D-15 | Proteções e respostas operacionais: `Idempotency-Key`, `X-Request-Id`, status HTTP e referência do recurso criado quando fornecida. | Repetição segura, rastreabilidade de operação e reconhecimento do resultado, sem transformar metadados de transporte em conteúdo clínico. | RF-017, RF-019 |

Fontes do inventário: [contratos de entrada/saída](../../apps/backend/src/main/java/com/psiqapp/adapter/in/web), incluindo `CriarPacienteRequest`, `PacienteResponse`, `CriarConsultaRequest`, `AtualizarStatusConsultaRequest`, `ConsultaResponse`, `CriarRegistroClinicoRequest`, `RegistroClinicoResponse`, `CriarRegistroClinicoResponse`, `EstadoAnaliseResponse`, `GeracaoAnaliseResponse`, `AnaliseResponse`, `PaginaResponse` e `ResponseProblema`; e os consumidores em [pacientes](../../apps/frontend/src/features/pacientes), [consultas](../../apps/frontend/src/features/consultas), [registros clínicos](../../apps/frontend/src/features/registros-clinicos) e [análises](../../apps/frontend/src/features/analises).

As proteções de CPF e mensagens não são exclusões de funcionalidade: são comportamentos atuais obrigatórios. Informação operacional que já é descartada por segurança não deve ser exposta. A estrutura interna do banco e dados não disponibilizados pelo produto não se tornam novos campos de tela por inferência.

## 10. Requisitos não funcionais

### RNF-001 — Fidelidade à direção visual aprovada

**Descrição:**
Manter a direção A: aparência sóbria, clara e acolhedora, verde discreto, superfícies claras, hierarquia tipográfica e espaçamento consistente para leitura prolongada.

**Critério mensurável:**
Registrar comparação visual com `docs/redesign/DESIGN.md` e o protótipo A para Pacientes, histórico, análise completa, dados pessoais, consultas, cadastro, parecer, complemento e evidências/fontes. A avaliação deve verificar identidade antes de ações, prioridades dos botões, organização do histórico/análise, legibilidade e coerência dos estados de operação. Diferenças necessárias à integração, contraste ou responsividade devem ser justificadas, preservando a identidade aprovada. Testes funcionais isolados não satisfazem este critério.

### RNF-002 — Responsividade e leitura integral

**Descrição:**
Priorizar desktop e manter todos os fluxos utilizáveis nas larguras confirmadas de 375, 768, 1024 e 1440 px.

**Critério mensurável:**
Executar os fluxos da seção 7 em cada largura, incluindo diálogos, mensagens de erro, textos longos e conteúdo de IA com várias observações. Nenhum campo, ação ou informação necessária pode ficar inacessível por corte, sobreposição ou rolagem horizontal da página. A ampliação pelo navegador não deve ser desabilitada; formulários maiores que a área visível devem permitir alcançar suas ações por rolagem e teclado.

### RNF-003 — Acessibilidade verificável

**Descrição:**
Adotar critérios observáveis de teclado, foco, rótulos, erros, legibilidade, contraste, comunicação de estado e movimento reduzido, sem declarar conformidade formal de acessibilidade.

**Critério mensurável:**
Concluir os fluxos da seção 7 somente por teclado, verificando foco visível e ordem coerente; ao abrir diálogo, foco no seu conteúdo; durante uso, navegação contida no diálogo; ao fechar, retorno ao acionador ou a destino equivalente quando ele deixar de existir. Todos os campos e controles devem ter nome compreensível, obrigatoriedade/opcionalidade identificável e erros associados; múltiplos erros devem ser apresentados sem ocultar um pelo outro. Estados devem ser perceptíveis por texto, inclusive por tecnologia assistiva, e não apenas por cor. Verificar ausência de controles que dependam somente de hover e respeito à preferência por movimento reduzido. Registrar medição dos pares de contraste utilizados e revisão de legibilidade de textos, rótulos, foco e erros, corrigindo os problemas identificados e documentando limitações. Esta verificação não é certificação nem alegação de atendimento integral à WCAG.

### RNF-004 — Continuidade e integridade da informação

**Descrição:**
Preservar registros, análises, versões e preenchimento diante de falhas ou atualizações assíncronas.

**Critério mensurável:**
Nos cenários de falha, lentidão, timeout e resposta inválida da IA, confirmar que registros clínicos salvos continuam íntegros e visíveis e que a última análise válida permanece disponível. Verificar também recuperação de preenchimento, repetição segura e descarte conforme RF-008 e RF-017. Após nova análise ou complemento, conteúdo e metadados históricos não podem ser sobrescritos.

### RNF-005 — Privacidade e isolamento

**Descrição:**
Manter a restrição a dados fictícios e impedir exposição ou mistura de dados pela nova experiência.

**Critério mensurável:**
O aviso de uso exclusivo de dados fictícios permanece visível durante os fluxos, inclusive formulários. Executar os cenários de RF-018 com pacientes fictícios distintos, respostas atrasadas e falhas, sem exibição cruzada de dados. Conferir CPF mascarado fora de seu preenchimento e ausência de conteúdo clínico, CPF completo, credenciais e respostas integrais de IA em logs, erros, endereços de navegação, telemetria ou novos serviços externos introduzidos pelo redesign. Não criar persistência de rascunhos entre sessões.

### RNF-006 — Volume e ausência de truncamento silencioso

**Descrição:**
Manter leitura e acesso aos dados nos volumes de validação do MVP, sem restringir a experiência às poucas amostras do estudo visual.

**Critério mensurável:**
Avaliar cenários fictícios com aproximadamente 100–500 pacientes, 20–100 registros por paciente e casos com 200 ou mais registros. Incluir textos longos, observações com várias evidências e históricos de gerações maiores que o primeiro conjunto carregado. Registrar comportamento e dificuldades observados e demonstrar acesso a todos os dados, inclusive à fonte de um registro não inicialmente visível. Não adotar limite fixo de observações ou tempo de resposta sem decisão posterior de produto; a organização técnica do carregamento pertence à TechSpec.

### RNF-007 — Clareza e segurança clínica da IA

**Descrição:**
Preservar os limites da IA e impedir que a apresentação transforme interpretação em fato ou oculte insuficiência e incerteza.

**Critério mensurável:**
Em análise atual e histórica, verificar identificação da IA, natureza das observações, limitações e fontes próprias. Validar os cenários de zero, um e vários originais e complemento como evidência. Conteúdo inválido não pode ser apresentado como análise válida; diagnóstico novo, prescrição, recomendação de conduta ou informação inventada não podem ser introduzidos pela experiência. Registrar a revisão de segurança clínica aplicável conforme o workflow, sem presumir sua aprovação.

### RNF-008 — Consistência temporal e linguagem do produto

**Descrição:**
Apresentar datas, horários, tipos e estados em português compreensível, mantendo a distinção entre tempo clínico e tempo de criação.

**Critério mensurável:**
Conferir os mesmos instantes em Agenda, prontuário, análise e fontes com exibição em `America/Sao_Paulo`, inclusive registros retroativos e navegação em ambiente com outro fuso configurado. A data de nascimento deve permanecer uma data civil, sem deslocamento de dia. Rótulos devem distinguir data/hora clínica, criação, solicitação e geração; códigos internos e o termo técnico “snapshot” não devem ser a única explicação oferecida ao médico.

## 11. Restrições e compliance de alto nível

- As Rules de produto, segurança clínica, privacidade, arquitetura, testes e documentação permanecem vigentes. Código ou simulação divergente não redefine regra de negócio.
- O MVP permanece local e exclusivo para dados fictícios. A interface deve manter aviso explícito de que dados reais de pacientes não devem ser inseridos.
- A profissionalização visual não aprova uso real, produção clínica, operação remota ou envio de dados reais a provedores. As decisões futuras de LGPD, autenticação, autorização, criptografia, hospedagem, backup, retenção, auditoria e fornecedores continuam fora desta entrega.
- Não alterar banco, regras de negócio, provedor, modelo, prompt clínico ou estrutura do conteúdo de análise. A única exceção de backend autorizada é o ajuste mínimo de contrato para acesso ao histórico completo, conforme RF-013 e seção 14.
- Não trocar stack, impor biblioteca de componentes ou realizar refatoração arquitetural geral neste PRD. As decisões de implementação cabem à TechSpec, partindo do repositório real.
- Não substituir integrações reais por simulações permanentes para reproduzir o protótipo. Salvamentos confirmados devem continuar persistidos quando a aplicação for reaberta.
- O redesign não autoriza novos fluxos de dados para serviços externos, telemetria clínica ou logs sensíveis. A relação existente de observações e evidências não exige novo modelo de domínio.
- A mudança de composição visual não autoriza reduzir funcionalidades, endpoints, campos, filtros, estados, vínculos ou acesso ao histórico. A exigência de completude de RF-019 aplica-se à entrega inteira; qualquer redução depende de nova decisão explícita do usuário.

## 12. Fora do escopo

- Reabrir a escolha A/B, introduzir uma terceira identidade, criar identidade de marca definitiva, landing page, dashboard comercial ou experiência de marketing.
- Transportar para o produto o seletor A/B, “Direção A escolhida”, “Sobre o protótipo”, preenchimento automático de exemplo, pacientes demonstrativos, datas fixas, contagens fixas ou ausência de persistência da simulação.
- Editar/excluir registros clínicos ou análises, alterar dados cadastrais por funcionalidade nova ou reverter estados finais de consulta.
- Persistir ou sincronizar rascunhos entre sessões, recarregamentos, abas ou dispositivos; recuperação após fechamento forçado.
- Múltiplos médicos, novos perfis, portal do paciente, autenticação, faturamento, prescrições, diagnóstico automatizado, recomendações clínicas ou integrações externas.
- RAG, busca semântica, banco vetorial, sumarização incremental como fonte clínica e dashboard clínico avançado.
- Redesenhar contrato de IA, migrar banco ou corrigir silenciosamente todas as pendências anteriores do MVP/refatoração. A exceção de histórico não autoriza essas ampliações.
- Certificação ou alegação formal de conformidade de acessibilidade; novas metas numéricas de ganho de tempo, satisfação ou desempenho.
- Criação de TechSpec, Tasks, alterações de aplicação, commits ou implementação como parte da criação deste PRD.

## 13. Riscos de produto e uso

| Risco | Tratamento esperado e rastreabilidade |
|---|---|
| Interface mais polida parecer pronta para dados reais. | Aviso persistente e limites explícitos. RNF-005 e seção 11. |
| Simplificação visual apagar observações ou fundir suas fontes. | Todas as listas e vínculos por item preservados; massas com conjuntos e campos distintos. RF-009 e RF-010. |
| Análise antiga parecer representar registros recém-incluídos. | Versão, cobertura e limitações identificáveis; imutabilidade e retorno à versão correta. RF-011 e RF-013. |
| Resposta atrasada ou rascunho aparecer em outro paciente. | Verificação de transições e contexto em leituras e escritas. RF-008 e RF-018. |
| Médico entender falha da IA como perda de parecer ou repetir salvamento. | Separar confirmação clínica do processamento; estados de resultado incerto e repetição segura. RF-006, RF-007 e RF-017. |
| Perda de rascunho após recarregamento/fechamento. | Informar caráter temporário e avisar sobre saída quando possível; não prometer recuperação inexistente. RF-008. |
| Textos longos e listas grandes prejudicarem leitura ou ocultarem dados. | Validação de volume, conteúdo integral e acesso além do primeiro conjunto. RF-002, RF-005, RF-013, RF-014 e RNF-006. |
| Redesign reproduzir somente as capacidades demonstradas no protótipo e perder funções, endpoints ou dados reais. | Inventários completos, comparação antes/depois e omissões tratadas como bloqueio da entrega. RF-019 e matrizes das seções 9 e 14. |
| Estado final de consulta ser alterado por engano. | Identificação do contexto e confirmação deliberada de caráter definitivo. RF-016. |
| Pendências anteriores serem confundidas com capacidades verificadas. | Dependências registradas na seção 14; falhas de integração e segurança não podem ser encobertas pela aprovação visual. |
| Ausência de avaliação interativa nesta descoberta. | Inspeção local de código e capturas registrada; testes dos fluxos e revisão visual da implementação permanecem exigidos. RNF-001 a RNF-003. |

## 14. Dependências e premissas

### Decisões confirmadas

| Decisão | Origem | Aplicação |
|---|---|---|
| Direção A — Foco clínico, com revisão de cadastro e evidências por observação. | Briefing e artefatos locais da aprovação de 23/09/2026. | RF-001 a RF-010 e RNF-001. |
| Histórico completo, permitindo apenas ajuste mínimo de contrato, sem banco ou regras clínicas. | Resposta explícita do usuário nesta descoberta. | RF-013; exceção limitada das seções 1 e 11. |
| Recuperação de rascunhos durante navegação na mesma aba, descarte explícito, limpeza após salvar e aviso de possível perda ao sair/recarregar. | Resposta explícita do usuário nesta descoberta. | RF-008. |
| Desktop prioritário; todos os fluxos também avaliados em 375, 768, 1024 e 1440 px. | Resposta explícita do usuário nesta descoberta. | RNF-002. |
| Acessibilidade por critérios verificáveis de comportamento, legibilidade e contraste, sem alegação de conformidade formal. | Resposta explícita do usuário nesta descoberta. | RNF-003. |
| Preservar todas as funcionalidades atuais das telas, todos os endpoints e todos os dados, sem omissões. | Reforço explícito do usuário durante a redação deste PRD. | RF-019 e inventários das seções 9 e 14; condição obrigatória de aceite. |

### Inventário das capacidades atuais de tela

Este inventário complementa os fluxos descritos nos RFs. O destino visual pode mudar, mas ação, informação e caminho de consulta devem permanecer disponíveis e rastreáveis.

| Área atual | Conteúdo e comportamento preservados | Destino no redesign / cobertura |
|---|---|---|
| Navegação e layout | Entrada em Pacientes, Agenda, acesso direto a prontuário identificado, orientação quando não há paciente, página não encontrada, retorno a Pacientes, pular para conteúdo, aviso de dados fictícios. | Navegação principal, seções e estados de localização. RF-001, RF-017, RF-019, RNF-003 e RNF-005. |
| Pacientes | Busca, lista, nome/e-mail/CPF mascarado no resultado, abrir prontuário, cadastro com todos os campos, validação, erro, carregamento, vazio e sucesso. | Pacientes e cadastro sob demanda. RF-002 a RF-004, RF-008, RF-017 e RF-019. |
| Dados do paciente | Nome, CPF mascarado, nascimento, telefone, e-mail, queixa inicial e indicação de ausência. Metadados adicionais do contrato permanecem consultáveis. | Identidade e Dados pessoais. RF-001, RF-004 e RF-019; D-02. |
| Agenda e consultas no prontuário | Listagem global/por paciente, identificação, horário, status, observações, criação com paciente selecionado ou fixo, Realizada/Cancelada/Falta, estado final e erros. Todos os filtros e metadados do contrato permanecem utilizáveis. | Agenda, Consultas e formulários contextuais. RF-014 a RF-017 e RF-019; D-03, D-04 e D-13. |
| Parecer e complemento | Texto, humor, medicações, data/hora clínica, envio, erro, cancelar complemento, referência ao original e confirmação. Associação opcional do parecer a consulta também deve ter acesso na experiência. | Novo parecer e complemento contextual. RF-006 a RF-008, RF-017 e RF-019. |
| Histórico clínico | Tipo, texto integral, data clínica, criação, humor, medicações, vínculos de consulta/original, ação de complemento e vazio. | Histórico e fonte completa, preservando todos os metadados. RF-005, RF-007, RF-010 e RF-019. |
| Análise atual | Modo/data, três listas completas, natureza, limitações, mensagens de seção vazia, estado ativo/falha, ausência de análise, motivo de impedimento e regenerar. | Painel lateral e seção Análise de IA. RF-009, RF-011, RF-012, RF-017 e RF-019. |
| Evidência/fonte | Cada citação e campo, abrir fonte, texto completo, data clínica/criação, humor, medicações, fechar e erros. | Observação → evidências → fonte, incluindo destaque e retorno previstos na direção A. RF-010, RF-013 e RF-019. |
| Histórico de gerações | Estado, data de solicitação, revisão, contagens e vazio; demais metadados do contrato e abertura de análises históricas cobertos. | Histórico completo da seção de IA. RF-013 e RF-019; D-09. |
| Atualizações e proteção | Acompanhamento da geração ativa, retomada ao voltar à aba, descarte de respostas obsoletas, edição preservada, proteção contra reenvio e tratamento seguro de erros. | Comportamento transversal, sem exigir atualização manual para perceber a conclusão da IA enquanto o acompanhamento estiver ativo. RF-008, RF-011, RF-017 a RF-019. |

### Inventário dos endpoints existentes e cobertura

Base atual: `/api/v1`. Esta tabela documenta os **14 endpoints de produto existentes**, sem propor novas rotas ou antecipar o desenho do ajuste mínimo de histórico. Todos devem ter integração e evidência na entrega. Filtros, dados e proteções associados também fazem parte da cobertura.

| ID | Método e caminho atual relativo à base | Capacidade/dados preservados | RF/AC de destino |
|---|---|---|---|
| E-01 | `POST /pacientes` | Cadastro completo; D-01, D-02 e D-15. | RF-003, AC-RF017-04, RF-019 |
| E-02 | `GET /pacientes` | Busca `nome`, `pagina`, `tamanho`; pacientes, seleção para agenda e conjunto completo. D-02 e D-13. | RF-002, AC-RF015-01, RF-019 |
| E-03 | `GET /pacientes/{id}` | Identificação e dados completos do paciente; D-02. | RF-001, RF-004, RF-018, RF-019 |
| E-04 | `POST /pacientes/{pacienteId}/consultas` | Agendamento, observações, paciente correto e retorno integral; D-03, D-04 e D-15. | RF-015, AC-RF017-04, RF-019 |
| E-05 | `GET /consultas` | Agenda com filtros `de`, `ate`, `pacienteId`, `pagina`, `tamanho`; todos os dados/estados da consulta. D-04 e D-13. | RF-014, AC-RF006-04, RF-019 |
| E-06 | `POST /consultas/{id}/status` | Transições finais e retorno de consulta atualizado; D-03 e D-04. | RF-016, AC-RF014-05, RF-019 |
| E-07 | `POST /pacientes/{pacienteId}/registros-clinicos` | Parecer, opcionais, data clínica, consulta opcional, registro e geração retornados. D-05 a D-07 e D-15. | RF-006, AC-RF017-04, RF-019 |
| E-08 | `POST /pacientes/{pacienteId}/registros-clinicos/{parecerOriginalId}/complementos` | Complemento, vínculo ao original e geração automática; D-05 a D-07 e D-15. | RF-007, AC-RF017-04, RF-019 |
| E-09 | `GET /pacientes/{pacienteId}/registros-clinicos` | Histórico completo com `pagina`, `tamanho` e todos os campos; D-06 e D-13. | RF-005, RF-018, RF-019 |
| E-10 | `GET /pacientes/{pacienteId}/registros-clinicos/{registroId}` | Fonte completa de original ou complemento, mesmo fora do conjunto inicialmente visível; D-06. | RF-010, RF-013, RF-018, RF-019 |
| E-11 | `GET /pacientes/{pacienteId}/estado-analise` | Análise atual, última geração, geração ativa, permissão e motivo; D-08 a D-12. | RF-009, RF-011, RF-012, RF-018, RF-019 |
| E-12 | `GET /pacientes/{pacienteId}/geracoes-analise` | Histórico completo com `pagina`, `tamanho` e todos os metadados; D-09 e D-13. | RF-013, RF-019 |
| E-13 | `GET /pacientes/{pacienteId}/analises/{analiseId}` | Análise histórica integral, observações, limitações e evidências; D-10 a D-12. | RF-009, RF-010, RF-013, RF-019 |
| E-14 | `POST /pacientes/{pacienteId}/geracoes-analise` | Regeneração permitida, geração retornada e proteção contra duplicidade; D-09 e D-15. | RF-012, AC-RF017-04, RF-019 |

Erros e metadados de operação de D-14/D-15 são transversais aos endpoints em que se aplicam. Fonte: [PacienteController](../../apps/backend/src/main/java/com/psiqapp/adapter/in/web/PacienteController.java), [ConsultaController](../../apps/backend/src/main/java/com/psiqapp/adapter/in/web/ConsultaController.java), [RegistroClinicoController](../../apps/backend/src/main/java/com/psiqapp/adapter/in/web/RegistroClinicoController.java) e [AnaliseController](../../apps/backend/src/main/java/com/psiqapp/adapter/in/web/AnaliseController.java).

| ID | Endpoint operacional existente | Preservação exigida |
|---|---|---|
| E-15 | `GET /health` | Saúde local permanece disponível, com a política atual de não expor detalhes internos. AC-RF019-06. |
| E-16 | `GET /health/readiness` | Verificação de prontidão permanece disponível para a execução atual. AC-RF019-06. |
| E-17 | `GET /openapi` | Documentação dos contratos permanece disponível e acompanha o ajuste mínimo autorizado para histórico. AC-RF019-06. |

Configuração conferida em [application.yaml](../../apps/backend/src/main/resources/application.yaml). Os três caminhos operacionais também usam a base `/api/v1`. Sua preservação não exige adicionar controles técnicos às telas clínicas. A matriz deve ser reconciliada novamente com o repositório antes da implementação: um endpoint ou campo posteriormente encontrado não pode ser omitido apenas por não constar deste inventário inicial.

### Referências obrigatórias para as próximas etapas

TechSpec, Tasks, implementação e QA devem preservar e consultar os caminhos abaixo. O protótipo A atual prevalece sobre capturas desatualizadas para direção visual; Rules e requisitos aprovados prevalecem sobre simplificações da simulação para comportamento clínico.

| Referência local | Finalidade |
|---|---|
| [create_prd.md](../../sdd-workflow/create_prd.md) e [workflow.md](../../sdd-workflow/workflow.md) | Briefing, escopo da descoberta e sequência de gates SDD. |
| [Rules](../../.agents/rules/README.md): [produto](../../.agents/rules/product-invariants.md), [segurança clínica](../../.agents/rules/clinical-ai-safety.md), [privacidade](../../.agents/rules/clinical-data-privacy.md), [arquitetura](../../.agents/rules/architecture-boundaries.md), [testes](../../.agents/rules/testing-quality.md), [documentação](../../.agents/rules/documentation-maintenance.md) | Invariantes e restrições que permanecem verificáveis. |
| [BUSINESS.md](../../docs/BUSINESS.md), [TECHNICAL.md](../../docs/TECHNICAL.md), [README.md](../../README.md) | Produto implementado, contratos, limites e execução atual. |
| [PRD do MVP](../prd-psiqapp-mvp/prd.md) e [spec-review.md](../prd-psiqapp-mvp/spec-review.md) | Requisitos de origem e aprovação da especificação, distintos de aprovação da entrega. |
| [PRD da refatoração](../prd-refatoracao-arquitetural-nomenclaturas/prd.md) | Evolução de nomenclaturas sem redefinição de regras clínicas. |
| [README do redesign](../../docs/redesign/README.md) | Estado da proposta escolhida, roteiro, simulações e limitações. |
| [DESIGN.md](../../docs/redesign/DESIGN.md) | Referência visual e de interação da direção A. A direção B é histórica. |
| [index.html](../../docs/redesign/index.html), [prototipos.css](../../docs/redesign/prototipos.css), [prototipos.js](../../docs/redesign/prototipos.js) | Referência navegável: `/?direcao=foco`, `/?direcao=foco&tela=pacientes` e `/?direcao=foco&secao=analise`, conforme instruções do README local. |
| [analise-ia.md](../../docs/redesign/analise-ia.md) | Relação análise → observações → evidências e exemplos fictícios para conferência. |
| [diagnostico.md](../../docs/redesign/diagnostico.md) | Motivação inicial; lacuna de cadastro no estudo já superada pela revisão de 23/09. |
| [Prévia desktop](../../docs/redesign/previa-foco.png), [prévia mobile](../../docs/redesign/previa-foco-mobile.png), [Pacientes](../../docs/redesign/previa-pacientes.png), [cadastro desktop](../../docs/redesign/previa-cadastro.png), [cadastro mobile](../../docs/redesign/previa-cadastro-mobile.png), [evidências](../../docs/redesign/previa-evidencias.png) | Capturas auxiliares da direção A; não substituem arquivos e interações do protótipo. |
| [servicoAnalises.ts](../../apps/frontend/src/features/analises/servicoAnalises.ts), [PainelAnaliseAtual.tsx](../../apps/frontend/src/features/analises/PainelAnaliseAtual.tsx), [ListaEvidencias.tsx](../../apps/frontend/src/features/analises/ListaEvidencias.tsx) | Confirmação do contrato atual com listas de itens e evidências por observação. |
| [AnaliseResponse.java](../../apps/backend/src/main/java/com/psiqapp/adapter/in/web/AnaliseResponse.java), [AnaliseResponseValidator.java](../../apps/backend/src/main/java/com/psiqapp/application/servico/AnaliseResponseValidator.java) | Confirmação de campos de evidência, fontes do conjunto da análise e validação das citações. |
| [GeracaoAnaliseResponse.java](../../apps/backend/src/main/java/com/psiqapp/adapter/in/web/GeracaoAnaliseResponse.java), [AnaliseController.java](../../apps/backend/src/main/java/com/psiqapp/adapter/in/web/AnaliseController.java), [HistoricoGeracoes.tsx](../../apps/frontend/src/features/analises/HistoricoGeracoes.tsx) | Evidência da lacuna de acesso às análises históricas que motivou a exceção confirmada. |
| [Revisão documental](../../docs/REVISAO-DOCUMENTAL.md), [QA do MVP](../prd-psiqapp-mvp/qa-report.md), [clinical safety do MVP](../prd-psiqapp-mvp/clinical-safety-review.md), [feature review do MVP](../prd-psiqapp-mvp/feature-review.md) | Pendências preexistentes e estado dos gates, sem presumir encerramento. |

Os caminhos de código são evidências do estado presente e pontos de consulta para a TechSpec; este PRD não determina a organização futura de arquivos, componentes ou contratos técnicos.

### Estado verificado, lacunas e dependências

- **Histórico:** a interface atual lista metadados de gerações, e existe consulta de análise por identificador, mas a listagem de gerações não fornece a referência à análise correspondente. O usuário confirmou o histórico completo com ajuste mínimo de contrato. A TechSpec deve resolver somente esse vínculo de acesso usando o histórico preservado; esta decisão não autoriza mudar banco, conteúdo de IA ou regras clínicas.
- **Associação de parecer a consulta:** prevista no PRD do MVP e suportada pelo contrato; o formulário atual envia parecer sem associação. RF-006 torna a capacidade acessível na experiência, sem exigir nova regra de backend. Complemento continua sem associação independente a consulta.
- **Listas e fontes:** consumidores atuais carregam conjuntos iniciais limitados. O requisito de acesso integral deve ser atendido na experiência; a forma de navegação/carregamento pertence à TechSpec. Limites do primeiro conjunto não são limites de produto nem do conjunto clínico usado pela IA.
- **Paridade integral:** o reforço do usuário torna obrigatória a cobertura dos inventários de telas, endpoints e campos. A matriz posterior deve vincular cada item à implementação e à evidência, incluindo metadados atualmente pouco visíveis e filtros de contrato. Não se aceita justificar omissões pelo aspecto mais enxuto do protótipo.
- **Alinhamento dos consumidores:** a inspeção encontrou diferenças de nomes entre alguns tipos do frontend e as respostas atuais, como `sequenciaRequisicao` no consumidor versus `sequenciaRequest` no retorno de geração e nomes de tipo de parecer. A etapa técnica deve preservar os dados e comportamentos do contrato efetivo, sem descartar campos desconhecidos ou criar regra clínica a partir dessas divergências.
- **Divergências de apresentação:** o código contém rótulos e textos com problemas de codificação, inclusive a mensagem fixa de insuficiência longitudinal no validador. O redesign deve registrar a origem dessas falhas; corrigir rótulos de interface cabe no frontend, mas não autoriza reescrever conteúdo clínico ou análises históricas. Correção em backend além da exceção de histórico requer decisão própria e não é assumida como concluída por este PRD.
- **Pendências do MVP:** o feature review permanece `NOT READY`. A revisão documental registra riscos de migração de bases existentes, minimização de dados do provedor, divergências do prompt e lacunas de validação integrada, logs e volume. Elas não são corrigidas ou aprovadas por este documento. Se impedirem um critério da entrega, devem aparecer como dependência e evidência no gate correspondente, sem ampliação silenciosa de escopo.
- **Inspeção desta descoberta:** foram lidos os documentos obrigatórios, HTML/CSS/JavaScript do protótipo, trechos do frontend e contratos pertinentes; as seis capturas citadas foram inspecionadas. A tentativa de exploração interativa não pôde prosseguir porque não havia navegador conectado disponível. Não foram executados fluxos em navegador, testes de aplicação ou auditoria integral de acessibilidade nesta criação de PRD. As verificações históricas do README do protótipo são evidências anteriores, não execuções desta sessão.

### Rastreabilidade de origem e continuidade

| Escopo deste PRD | Origem principal preservada |
|---|---|
| RF-001 a RF-004 | Briefing/direção A e RF-001 a RF-003 do PRD do MVP. |
| RF-005 a RF-007 | RF-007 a RF-010 do MVP, regras de append-only e direção A. |
| RF-008 | Protótipo revisado e decisão explícita sobre rascunhos nesta descoberta. |
| RF-009 e RF-010 | RF-012, RF-015 e RF-016 do MVP, Rules clínicas e `analise-ia.md`. |
| RF-011 a RF-013 | RF-010 a RF-014 e RF-017 a RF-019 do MVP; decisão explícita de histórico completo. |
| RF-014 a RF-016 | RF-004 a RF-006 do MVP e direção A. |
| RF-017 e RF-018 | Briefing, RF-019 e RF-020 do MVP e Rules de qualidade/privacidade. |
| RF-019 | Exigência explícita do usuário de preservar todas as funcionalidades, endpoints e dados; inventários conferidos nas telas e contratos atuais. |
| RNF-001 a RNF-003 | Direção A e decisões de dispositivos/acessibilidade desta descoberta. |
| RNF-004 a RNF-008 | RNFs do MVP, Rules e política temporal documentada do projeto. |

A cadeia seguinte deve manter `RF/RNF/AC → TechSpec → Task → código/teste → evidência`, incluindo evidência visual e funcional. Para RF-019, cada item dos inventários de tela, E-01 a E-17 e D-01 a D-15 também deve ser mapeado, com todos os seus campos, sem cobertura meramente agregada por página. A divisão anterior por base visual, navegação, pacientes, prontuário, IA e agenda é apenas proposta de organização futura; não são tarefas aprovadas neste PRD.

A sequência continua com revisão do PRD; somente depois dos gates previstos vêm TechSpec e Tasks. A avaliação da implementação inclui QA, revisão de segurança clínica aplicável ao prontuário/IA e revisão da feature. A manutenção de `BUSINESS.md`, `TECHNICAL.md` e `README.md` será avaliada nas etapas de implementação, sem descrever funcionalidade planejada como já existente. Nenhum desses gates foi executado ou aprovado nesta criação de PRD.

## 15. Perguntas em aberto

As quatro decisões materiais submetidas ao usuário nesta descoberta foram respondidas e estão consolidadas na seção 14, assim como a exigência posterior de completude integral. Permanecem os pontos abaixo, que não autorizam inventar metas, retirar funcionalidades, endpoints ou dados, nem ampliar o escopo:

- **Avaliação observacional:** em qual sessão e com quais instrumentos serão registrados tempo de tarefa, esforço de releitura e percepção de clareza? Não há meta numérica aprovada; os critérios funcionais e visuais deste PRD continuam aplicáveis.
- **Matriz de navegadores:** quais versões e navegadores serão usados para documentar a evidência nas quatro larguras confirmadas? A seleção do ambiente deve ser registrada na etapa técnica/QA, sem inferir compatibilidade universal.
- **Correções preexistentes fora do escopo:** como serão encaminhadas as pendências de backend e de validação do MVP quando afetarem o aceite do redesign, inclusive textos de insuficiência corrompidos na origem? Devem ser tratadas como dependências explícitas, sem reescrever análises ou ampliar a exceção de contrato aprovada.

Detalhes de componentes, organização de código, estratégia de carregamento e desenho técnico do ajuste mínimo para histórico pertencem à TechSpec. Nenhuma dessas escolhas técnicas foi antecipada aqui.
