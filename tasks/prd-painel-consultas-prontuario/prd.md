# PRD — Painel de consultas do prontuário

## 1. Visão geral

Refatorar a seção Consultas do prontuário conforme a imagem fornecida pelo usuário, aproximando sua composição visual das seções Histórico clínico e Análise de IA.

## 2. Problema e motivação

A seção atual não apresenta a próxima consulta como o histórico, não possui resumo lateral e deixa a lista sem o painel branco solicitado.

## 3. Persona e contexto de uso

Médico único do MVP, consultando a agenda de acompanhamento de um paciente fictício em seu prontuário.

## 4. Objetivos

Facilitar a leitura das consultas do paciente aberto, com contexto da próxima consulta, uma lista visualmente delimitada e um resumo simples.

## 5. Métricas / critérios de sucesso

Os critérios de aceite abaixo são a medida de conclusão. Não há nova métrica de negócio.

## 6. Escopo funcional

### RF-001 — Próxima consulta

Exibir no topo de Consultas a mesma informação de próxima consulta apresentada no Histórico clínico.

- AC-RF001-01 — Havendo consulta próxima, Histórico clínico e Consultas apresentam a mesma data, hora e status Agendada.
- AC-RF001-02 — Sem consulta próxima, não apresentar uma data inventada.

### RF-002 — Painel da lista

Apresentar as consultas em um painel branco, com título, contexto de horários e ação de agendamento, seguindo a referência fornecida.

- AC-RF002-01 — A lista e seus controles ficam dentro de um painel branco com borda e cantos arredondados, consistente com o painel de resultados da análise.
- AC-RF002-02 — Continuam disponíveis grupos, contagens, período, paginação, estados de carregamento/vazio/erro, atualização de status e sincronização Google.
- AC-RF002-03 — Agendar consulta no painel abre o fluxo existente para o paciente atual.

### RF-003 — Resumo das consultas

Apresentar à direita da lista o total de consultas, a próxima consulta e a última consulta realizada, conforme a imagem.

- AC-RF003-01 — O total considera todas as consultas do paciente, inclusive as que não aparecem na página ou no filtro selecionado.
- AC-RF003-02 — Próxima consulta e última realizada mostram data/hora e respectivos status; ausência de cada informação é explícita.
- AC-RF003-03 — Criação ou atualização de consulta e retorno à janela renovam o resumo; uma consulta cujo início passou deixa de ser apresentada como próxima.
- AC-RF003-04 — Falha de leitura apresenta erro identificável, sem transformar indisponibilidade em total zero.
- AC-RF003-05 — Ao trocar de paciente, dados e respostas atrasadas do paciente anterior não entram no resumo atual.

## 7. Jornada e fluxos principais

Abrir o prontuário → selecionar Consultas → ler próxima consulta → consultar lista e resumo → filtrar, agendar ou atualizar status usando os fluxos existentes.

## 8. Regras de negócio

Preservar os cinco grupos e as transições finais de status documentadas em BUSINESS.md. Próxima consulta usa o grupo Próximas; última realizada usa a consulta realizada de data/hora mais recente. Observações de consulta não são fonte clínica da IA.

## 9. Dados e informações envolvidas

Paciente atual, consultas, data/hora, status, observações, contagens e estados de sincronização Google. Somente dados fictícios.

## 10. Requisitos não funcionais

### RNF-001 — Responsividade e acesso

Em desktop, lista e resumo ficam lado a lado; em telas estreitas, ficam empilhados. Verificar ausência de rolagem horizontal em 360, 768, 1024 e 1440 px. Ações têm nome acessível, foco visível e podem ser operadas por teclado.

### RNF-002 — Compatibilidade e privacidade

Preservar os fluxos de agendamento, isolamento por paciente e separação de registros clínicos/análises. Não adicionar dados reais, exposição externa ou alteração de regras clínicas.

## 11. Restrições e compliance de alto nível

Aplicam-se product-invariants, clinical-data-privacy, clinical-ai-safety, architecture-boundaries, testing-quality e documentation-maintenance. Nenhuma Rule muda nesta feature.

## 12. Fora do escopo

Mudar a Agenda global, filtros e regras de negócio; novos gráficos ou métricas clínicas; novas integrações; alterar registros, geração de IA ou backend; adicionar detalhes navegáveis de consulta inexistentes.

## 13. Riscos de produto e uso

Resumo desatualizado após mudança de status, total confundido com filtro/página e exibição de dados de outro paciente. Os ACs de RF-003 protegem esses cenários.

## 14. Dependências e premissas

A solicitação e a imagem aprovam diretamente o escopo visual. A composição conserva os controles existentes que não aparecem no protótipo. O resumo representa o paciente inteiro, independentemente dos filtros da lista. Horários usam São Paulo.

## 15. Perguntas em aberto

Nenhuma decisão material pendente. Implementação local solicitada pelo usuário; publicação remota não faz parte desta entrega.
