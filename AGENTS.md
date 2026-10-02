# Instruções do repositório — PsiqApp

Estas instruções são a entrada para agentes que trabalham neste repositório. Elas apontam para as fontes canônicas; não duplicam as regras do produto nem a documentação da arquitetura.

## Antes de trabalhar

1. Leia `sdd-workflow/workflow.md` para seguir as etapas e os gates do SDD.
2. Leia `.agents/rules/README.md` e, em seguida, as Rules aplicáveis à mudança. Não trate Rules não relacionadas como requisito do produto.
3. Leia os artefatos SDD da feature ativa: PRD, TechSpec, Tasks, reviews e evidências existentes em `tasks/prd-[feature-slug]/`.
4. Consulte apenas as partes pertinentes da documentação vigente:
   - `docs/BUSINESS.md`, especialmente a seção 3 para a linguagem ubíqua e o glossário;
   - `docs/TECHNICAL.md`, especialmente as seções 3 e 5 para a estrutura e as fronteiras arquiteturais, além das seções dos componentes afetados;
   - `README.md` para configuração, execução e verificações operacionais.
5. Leia o código e os testes diretamente afetados para confirmar o comportamento atual.

Planos, requisitos, tasks, reviews e relatórios específicos de uma feature ficam em `tasks/prd-[feature-slug]/` e são versionados enquanto a feature estiver em andamento. Cada commit de implementação permanece ligado à task correspondente e inclui seus artefatos SDD afetados. Esses arquivos documentam o trabalho da feature, não o estado atual do produto; mantenha-os separados de `docs/` e não os referencie nas fontes canônicas. Ao alcançar `READY`, depois da última task, do QA, das revisões finais e da atualização das fontes canônicas aplicáveis, informe que a pasta está elegível para exclusão. Não apague a pasta ao concluir uma task intermediária nem exija artefatos de features encerradas para entender o estado atual.

## Preservação do projeto

- Rules são invariantes do projeto. Se uma solicitação, especificação ou implementação conflitar com uma Rule, não resolva o conflito silenciosamente: registre-o e obtenha uma decisão explícita antes de implementar a mudança conflitante.
- Planos técnicos de mudanças arquiteturais devem identificar módulos afetados, responsabilidades atuais, Rules aplicáveis, compatibilidade proposta e verificações pertinentes. Mudanças em responsabilidades, direção de dependências, fronteiras ou convenções globais exigem decisão explícita antes da implementação; atualize as Rules e `docs/TECHNICAL.md` quando a decisão aprovada alterar uma regra ou a arquitetura registrada.
- Use os termos de domínio definidos em `docs/BUSINESS.md`. A convenção de nomenclatura técnica ainda é parcial: não deduza uma regra global de nomes a partir de exemplos inconsistentes. Quando uma mudança definir uma convenção compartilhada, registre-a nas fontes canônicas após a decisão.
- Confirme a documentação nos trechos de código e testes diretamente afetados. Se encontrar divergência entre a arquitetura documentada e a implementação, registre-a; não amplie a divergência nem faça uma refatoração geral fora do escopo aprovado.

## Exploração focada

Use a documentação e o mapa de responsabilidades para localizar os módulos relevantes. Leia o código e os testes impactados e amplie a exploração somente quando uma dependência ou evidência exigir. Não é necessário ler todo o repositório para cada feature.

