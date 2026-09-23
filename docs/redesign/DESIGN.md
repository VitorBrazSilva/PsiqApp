# PsiqApp — Foco clínico

Status: direção A escolhida pelo usuário. Revisão de 23 de setembro de 2026: cadastro de pacientes incluído no protótipo e análise de IA corrigida para múltiplos itens com evidências próprias. Este documento não substitui as Rules, o PRD ou a TechSpec do MVP. A alternativa B permanece abaixo como histórico da exploração visual.

## Contexto

Ferramenta de apoio ao prontuário psiquiátrico para um médico em consultório. A informação clínica deve ser confortável de ler, as ações devem ser previsíveis e o resultado da IA deve permanecer distinguível da fonte original. Desktop é a hipótese inicial para trabalho prolongado; o protótipo também se adapta a celular. Confirmar o contexto de dispositivos na avaliação.

## Referências e uso de getdesign.md

[getdesign.md](https://getdesign.md/) é um catálogo de análises de sistemas visuais, não uma skill única. As análises são independentes e não representam necessariamente documentação oficial das marcas. Podem ser consultadas diretamente como material de referência.

Referências consultadas:

- [Linear](https://getdesign.md/linear.app/design-md): hierarquia por superfícies, uso comedido da cor de ação e geometria consistente. O arquivo analisado trata principalmente do site de marketing; não o tomamos como especificação do aplicativo da Linear.
- [Notion](https://getdesign.md/notion/design-md): separação de superfícies, organização de conteúdo e componentes. O arquivo atual também inclui padrões de marketing; a coluna de leitura e o título serifado da proposta B são decisões próprias para comparação, não reprodução de uma interface oficial da Notion.
- [Cal.com](https://getdesign.md/cal/design-md): referência complementar de linguagem visual simples para agenda, a aprofundar na etapa dessa tela.

Nenhuma fonte proprietária, logo ou identidade dessas empresas foi copiada. A adaptação seleciona princípios úteis à rotina clínica. Não foi instalada uma skill adicional nem um template comercial.

As skills `frontend-design`, `ui-ux-pro-max` e `web-design-guidelines` orientaram o planejamento, a interação e a revisão. A geração automática de sistema visual de `ui-ux-pro-max` foi consultada e refinada uma vez, mas sugeriu padrões de conversão/marketing incompatíveis com um prontuário interno. Esses padrões não foram adotados. A composição abaixo é uma proposta manual, apoiada nas regras de usabilidade pertinentes e no produto existente.

## Direção escolhida — A, Foco clínico

Hipótese: visualizar o histórico e a análise simultaneamente favorece a revisão antes do atendimento.

```text
Navegação lateral | Identidade + ações
                  | Seções do prontuário
                  | Próxima consulta
                  | Histórico clínico       | Análise de IA
                  | Registros originais     | Evidências e limites
```

| Papel | Valor |
|---|---|
| Fundo | `#F7F9F7` |
| Superfície | `#FFFFFF` |
| Texto principal | `#24382F` |
| Texto secundário | `#62716A` |
| Ação principal | `#285C47` |
| Superfície de apoio | `#F1F6F0` |

Tipografia: Segoe UI com alternativas nativas. Nome do paciente em 29 px; títulos em 18 px; texto de registro em 14 px com entrelinha ampla. A cor verde é concentrada em navegação, ações e apoio visual. O histórico usa marcadores temporais e a análise ocupa uma coluna diferenciada.

## Referência anterior — B, Leitura serena

Hipótese: ampliar o espaço de leitura e abrir a análise sob demanda favorece consultas com textos longos.

```text
Marca + navegação superior
Identidade do paciente + ações
Seções do prontuário
Contexto e próxima consulta | Histórico com textos mais amplos
Acesso à análise           | Registros originais
```

| Papel | Valor |
|---|---|
| Fundo | `#F4F5FA` |
| Superfície | `#FFFFFF` |
| Texto principal | `#29324B` |
| Texto secundário | `#626B80` |
| Ação principal | `#4B58A0` |
| Superfície de apoio | `#F2F3FC` |

Tipografia: Georgia apenas no nome do paciente, em 38 px; Segoe UI nos controles e no conteúdo clínico. Registros em 15 px com entrelinha de 1,85. A coluna lateral apresenta contexto cadastral e agendamento; a análise tem seção própria. A tipografia serifada está limitada à identidade, para não tornar os textos clínicos ornamentais.

## Regras compartilhadas

- Nome do paciente e contexto disponíveis antes das ações clínicas.
- “Novo parecer” é a ação principal; agendamento é secundário.
- Formulários abertos por intenção explícita, com rótulos, campos opcionais identificados e saída clara.
- Evidência abre o trecho de origem; é possível retornar ao registro no histórico.
- Linha do tempo resumida, padrões observados e pontos de atenção são listas. Cada item mantém texto, natureza e sua própria lista de evidências. Não fundir as evidências no nível da seção.
- O painel lateral usa grupos expansíveis e contagem de itens. Na página completa, os grupos começam abertos. Cada item oferece acesso à sua lista de citações.
- A visualização de evidências repete a observação de origem e apresenta data/registro, campo e citação literal. O registro completo destaca o trecho no campo correspondente.
- “Novo paciente” fica no cabeçalho de Pacientes. O cadastro usa os campos obrigatórios do MVP, erros individuais associados aos campos e abertura do novo prontuário após sucesso.
- IA identificada por texto, não apenas por cor ou ícone; limitações preservadas.
- Navegação com estados visíveis e refletidos na URL; voltar/avançar do navegador preserva a localização.
- Ícones vetoriais com traço uniforme; ilustrações e gráficos decorativos não fazem parte do prontuário.
- Foco de teclado visível, diálogo semântico, Escape e retorno ao acionador.
- Sem animação de entrada automática; transições de controles desativadas com preferência por movimento reduzido.
- Componentes com espaçamento consistente; texto e estados longos devem quebrar sem rolagem horizontal.
- Fontes nativas nesta comparação: o resultado funciona offline e não depende de serviços externos.

## Revisão da proposta contra o objetivo

A escolha evita a estrutura de página de marketing sugerida pela busca automática e prioriza tarefas de atendimento. Os painéis têm funções diferentes: documento original, contexto da consulta e leitura derivada por IA. As alternativas mudam a organização espacial, não apenas a paleta.

Limitações a resolver na implementação: volume de registros, filtros/paginação, preservação de rascunhos na navegação real, estados de carregamento/erro/vazio, integração com a API, formulários completos de pacientes e revisão abrangente de acessibilidade. A leitura com textos clínicos muito longos ainda precisa ser avaliada com casos fictícios representativos.

## Decisão registrada

O usuário escolheu a direção A. Também apontou duas lacunas no protótipo inicial: cadastro ausente e simplificação indevida da análise de IA. Ambas foram corrigidas na proposta navegável com base no contrato já existente. Próxima etapa: migração do frontend funcional para essa direção, preservando as relações de dados confirmadas.
