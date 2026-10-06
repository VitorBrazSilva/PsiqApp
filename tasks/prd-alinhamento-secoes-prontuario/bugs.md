# Bugs — Alinhamento das seções do prontuário

Todos corrigidos e validados:

1. **Cadastro oculto:** em `?secao=dados`, `.contexto-paciente > .bloco:first-of-type` escondia os campos. Apresentação recuperada em painel semântico e remoção da regra legada.
2. **Análise na lateral de Dados pessoais:** painel montado em todas as seções exceto Consultas; uma regra `div:last-child` prevalecia sobre a ocultação. Montagem restrita às duas seções clínicas; contêiner de diálogos sem reserva de linha/coluna no cadastro.
3. **Alinhamento da Análise:** `row-gap: 20px`, linha 4 e limite centralizado de 1180 px diferenciavam cabeçalho/abas/conteúdo. Espaçamento comum, terceira linha e largura integral restaurados.
4. **Overflow mobile:** o primeiro E2E em 360 px mediu documento de 457 px. A descrição usava `white-space: nowrap`; regra removida. Na execução final, documento de 360 px.
5. **Cadastro anterior durante troca de rota:** o estado do paciente pode aguardar a nova leitura. O painel pessoal agora só é apresentado quando a identidade corresponde à rota; teste com resposta pendente aprovado.
6. **Ícone das evidências preenchido:** na visão completa, SVGs tinham preenchimento preto/sem traço porque os estilos estavam limitados a `.analysis-observation`. Estilo comum de `.evidence-link svg` restaurou os traços verdes e a mesma escala nas duas apresentações; espaço de 6 px adicionado. Capturas, estilos computados e ação validados em 5173.
