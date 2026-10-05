# PRD — Organização da tela Agenda

## 1. Visão geral

Refatorar a apresentação da Agenda conforme a solicitação do médico: cadastro aberto por botão, informações do Google Agenda na lateral direita e destaque de próxima consulta seguindo o prontuário.

## 2. Problema e motivação

O cadastro fica permanentemente exposto e a integração Google ocupa a largura principal, reduzindo o espaço de leitura das consultas.

## 3. Persona e contexto de uso

Médico único do MVP local, usando exclusivamente pacientes fictícios.

## 4. Objetivos

Priorizar o acompanhamento das consultas e aproximar a organização visual da seção Consultas do prontuário.

## 5. Métricas / critérios de sucesso

Todos os critérios de aceite abaixo verificáveis, com checks do frontend aprovados.

## 6. Escopo funcional

### RF-001 — Cadastro sob demanda
**Descrição:** Exibir o cadastro apenas após acionar “Agendar consulta”, seguindo a interação existente no prontuário.

**Critérios de aceite:**
- AC-RF001-01 — Ao entrar na Agenda, o formulário está fechado; o botão abre o cadastro com seleção obrigatória de paciente.
- AC-RF001-02 — Fechar, Voltar ou Escape encerra o cadastro e devolve o foco ao botão; reabrir inicia um cadastro limpo.
- AC-RF001-03 — Confirmar com sucesso fecha o cadastro, informa o resultado e atualiza as consultas. Busca mensal, caminho manual retroativo, disponibilidade e repetição segura continuam funcionando.

### RF-002 — Integração na lateral
**Descrição:** Apresentar o Google Agenda na lateral direita, seguindo a organização visual do prontuário.

**Critérios de aceite:**
- AC-RF002-01 — Em desktop, a lista ocupa a coluna principal e o Google Agenda a coluna direita; em telas estreitas, a integração vem abaixo da lista.
- AC-RF002-02 — Estados, ações, retorno OAuth e informações sobre dados compartilhados e desconexão continuam acessíveis.

### RF-003 — Próxima consulta
**Descrição:** Destacar a próxima consulta no padrão visual do prontuário, identificando o paciente na agenda global.

**Critérios de aceite:**
- AC-RF003-01 — Exibir a primeira consulta de Próximas com paciente e data/hora de São Paulo; sem consulta, mostrar ausência explícita; falha oferece nova tentativa.
- AC-RF003-02 — O destaque respeita o filtro de paciente, independentemente do grupo, período e página da lista; troca de paciente descarta o contexto anterior.
- AC-RF003-03 — Criação, atualização de status, retorno à janela/aba e passagem do início da próxima consulta renovam o destaque.

## 7. Jornada e fluxos principais

Abrir Agenda → acompanhar próxima consulta e lista → acionar Agendar consulta → selecionar paciente/data/hora → confirmar → voltar à Agenda atualizada. Informações e ações Google ficam no painel lateral.

## 8. Regras de negócio

Manter as regras de consultas e de integração de `docs/BUSINESS.md`, seção 4. A consulta do PsiqApp permanece a fonte de verdade. Observações não entram na fonte clínica da IA.

## 9. Dados e informações envolvidas

Paciente, data/hora, status, observações opcionais e estado seguro da integração. Somente dados fictícios nas evidências.

## 10. Requisitos não funcionais

### RNF-001 — Responsividade e acessibilidade
**Descrição:** Preservar leitura e operação por teclado.
**Critério mensurável:** Sem overflow horizontal em 320/360/768/1024/1440 px; diálogo nomeado, foco inicial e retorno ao acionador; campos rotulados e feedback de erro/carregamento.

### RNF-002 — Compatibilidade
**Descrição:** Preservar limites de módulo, contratos e privacidade.
**Critério mensurável:** Sem alteração de backend, contratos HTTP, dependências ou Rules; nenhum acesso real a Google nos testes.

## 11. Restrições e compliance de alto nível

Preservar aviso de dados fictícios, isolamento por paciente e divulgação dos dados compartilhados antes de conectar o Google.

## 12. Fora do escopo

Alterar regras de agendamento, autenticação, integrações, arquitetura global, prontuário clínico ou análise de IA.

## 13. Riscos de produto e uso

O destaque não deve ser confundido com uma linha filtrada da lista; explicitar que respeita o paciente selecionado. Fechar descarta o cadastro ainda não confirmado, como no prontuário.

## 14. Dependências e premissas

Escopo autorizado pela solicitação de refatoração. O padrão existente do prontuário orienta as escolhas locais de apresentação; a próxima consulta considera o paciente selecionado e ignora os filtros de período/grupo da lista, como o contexto do prontuário.

## 15. Perguntas em aberto

Nenhuma decisão material de produto ou conflito com Rules identificado.
