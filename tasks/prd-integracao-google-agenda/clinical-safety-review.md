# Clinical Safety Review — Integração com Google Agenda

## Status

APROVADO

## Limites clínicos do produto

Esta feature integra agendamento e calendário; não cria, consulta ou altera prontuário, registros clínicos ou análises de IA. Não produz diagnóstico nem orientação terapêutica. `REALIZADA` e `FALTA` são estados administrativos da consulta e permanecem sujeitos à decisão do médico.

## Privacidade e isolamento de dados

- Uma consulta psiquiátrica pode revelar contexto de saúde mesmo sem conteúdo clínico. A feature continua limitada a dados fictícios, conforme PRD e Rule `clinical-data-privacy.md`.
- A divulgação prévia informa que eventos Google incluem nome, e-mail, horário e, após o encerramento, estado final `REALIZADA` ou `FALTA`; esclarece que não contém conteúdo clínico e que a visibilidade segue permissões de compartilhamento do calendário.
- A integração usa intervalos ocupados dos eventos existentes sem importar participantes, títulos ou descrições. CPF, observações e dados do prontuário ficam fora do evento.
- OAuth é iniciado pelo backend; o frontend recebe estado de conexão e estado de sincronização, sem tokens ou códigos OAuth.
- A criação e o estado local da consulta são preservados quando o Google falha. Mensagens de erro da UI não exibem detalhes do provider.
- Testes finais usaram nomes e e-mails fictícios, fakes locais e provider de análise `fake`. Não foi usada conta Google.

## Evidência e auditabilidade

O estado de sincronização é visível por consulta (`SINCRONIZADA`, `AGUARDANDO_CONEXAO`, `PENDENTE`, `FALHA`, `NAO_APLICAVEL`). Falhas e pendências oferecem nova tentativa quando aplicável. Reviews e testes backend das Tasks 01/02, executados novamente em `mvnw clean verify`, cobrem proteção de credenciais, payload mínimo e reconciliação de status.

## Falhas seguras

- Conflito ocupado e falha de disponibilidade são estados distintos; conexão ativa indisponível bloqueia nova consulta até uma verificação válida.
- Sem conexão por escolha do médico, a verificação local permanece disponível e a UI não indica que consultou o Google.
- A data/hora da consulta precisa ser verificada novamente quando muda; a disponibilidade aprovada não autoriza alteração de estado de conexão.
- Erro ao sincronizar não desfaz a consulta local nem afirma que o evento foi atualizado.
- Falha ao solicitar retry produz mensagem genérica e mantém o estado de falha.

## Problemas bloqueantes

Nenhum.

## Riscos residuais

- O evento e os estados finais ainda podem identificar a existência e o resultado administrativo de uma consulta psiquiátrica. Por isso, o uso com pessoas reais permanece proibido neste MVP; os controles necessários antes desse uso estão definidos nas Rules e PRD.
- OAuth e Calendar não foram exercitados contra uma conta Google externa; os contratos e falhas foram verificados com fakes locais.
- Uma execução exploratória inicial apontou a suíte para um backend local configurado com provider OpenAI e pode ter tentado uma chamada externa; não foi possível confirmar contato com o provider. Foram usados somente dados fictícios. As evidências aprovadas neste QA vêm de execuções isoladas com provider `fake`.

## Veredito

A interface preserva a agenda local como fonte de verdade, limita o conteúdo enviado ao Google, divulga os dados e as permissões relevantes e bloqueia o agendamento quando não há verificação válida. Nenhum blocker clínico ou de privacidade foi identificado. Aprovado para uso do MVP exclusivamente com dados fictícios.
