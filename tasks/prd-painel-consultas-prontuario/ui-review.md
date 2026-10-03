# UI Review — Arquivos alterados

Fonte consultada em 2026-10-03: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Revisão limitada à composição alterada e seus novos controles.

## ProximaConsulta.tsx

✓ pass — navegação por Link; região nomeada, time semântico, ícones decorativos ocultos, fuso explícito.

## ResumoConsultas.tsx

✓ pass — aside com heading; dl/dt/dd; erro com ação; status de carregamento; atualização anunciada; números localizados; ausência de dados explícita.

## PaginaProntuario.tsx / ListaConsultas.tsx

✓ pass — painel nomeado; ação com nome acessível contendo texto visível; diálogo existente com Escape e retorno de foco; datas compactas no prontuário e metadados da Agenda preservados.

## styles.css

✓ pass — grade/flex; min-width e quebra de conteúdo; alvos de 44 px; foco existente preservado; SVG dimensionado; nenhuma animação nova; screenshots sem overflow nas quatro larguras.

Não representa auditoria WCAG completa das áreas fora do diff. Os controles de período, grupos e demais fluxos existentes não foram redesenhados nesta revisão.
