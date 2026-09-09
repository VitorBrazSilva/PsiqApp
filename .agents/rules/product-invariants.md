# Product Invariants

## Purpose

Estas regras representam invariantes de produto do PsiqApp. Elas não podem ser alteradas implicitamente por uma Task, TechSpec, implementação ou refatoração.

## Rule precedence

Se uma nova solicitação, Task, TechSpec ou implementação conflitar com qualquer regra deste arquivo:

1. não implementar a mudança conflitante;
2. registrar claramente o conflito;
3. solicitar decisão explícita de produto/arquitetura;
4. atualizar primeiro PRD e Rules, quando aplicável;
5. somente depois atualizar TechSpec, Tasks e implementação.

## Invariants

- Os registros clínicos escritos pelo médico são a fonte clínica de verdade. Eles incluem pareceres originais e complementos.
- Parecer clínico é append-only no MVP.
- Um parecer já persistido nunca deve ser sobrescrito.
- Correções e complementos devem ser registrados como novos registros de correção ou adendo.
- O registro original deve permanecer preservado após qualquer correção ou adendo.
- Cada análise de IA concluída deve ser preservada historicamente.
- Uma análise de IA anterior nunca deve ser sobrescrita por uma nova análise.
- Cada análise representa um snapshot do histórico clínico considerado naquele momento.
- Uma análise gerada por IA nunca deve ser usada como fonte clínica para gerar outra análise.
- Toda nova análise deve partir novamente de todos os registros clínicos do paciente existentes no snapshot da geração, incluindo pareceres originais e complementos.
- A persistência de um parecer nunca deve depender da disponibilidade ou do sucesso da IA.
- Falha, timeout, indisponibilidade ou resposta inválida da IA nunca podem apagar, alterar ou corromper dados clínicos já persistidos.
- O sistema deve manter separação inequívoca entre dados clínicos originais e artefatos derivados por IA.
- Sem parecer clínico original, não há conteúdo suficiente para análise longitudinal.
- Com um único parecer clínico original, mesmo que existam complementos, a IA pode organizar ou resumir os registros, mas não pode afirmar evolução ou tendência.
- Com dois ou mais pareceres clínicos originais, a IA pode produzir leitura longitudinal usando todos os registros clínicos do snapshot, incluindo complementos.
- Complementos fazem parte da fonte clínica e podem alterar a interpretação de pareceres anteriores, mas não criam sozinhos um novo ponto temporal para determinar suficiência longitudinal.
- A decisão clínica final pertence sempre ao médico.

## Change control

Qualquer necessidade futura de alterar um destes invariantes deve ser tratada como mudança explícita de produto e arquitetura, nunca como detalhe de implementação.
