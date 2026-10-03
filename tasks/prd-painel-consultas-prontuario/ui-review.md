# UI Review — Arquivos alterados

Fonte consultada em 2026-10-03: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Revisão limitada à composição alterada e seus novos controles.

## Complemento — agendamento e grupos

Guidelines consultadas novamente para o complemento, junto ao guidance de frontend-design e ui-ux-pro-max já aplicado à feature.

- `FormularioConsulta.tsx`: ✓ pass — nome/e-mail destacados, instrução próxima das etapas, revisão sem dados inventados e setas decorativas; ações nos extremos, visíveis após rolagem.
- `CalendarioDisponibilidade.tsx` / `HorariosDisponiveis.tsx`: ✓ pass — ícones com texto, botões de mês nomeados, informação/duração/fuso, radios nativos com alvo completo e foco; três períodos com cores da referência.
- `IconeAgendamento.tsx`: ✓ pass — SVGs dimensionados e ocultos da árvore acessível.
- `styles.css`: ✓ pass — conectores, hover consistente, grades responsivas, quebra de nome/e-mail, alvos ≥44 px, overscroll contido e áreas seguras no diálogo; sem animação nova.

Imagens do topo/rodapé nas quatro larguras e da URL local em 1440/360 px inspecionadas. Desktop organiza calendário/horários em colunas; mobile empilha e mantém Voltar/confirmar lado a lado. Sem overflow ou sobreposição. Observações e modo manual existentes continuam disponíveis; idade, tipo e horários ocupados da imagem não foram fabricados.

## ProximaConsulta.tsx

✓ pass — navegação por Link; região nomeada, time semântico, ícones decorativos ocultos, fuso explícito.

## ResumoConsultas.tsx

✓ pass — aside com heading; dl/dt/dd; erro com ação; status de carregamento; atualização anunciada; números localizados; ausência de dados explícita.

## PaginaProntuario.tsx / ListaConsultas.tsx

✓ pass — painel nomeado; ação com nome acessível contendo texto visível; diálogo existente com Escape e retorno de foco; datas compactas no prontuário e metadados da Agenda preservados.

## styles.css

✓ pass — grade/flex; min-width e quebra de conteúdo; alvos de 44 px; foco existente preservado; SVG dimensionado; nenhuma animação nova; screenshots sem overflow nas quatro larguras.

Não representa auditoria WCAG completa das áreas fora do diff. Os controles de período, grupos e demais fluxos existentes não foram redesenhados nesta revisão.
