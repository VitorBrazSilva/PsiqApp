# TechSpec — Alinhamento das seções do prontuário

## Solução e responsabilidades existentes

Stack confirmada: React 19, TypeScript, CSS local, Vite, Vitest e Playwright. `features/registros-clinicos/PaginaProntuario` compõe as seções e os diálogos; `features/pacientes/DadosPaciente` apresenta o cadastro recebido; `features/analises/PainelAnaliseAtual` apresenta a análise. A composição mantém essas responsabilidades e os contratos atuais.

- **TS-001 — RF-001 / RNF-001:** em `src/styles.css`, usar o espaçamento comum do prontuário, colocar a análise na terceira linha da grade (após as abas) e ocupar a largura do contêiner sem centralização limitada a 1180 px. Conservar a medida legível de 70ch do texto e os breakpoints internos da análise. Remover a regra legada `white-space: nowrap` da descrição, que causou overflow de 97 px em 360 px na validação inicial.
- **TS-002 — RF-002 / RNF-001:** renderizar `PainelAnaliseAtual` somente em Histórico clínico e Análise de IA. Reutilizar `section-panel` e `details-grid` em `DadosPaciente`; remover a regra legada que escondia o primeiro bloco de contexto. Exibir o cadastro somente quando `paciente.id` corresponder à rota, evitando apresentar o cadastro anterior durante o carregamento de outro paciente. Em Dados pessoais, usar `display: contents` no contêiner dos diálogos, preservando suas ações sem reservar uma coluna ou linha vazia. No mobile, dar respiro ao conteúdo abaixo das abas.
- **TS-003 — RF-001/002 / RNF-001:** executar os checks frontend e os E2E afetados com API mock local, comparar medidas das seções e conferir capturas. O serviço atual em 5173 é Nginx/Compose: reconstruir somente o frontend e conferir as duas URLs fornecidas.

Correção visual solicitada no retorno do usuário: **TS-001 / AC-RF001-03** aplica os estilos SVG a `.evidence-link svg` nas duas apresentações (sem preenchimento, traço na cor do botão, extremidades arredondadas), com espaço entre ícone e rótulo. Remover o tamanho redundante específico de `.analysis-entry` para conservar a mesma escala dos ícones. Preservar os SVGs decorativos com `aria-hidden` e a ação do botão. Verificar por captura/estilos computados e E2E existente; nenhum teste novo para reproduzir CSS.

## Matriz de compatibilidade

| Rule / fonte | Módulo e responsabilidade | Compatibilidade | Verificação |
|---|---|---|---|
| architecture-boundaries; TECHNICAL §3/5/14 | features compõem e apresentam; shared contém apenas elementos transversais | Nenhum módulo, contrato ou dependência novo | Revisão do diff, typecheck e lint |
| product-invariants; clinical-ai-safety | PainelAnaliseAtual apresenta observações, evidências e limitações | Apenas condição de montagem e layout; conteúdo clínico intacto | E2E existente de histórico/evidências |
| clinical-data-privacy; BUSINESS §4 | DadosPaciente recebe o paciente corrente com CPF mascarado | Exibir os campos existentes sem consultas extras ou logs de conteúdo | E2E com paciente fictício e revisão |
| testing-quality | Suites frontend existentes | Checks e validação de comportamento/layout proporcionais ao escopo | Vitest, Playwright e build |
| documentation-maintenance | Fontes canônicas descrevem o produto implementado | Avaliar registro de apresentação da seção cadastral em TECHNICAL §14 | Revisão documental |

## Verificação e riscos

Validar cabeçalho/abas estáveis, bordas e ausência de linha vazia da análise em 360/768/1024/1440/1920 px; cadastro visível, queixa ausente, ausência de painel IA e ações/diálogos acessíveis em Dados pessoais. Cascata CSS e contêiner de diálogos são os riscos locais. Sem mudanças de API, banco, backend, provider ou regras clínicas; checks backend e migrations não se aplicam. Não há verificação arquitetural frontend automatizada além de typecheck/lint; a compatibilidade de responsabilidades será revisada manualmente.
