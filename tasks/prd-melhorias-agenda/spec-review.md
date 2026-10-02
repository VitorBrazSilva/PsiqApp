# Spec Review — Busca de horários e organização da Agenda

## Status

APROVADO

## Resumo

Revisão reexecutada em 2026-10-02 conforme `sdd-workflow/spec-reviewer.md`, na etapa anterior à TechSpec, sobre o [prd.md](prd.md) atualizado com a decisão explícita do usuário sobre o alcance do agendamento.

O problema, a persona e os resultados esperados estão claros. O PRD contém cinco RFs, 28 ACs e dois RNFs, com IDs únicos. Define duração de uma hora, inícios a cada 30 minutos, todos os dias da semana, conflitos locais e Google, confirmação com nova verificação, grupos de consultas e filtro de período inclusivo. Também preserva consultas retroativas e o comportamento de sincronização posterior à criação.

A ambiguidade A-001 foi resolvida: o cadastro da consulta segue o mesmo fluxo na Agenda geral e dentro do prontuário. A única diferença é a identificação do paciente: fora do prontuário, a seleção é obrigatória; dentro dele, usa-se o paciente aberto sem solicitar nova escolha. Não há bloqueadores pendentes, contradições demonstradas ou violações explícitas das Rules aplicáveis. Os riscos registrados continuam pertinentes à TechSpec.

Foram consultados `AGENTS.md`, o workflow, as Rules e as seções pertinentes de `BUSINESS.md`, `TECHNICAL.md` e `README.md`. A inspeção de código e testes ficou limitada à Agenda, ao agendamento no prontuário, à listagem de consultas e à disponibilidade/criação com Google. Os testes existentes foram lidos; não foram executados nesta revisão de especificação.

## Bloqueadores

Nenhum bloqueador pendente. A-001 foi resolvida pela decisão do usuário e pela atualização dos requisitos e critérios de aceite.

## Ambiguidades

Nenhuma ambiguidade pendente.

### A-001 — Alcance da busca nos pontos de agendamento — resolvida

- **Categoria original:** Ambiguidade.
- **Situação:** resolvida nesta revisão; deixou de ser bloqueadora.
- **Decisão de produto:** o usuário definiu que o agendamento deve ser igual nos dois contextos, dispensando a escolha do paciente quando seu prontuário já está aberto e exigindo a seleção fora dele.
- **Cobertura no PRD:** §§ 1, 3, 6, 7 (Fluxo 1), 8 e 14. AC-RF001-07 explicita a busca nas duas origens; AC-RF002-04 verifica a igualdade do fluxo de horários; AC-RF003-01, AC-RF003-06 e AC-RF003-07 definem o paciente da confirmação e a obrigatoriedade ou dispensa da seleção conforme o contexto.
- **Compatibilidade com o contexto existente:** as duas telas já têm criação de consultas. [PaginaProntuario.tsx](../../apps/frontend/src/features/registros-clinicos/PaginaProntuario.tsx) e o teste `cria consulta usando o paciente atual apos navegar entre prontuarios`, em [PaginaProntuario.test.tsx](../../apps/frontend/src/features/registros-clinicos/PaginaProntuario.test.tsx), confirmam o uso atual do paciente do prontuário. A decisão estende a busca aos dois contextos sem alterar o isolamento exigido.
- **Limite com a TechSpec:** o comportamento está definido; a forma de compartilhar ou implementar esse fluxo continua sendo uma decisão técnica.

## Contradições

Nenhuma contradição demonstrável foi identificada entre trechos explícitos do PRD ou entre o PRD e as Rules aplicáveis.

Em particular, começar a busca hoje (AC-RF001-03 e AC-RF003-05) é compatível com preservar o cadastro retroativo pelo fluxo existente (AC-RF003-05 e § 12): são caminhos distintos expressamente descritos. Bloquear uma criação por falha de disponibilidade também é compatível com preservar a consulta após falha posterior de sincronização (AC-RF003-03 e AC-RF003-04): os critérios tratam momentos diferentes.

## Lacunas

Não foi identificada lacuna bloqueadora. O alcance de RF-001 a RF-003 e a identificação do paciente em cada origem estão definidos explicitamente.

A § 5 declara expressamente que não há meta numérica de redução de tempo. Isso não impede a TechSpec. Os RNFs têm critérios observáveis de privacidade e distinção de estados. APIs, estratégia de consulta mensal, paginação, cache, componentes e organização visual dos períodos do dia pertencem à TechSpec; sua ausência não foi tratada como lacuna de produto.

## Requisitos sem cobertura adequada

Nenhum requisito sem cobertura adequada foi identificado nesta revisão. As pendências de RF-001, RF-002 e RF-003 estão cobertas pelos ACs de alcance, igualdade do fluxo e identificação do paciente. RF-004 e RF-005 têm cobertura funcional adequada para os grupos, o isolamento por paciente e a aplicação conjunta do período e das contagens. Não foram encontrados RFs sem ACs, IDs duplicados ou requisitos órfãos. A ausência de testes da nova feature nesta etapa não é falta de cobertura do PRD; a ligação com testes será detalhada nas etapas seguintes.

## Riscos

### R-001 — Preservação do estado Google indisponível

**Categoria: Risco. Não bloqueador.** AC-RF001-06, AC-RF003-03 e RNF-002 distinguem falha Google de ausência de horários. Ao implementar “sem conexão Google ativa”, a TechSpec deve preservar a distinção atual entre integração ausente/desconectada e integração `INDISPONIVEL`. [VerificarDisponibilidadeConsultaUseCase.java](../../apps/backend/src/main/java/com/psiqapp/application/usecase/VerificarDisponibilidadeConsultaUseCase.java), linhas 40–43, e [CriarConsultaUseCase.java](../../apps/backend/src/main/java/com/psiqapp/application/usecase/CriarConsultaUseCase.java), linhas 77–79, bloqueiam esta última situação; ela não autoriza considerar o horário livre apenas pela agenda local. `BUSINESS.md`, § 4, também limita o uso somente local à ausência de conexão por escolha do médico. O contexto existente resolve o comportamento; recomenda-se cobri-lo expressamente na validação futura.

### R-002 — Limites de dia, mês e fuso

**Categoria: Risco. Não bloqueador.** RF-001 e a § 8 combinam inícios durante todo o dia com consultas de uma hora e fim exclusivo. A verificação precisa considerar o intervalo completo, inclusive quando ultrapassar a meia-noite ou o fim do mês, e distinguir horários passados para hoje. RF-005 deve incluir integralmente as datas das duas extremidades. A política existente de exibição em `America/Sao_Paulo` está em `TECHNICAL.md`, § 12, e em [ListaConsultas.tsx](../../apps/frontend/src/features/consultas/ListaConsultas.tsx). Recomenda-se levar esses cenários à matriz de verificação da TechSpec. Não é necessário definir representação interna ou algoritmo no PRD.

### R-003 — Custo e tempo da busca mensal

**Categoria: Risco. Não bloqueador.** Consultar o dia inteiro com inícios a cada 30 minutos aumenta o trabalho em relação à verificação atual de um único horário. A TechSpec deve avaliar a estratégia de consulta às fontes local e Google e os estados da busca, preservando RF-001, RF-002 e RNF-002. Não se exige biblioteca, quantidade de chamadas ou meta de latência ausente do PRD.

### R-004 — Contagens e registros além da página carregada

**Categoria: Risco. Não bloqueador.** A listagem atual é paginada. A Agenda usa páginas de 50 consultas e o prontuário carrega inicialmente uma página pelo [servicoConsultas.ts](../../apps/frontend/src/features/consultas/servicoConsultas.ts). Agrupar somente essa página pode deixar consultas de um grupo inacessíveis ou produzir contagens parciais. A TechSpec deve assegurar o comportamento definido por AC-RF004-01, AC-RF004-05 e AC-RF005-03 com conjuntos maiores que uma página, sem exigir uma estratégia específica de paginação no PRD.

### R-005 — Diferença entre o contexto narrado e os filtros existentes

**Categoria: Risco. Não bloqueador.** A motivação da § 2 não registra que a Agenda geral já contém filtro de paciente e campos “De”/“Até” em [PaginaAgenda.tsx](../../apps/frontend/src/features/consultas/PaginaAgenda.tsx), linhas 143–152. A inspeção estática também mostra que os valores de data são enviados diretamente pelo frontend, enquanto [ConsultaController.java](../../apps/backend/src/main/java/com/psiqapp/adapter/in/web/ConsultaController.java), linhas 51–53, recebe os limites como `Instant`. Essa diferença de contrato deve ser considerada no trabalho de RF-005. Não foi executado um teste de reprodução desse fluxo. Recomenda-se descrever a mudança como evolução dos filtros existentes na Agenda e inclusão no prontuário; não há contradição de requisitos nem necessidade de refatoração fora do escopo.

## Rastreabilidade

- **RFs com IDs únicos: SIM.** RF-001 a RF-005; nenhum ID duplicado.
- **ACs verificáveis: SIM.** 28 ACs identificados e observáveis, incluindo o alcance nas duas telas e a identificação do paciente em cada origem.
- **RNFs mensuráveis: SIM.** RNF-001 e RNF-002 possuem verificações binárias de exposição de dados e apresentação dos estados.
- **Rules críticas cobertas: SIM.** O PRD reconhece dados fictícios, isolamento por paciente e minimização dos dados de disponibilidade. Nenhuma violação explícita foi encontrada; a cobertura de implementação ainda será verificada nas etapas seguintes.

| Rule | Aplicação e evidência no PRD |
|---|---|
| `product-invariants.md` | Não altera fonte clínica, persistência ou análises; § 12 exclui mudanças clínicas e geração por IA. |
| `clinical-data-privacy.md` | Dados fictícios nas §§ 3 e 8; paciente da confirmação em AC-RF003-01, AC-RF003-06 e AC-RF003-07; listas e contagens isoladas em AC-RF004-05; privacidade em RNF-001; minimização na § 11. As proibições de logs e secrets continuam aplicáveis pela referência às regras atuais. |
| `clinical-ai-safety.md` | Consultada por envolver uma tela de prontuário. Sem comportamento de IA alterado; não exige novos requisitos de análise clínica nesta feature. |
| `architecture-boundaries.md` | Não há decisão arquitetural imposta pelo PRD. A compatibilidade dos módulos afetados deverá ser registrada na TechSpec, conforme o workflow. |
| `testing-quality.md` | RFs e ACs identificados permitem a ligação futura com tasks, código, testes e evidências. A inspeção dos testes existentes confirma contratos atuais, sem declarar execução ou aprovação da implementação futura. |
| `documentation-maintenance.md` | O relatório permanece na pasta da feature. As fontes canônicas descrevem o estado atual e deverão ser avaliadas após a implementação das mudanças de comportamento. |

## Checklist de integridade do review

- [x] Toda contradição possui dois ou mais trechos explícitos identificados — nenhuma contradição foi apontada.
- [x] Nenhuma lacuna foi classificada como contradição.
- [x] Nenhum requisito foi inferido sem fonte explícita.
- [x] Nenhuma decisão puramente técnica foi exigida como requisito de produto.
- [x] Rules aplicáveis foram consideradas.
- [x] Todo bloqueador exige realmente uma decisão de produto, domínio ou comportamento funcional.

## Veredito

**APROVADO.** A-001 foi resolvida com a decisão explícita do usuário e a atualização dos requisitos, ACs, jornada e regras de negócio. A TechSpec pode ser criada sem inventar o alcance do agendamento ou a identificação do paciente em cada contexto. Os riscos R-001 a R-005 devem ser considerados na TechSpec e nas verificações posteriores; não são bloqueadores de aprovação do PRD. Esta aprovação é da especificação, não da implementação da feature.
