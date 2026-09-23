# Diagnóstico inicial de UX/UI

Data: 22 de setembro de 2026. Base: código do frontend e documentação de negócio. São hipóteses de usabilidade fundamentadas na estrutura implementada; ainda não houve observação de um médico utilizando o MVP nem medição de tempo de tarefa. As telas propostas foram verificadas no navegador de teste separadamente do aplicativo funcional.

## Objetivo da experiência

Apoiar o médico em três momentos: preparar a consulta, registrar o atendimento e acompanhar o histórico. A revisão longitudinal é um objetivo explícito do produto. O prontuário deve permitir localizar o relato original e conferir as evidências da IA com pouco esforço.

## Achados

| Prioridade | Evidência no frontend atual | Consequência provável | Direção proposta |
|---|---|---|---|
| Alta | `PaginaProntuario.tsx:87–132`: dados, consultas, dois formulários, timeline, análise e histórico de gerações em sequência | A leitura clínica compete com tarefas de cadastro; a análise fica depois de todo o histórico | Identidade compacta; navegação interna; formulários abertos por ação; análise lado a lado ou em seção dedicada |
| Alta | `PaginaPacientes.tsx:22–31`: listagem e cadastro sempre visíveis em duas colunas | Cadastro ocupa espaço durante a tarefa mais frequente de encontrar um paciente | Busca/lista como foco; cadastro iniciado por “Novo paciente” na implementação posterior |
| Alta | `FormularioPaciente.tsx:47,52`: dois erros de campos diferentes são agrupados com `??` | Quando ambos são inválidos, somente um erro aparece; a ligação campo/mensagem fica ambígua | Mensagens individuais, `aria-describedby`, `aria-invalid` e foco no primeiro erro |
| Média | `FormularioPaciente.tsx:41–53`: telefone/e-mail sem tipos específicos ou autocomplete; erros sem associação explícita | Preenchimento e recuperação de erros menos confortáveis, especialmente no celular | Tipos e preenchimento automático apropriados; rótulos, exemplos e validação acessível |
| Média | `HistoricoGeracoes.tsx:17–18` e `PainelAnaliseAtual.tsx:62`: enum e “snapshot” apresentados diretamente | Linguagem técnica toma o lugar do estado compreensível para o médico | “Em processamento”, “Atualizada”, “Não foi possível atualizar” e data/conteúdo da versão |
| Média | `styles.css:15,50,67–71`: grade dupla só vira coluna única em 480 px | Faixa intermediária pode ficar apertada; precisa de verificação visual dedicada | Navegação e colunas adaptadas em larguras intermediárias, priorizando leitura |
| Média | `styles.css:1–66`: cores, espaçamentos e geometria repetidos em seletores globais | Ajustar a identidade e manter hierarquia entre componentes exige alterações dispersas | Variáveis semânticas, componentes reutilizáveis e escala de espaçamento |
| Média | `PaginaProntuario.tsx:47–54`: entrada sem paciente mostra estado vazio e manda voltar a Pacientes | A navegação global oferece uma página sem contexto útil | Acessar o prontuário pelo paciente; preservar identidade e caminho de retorno |

Os números de linha se referem à versão inspecionada antes do redesign, em `apps/frontend/src/`. Nenhum desses arquivos foi modificado nesta etapa.

## Reorganização proposta

```text
Pacientes
  → Buscar e abrir paciente
    → Prontuário com identidade do paciente
      → Histórico clínico
      → Análise de IA → evidência → registro original
      → Consultas
      → Dados pessoais
      → Novo parecer / complemento contextual
Agenda
  → Consultas e acesso ao contexto do paciente
```

O protótipo explora o prontuário com recortes de Pacientes e Agenda. A agenda completa e o cadastro de pacientes serão detalhados após a escolha da direção.

## Invariantes incorporadas à proposta

- Registro original permanece como fonte clínica; complemento cria novo registro.
- Conteúdo da IA tem identificação, referência aos registros e limitações visíveis.
- Parecer salvo não depende de conclusão da IA; versão anterior continua identificada quando há novos registros.
- Data clínica e data de registro têm rótulos distintos.
- Mudança para status final de consulta é explícita e não oferece reversão inexistente.
- Dados usados para demonstração são fictícios.

## Critérios de avaliação com o usuário

| Tarefa | O que observar |
|---|---|
| Encontrar e abrir paciente | Caminho previsível e preservação da busca ao retornar |
| Preparar uma consulta | Facilidade de localizar último registro, próxima consulta e análise atual |
| Conferir uma observação da IA | Evidência acessível e retorno ao texto original mantendo contexto |
| Registrar um parecer | Espaço para escrever, rótulos claros, confirmação de sucesso e preservação do rascunho |
| Complementar um parecer | Vínculo com o original compreensível e ausência de edição destrutiva |

Medir o fluxo atual e o escolhido com o mesmo conjunto fictício antes de prometer redução de tempo ou cliques.
