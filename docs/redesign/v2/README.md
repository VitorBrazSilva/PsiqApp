# Redesign v2 — análise do prontuário

Abra a [análise de Helena](index.html?direcao=foco&tela=prontuario&secao=analise&paciente=helena-demo) no navegador. O protótipo também funciona por `file://`, sem servidor.

Esta cópia preserva a estrutura e os fluxos do protótipo em `docs/redesign`. A mudança da v2 fica na tela completa de análise: as três categorias passam para uma navegação lateral com contagens, e a área de leitura mostra uma categoria por vez. No celular, os controles passam para uma faixa de seleção acima do conteúdo. Cada observação continua com seu vínculo às próprias evidências, e os limites da análise permanecem visíveis.

Os dados são fictícios. A demonstração não chama serviços de IA nem envia dados.

## Direção da experiência

A v2 reaproveita a identidade visual escolhida para o prontuário: fundo `#F7F9F7`, superfícies brancas, texto `#24382F`, verde de ação `#285C47` e Segoe UI. O ajuste de estrutura responde ao volume de conteúdo: em vez de empilhar três listas expansíveis, a tela mantém a categoria selecionada ao lado das observações daquela categoria.

```text
Paciente + abas do prontuário
Resumo da análise + ações
Categorias com contagem | Observações completas + evidências
                       | Limites da análise
```

O texto continua sem truncamento, com largura de leitura limitada. A categoria ativa tem estado visual e semântico; os controles preservam foco de teclado e ampliam a área de toque. Em telas estreitas, a seleção fica acima da lista para manter as três categorias acessíveis sem rolagem horizontal.

Para iniciar um servidor local na raiz do projeto:

```powershell
python -m http.server 4176 --bind 127.0.0.1 --directory docs/redesign/v2
```

Depois, abra `http://127.0.0.1:4176/index.html?direcao=foco&tela=prontuario&secao=analise&paciente=helena-demo`.
