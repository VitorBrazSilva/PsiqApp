# Instruções do repositório — PsiqApp

Estas instruções são a entrada para agentes que trabalham neste repositório. Elas apontam para as fontes canônicas; não duplicam as regras do produto nem a documentação da arquitetura.

## Antes de trabalhar

1. Leia `sdd-workflow/workflow.md` para seguir as etapas e os gates do SDD.
2. Leia `.agents/rules/README.md` e, em seguida, as Rules aplicáveis à tarefa. Não trate Rules não relacionadas como requisito da feature.
3. Leia os artefatos SDD da feature: PRD, TechSpec, Tasks, reviews e evidências que já existirem.
4. Consulte apenas as partes pertinentes da documentação viva:
   - `docs/BUSINESS.md`, especialmente a seção 3 para a linguagem ubíqua e o glossário;
   - `docs/TECHNICAL.md`, especialmente as seções 3 e 5 para a estrutura e as fronteiras arquiteturais, além das seções dos componentes afetados;
   - `README.md` para configuração, execução e verificações operacionais.

## Preservação do projeto

- Rules são invariantes do projeto. Se uma solicitação, especificação ou implementação conflitar com uma Rule, não resolva o conflito silenciosamente: registre-o e obtenha uma decisão explícita antes de implementar a mudança conflitante.
- A TechSpec deve identificar módulos afetados, suas responsabilidades atuais, Rules aplicáveis, compatibilidade da proposta e como a compatibilidade será verificada.
- Mudanças em responsabilidades, direção de dependências, fronteiras ou convenções globais precisam ser decisões explícitas na TechSpec. Atualize as Rules e `docs/TECHNICAL.md` quando uma decisão aprovada alterar uma regra ou a arquitetura registrada.
- Use os termos de domínio definidos em `docs/BUSINESS.md`. `docs/TECHNICAL.md` registra que a convenção de nomenclatura técnica ainda é parcial: não deduza uma regra global de nomes a partir de exemplos inconsistentes. Quando uma feature precisar definir uma convenção compartilhada ainda ausente, registre a decisão na TechSpec e atualize a documentação após sua aprovação.
- Confirme a documentação nos trechos de código e testes diretamente afetados. Se encontrar divergência entre a arquitetura documentada e a implementação, registre-a; não amplie a divergência nem faça uma refatoração geral fora do escopo aprovado.

## Exploração focada

Use a documentação e o mapa de responsabilidades para localizar os módulos relevantes. Leia o código e os testes impactados e amplie a exploração somente quando uma dependência ou evidência exigir. Não é necessário ler todo o repositório para cada feature.

