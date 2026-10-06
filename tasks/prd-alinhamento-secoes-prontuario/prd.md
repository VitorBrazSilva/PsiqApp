# PRD — Alinhamento das seções do prontuário

## Problema e objetivo

O médico precisa encontrar o conteúdo de Análise de IA alinhado às demais seções e consultar os dados pessoais cadastrados. Na seção Dados pessoais, o cadastro não aparece e uma análise de IA ocupa a lateral direita.

Escopo autorizado pelas duas solicitações do usuário na conversa de 05/10/2026. Uma tarefa única de correção da apresentação do prontuário; sem decisões de negócio pendentes.

## Requisitos e aceite

- **RF-001:** alinhar a seção Análise de IA ao cabeçalho e à navegação comuns do prontuário.
  - **AC-RF001-01:** ao alternar entre seções, o cabeçalho e as abas conservam a mesma posição; o conteúdo da análise usa as mesmas bordas laterais, inclusive em telas largas.
  - **AC-RF001-02:** a análise começa após as abas sem uma linha vazia adicional; categorias, evidências, histórico e limites continuam acessíveis.
  - **AC-RF001-03:** os ícones de ligação e navegação das evidências são legíveis, consistentes nas visões completa e lateral e separados do rótulo; abrir a evidência continua funcionando.
- **RF-002:** exibir os dados pessoais do paciente da rota na seção Dados pessoais.
  - **AC-RF002-01:** nome, CPF mascarado, nascimento, telefone, e-mail e queixa inicial cadastrados ficam visíveis; queixa ausente aparece como “Não informada”.
  - **AC-RF002-02:** a seção não apresenta o painel de Análise de IA; as ações de agendar consulta e novo parecer continuam disponíveis.
- **RNF-001:** preservar responsividade, navegação semântica e privacidade.
  - Verificar 360/768/1024/1440/1920 px sem overflow horizontal; usar apenas os dados já retornados para o paciente e fixtures fictícias.

## Regras, premissas e limites

Usar os termos de `docs/BUSINESS.md`, seção 3. Preservar CPF mascarado e identificação do paciente da rota. Registros clínicos, geração, conteúdo e limitações da análise não mudam. Fora do escopo: edição cadastral, backend, persistência, integrações e reformulação das demais telas. Não há conflitos com Rules nem alteração arquitetural proposta.
