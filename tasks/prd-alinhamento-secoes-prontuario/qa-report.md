# QA — Alinhamento das seções do prontuário

## Status

APROVADO — 05/10/2026. Código final validado em Chromium, Vite e frontend Nginx/Compose atualizado na porta 5173.

## Matriz de rastreabilidade

| Requisito / AC | Verificação | Resultado / evidência |
|---|---|---|
| RF-001 / AC-RF001-01 | E2E alterna Dados pessoais, Histórico clínico, Consultas e Análise, comparando cabeçalho/abas; mede conteúdo da Análise contra o cadastro | PASS em 360/768/1024/1440/1920 px; `analysis-redesign.spec.ts` |
| RF-001 / AC-RF001-02 | E2E compara posição vertical do conteúdo e testa versões, teclado e fontes; inspeção das capturas | PASS; linha vazia removida, três categorias e limites preservados |
| RF-001 / AC-RF001-03 | Capturas/estilos computados do SVG e abertura/fechamento das evidências nas visões completa/lateral, em 360/1440 px | PASS; `evidencias/icone-evidencias-5173.json` e quatro capturas do botão |
| RF-002 / AC-RF002-01 | E2E verifica seis campos e queixa ausente; Vitest troca a rota com resposta cadastral pendente | PASS; CPF mascarado; não apresenta cadastro anterior enquanto aguarda o novo paciente |
| RF-002 / AC-RF002-02 | E2E exige ausência de `.analise`, abre/fecha agendamento e parecer, verifica retorno de foco do agendamento | PASS |
| RNF-001 | E2E exige largura do documento menor ou igual ao viewport e confere cinco larguras | PASS; captura mobile e desktop inspecionadas |
| RF-001/002 / RNF-001 / TS-003 | Verificação de leitura das URLs originais em 5173 com o paciente fictício informado | PASS em 360/1440/1920 px; quatro PNGs e `evidencias/layout-5173.json` |

## Checks executados

- `npm test -- --run`: 10 arquivos, 86 testes aprovados na versão base da correção.
- Após adicionar a proteção de identidade da rota: `npm test -- --run src/features/registros-clinicos/PaginaProntuario.test.tsx`: 14 testes aprovados, incluindo o cenário novo.
- `npm run lint`: aprovado na versão final.
- `npm run build`: typecheck e build aprovados na versão final; build do container também aprovado.
- `$env:E2E_BASE_URL = 'http://127.0.0.1:5174'; npm run e2e -- e2e/analysis-redesign.spec.ts`: três testes aprovados na versão final, em 9,6 s. API interceptada localmente, sem mutações reais.
- `docker compose --env-file .env -f infra/compose.yaml up -d --build --no-deps --force-recreate frontend`: frontend reconstruído e iniciado. Somente esse serviço foi atualizado.
- `git diff --check`: aprovado.

## Evidência do ambiente solicitado

No frontend atualizado em 5173, cadastro e análise têm posições/larguras iguais:

| Viewport | x | y | Largura de conteúdo | Largura do documento |
|---|---|---|---|---|
| 360 | 18 | 479,42 | 324 | 360 |
| 1440 | 248 | 325 | 1154 | 1440 |
| 1920 | 363 | 325 | 1404 | 1920 |

`evidencias/dados-360.png`, `dados-1440.png`, `analise-360.png` e `analise-1440.png` registram as URLs fornecidas. Seis campos pessoais, CPF mascarado e ausência do painel IA foram conferidos; nenhuma geração real foi solicitada.

## Segurança, fronteiras e limites da validação

Dados de teste e demonstração fictícios; nenhuma alteração em registros, persistência, APIs ou provider. A identidade do painel cadastral é conferida antes da exibição. Compatibilidade arquitetural frontend revisada manualmente, com typecheck/lint; não existe um novo teste arquitetural. Backend, migrations e provider externo não foram executados porque não mudaram. A validação visual foi em Chromium.

A queixa inicial da massa já existente em 5173 contém caracteres `?` no texto retornado pela API. O painel conserva o valor cadastrado; nenhuma correção foi inferida ou gravada sobre essa massa. A fixture E2E com texto acentuado renderiza corretamente. Trata-se de qualidade da massa local, fora desta correção de apresentação.

## Bugs e veredito

Problemas reproduzidos e corrigidos em `bugs.md`. Nenhum bloqueador pendente para o escopo. Reviews de task/código revalidados após a proteção da rota e manutenção documental concluída.

## Revalidação do ícone das evidências

- Causa confirmada em 5173: SVG da visão completa com preenchimento preto, sem traço e sem espaço entre ícone/texto; regra correta limitada ao painel lateral.
- `npm run lint` e `npm run build`: aprovados, incluindo typecheck; build/recriação somente do frontend Compose concluídos.
- Playwright `analysis-redesign.spec.ts` em 5174: três testes aprovados em 19,9 s, preservando alinhamento, cadastro e navegação das evidências. Não houve alteração de lógica; testes Vitest não foram repetidos para este diff somente de CSS.
- Em 5173, duas apresentações e duas larguras verificadas: SVG sem preenchimento, traço `rgb(40, 92, 71)`/1,7 px, dimensões 14/12 px, `aria-hidden="true"`, espaço de 6 px e ausência de overflow. Diálogo de evidências aberto e fechado em todos os quatro casos.
- Capturas `icone-evidencias-analise-360.png`, `icone-evidencias-analise-1440.png`, `icone-evidencias-historico-360.png` e `icone-evidencias-historico-1440.png` inspecionadas. Detalhes técnicos em `icone-evidencias-5173.json`.
- Task/code review, documentação e segurança clínica revalidados. AC-RF001-03 atendido; QA permanece APROVADO.
