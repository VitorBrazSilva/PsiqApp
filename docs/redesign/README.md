# Estudo de UX/UI do PsiqApp

Status: direção A — Foco clínico escolhida pelo usuário. Protótipo revisado em 23 de setembro de 2026 para incluir cadastro de pacientes e reproduzir a relação entre itens da análise e suas evidências. O frontend funcional do MVP não foi alterado.

## Abrir a comparação

Abra `index.html` no navegador, ou execute na raiz do repositório:

```powershell
python -m http.server 4174 --bind 127.0.0.1 --directory docs/redesign
```

Endereço: http://127.0.0.1:4174/

- [A — Foco clínico](index.html?direcao=foco): navegação lateral, histórico e análise lado a lado.
- [B — Leitura serena](index.html?direcao=leitura): referência arquivada da exploração inicial; a direção escolhida é A.
- [Cadastro de pacientes](index.html?direcao=foco&tela=pacientes): “Novo paciente”, formulário e abertura do prontuário.
- [Análise de IA completa](index.html?direcao=foco&secao=analise): listas de observações com evidências individuais.
- [Contrato de análise verificado](analise-ia.md).
- [Diagnóstico e prioridades](diagnostico.md).
- [Decisões visuais propostas](DESIGN.md).

O exemplo inicial usa Helena e três pareceres fictícios. É possível cadastrar outros pacientes fictícios com prontuários inicialmente vazios. Não há conexão com APIs, banco de dados, provedores de IA, fontes externas ou serviços de telemetria. Os dados simulados existem apenas em memória e desaparecem ao recarregar. Este comportamento de demonstração não define a política de armazenamento da futura aplicação.

## Roteiro de avaliação

1. Abra o prontuário e identifique o último parecer e a próxima consulta.
2. Abra os grupos da análise de IA: três itens de linha do tempo, dois padrões observados e três pontos de atenção. Cada observação tem suas próprias evidências.
3. Compare as duas observações em “Padrões observados”: os conjuntos de registros e as citações são diferentes. Abra uma evidência, o registro completo com o trecho destacado e volte à observação. Confira também uma evidência do campo Estado/humor.
4. Abra “Novo parecer”, escreva texto fictício e simule o salvamento.
5. Acrescente um complemento a um parecer anterior e confira que o original permanece disponível.
6. Em Pacientes, use “Novo paciente” e “Preencher exemplo fictício”. Cadastre e confira que o novo prontuário não contém registros ou análise de Helena.
7. Reduza a janela para avaliar a adaptação ao celular.

Avalie especialmente: facilidade de encontrar informações, conforto para ler, clareza das ações e vínculo inequívoco entre cada observação da IA e seus registros de origem. A direção A é a base escolhida.

## Escopo do protótipo

Implementado para exploração: cadastro com nome, CPF, nascimento, telefone, e-mail e queixa inicial opcional; validação dos obrigatórios, CPF/dígitos verificadores/unicidade, nascimento futuro, telefone e e-mail; busca por nome; prontuário vazio para recém-cadastrados; histórico com três pareceres iniciais; agenda demonstrativa, agendamento e status; novo parecer, complemento, análise com múltiplos itens por seção e evidências por item; navegação por URL, retorno pelo navegador e rascunhos temporários.

Ao clicar nas evidências de uma observação, somente seu conjunto de citações é apresentado. Cada evidência identifica o registro, o campo e a citação literal. O registro completo destaca o trecho no campo correspondente e oferece retorno às evidências e ao histórico. O painel lateral usa grupos expansíveis com contagem de itens; na seção completa os grupos começam abertos. Nenhum item é truncado por limite fixo na renderização.

Os campos opcionais digitados são preservados no registro simulado. Os registros, consultas e rascunhos são separados por paciente; o rascunho clínico também é separado por parecer/complemento. O fechamento pelo botão ou Escape conserva os rascunhos clínicos e de cadastro em memória. Atualizar ou fechar a página pode descartá-los, com aviso de navegação quando aplicável.

Não implementado nesta etapa: edição cadastral, integração com backend, geração real de IA, armazenamento persistente, lista volumosa de registros ou todos os estados de falha/carregamento do produto. A marca desenhada é uma proposta provisória.

## Verificação

- Sintaxe de `prototipos.js` validada com `node --check`.
- Renderização em Chromium de teste, com capturas desktop e mobile inspecionadas.
- Duas direções verificadas em 375, 768, 1024 e 1440 px, sem transbordamento horizontal.
- Fluxos exercitados: evidências, Escape e retorno de foco, validação do texto obrigatório, rascunho, novo parecer, complemento preservando original, troca A/B preservando sessão, retorno à fonte, agendamento, status definitivo e busca vazia/com resultado.
- Nenhum erro JavaScript observado nesses fluxos.
- Revisão de 23/09: oito observações com dez vínculos de evidência verificados individualmente, campo HUMOR/citação/registro completo/retorno, cadastro obrigatório e CPF duplicado, prontuário vazio e isolamento entre dois pacientes fictícios. Sem chamadas externas.
- Revisão responsiva de 23/09: histórico, análise completa e lista de pacientes em ambas as direções nas quatro larguras acima (24 combinações), além do formulário de cadastro (oito combinações), sem transbordamento horizontal. As dez citações foram conferidas também no destaque do registro completo. Capturas atualizadas da direção A, cadastro e evidências inspecionadas.

Esta verificação cobre o protótipo, não equivale a uma auditoria completa de acessibilidade nem a validação da integração clínica. Os checks de backend e frontend do MVP não foram necessários nesta etapa porque o código desses aplicativos não mudou.

## Próxima etapa

Aplicar a direção A escolhida aos componentes reais em React, documentando PRD/TechSpec/tasks de redesign conforme o workflow SDD do repositório. Preservar o cadastro existente e o contrato de listas/evidências da análise. Incluir os estados de erro e carregamento e a regressão dos fluxos existentes. A presente revisão corrige o protótipo; não corresponde a essa migração.
