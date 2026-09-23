# Relação entre análise, observações e evidências

Verificado no código em 23 de setembro de 2026. O usuário descreveu corretamente a relação já implementada. A primeira versão do protótipo visual a simplificava em excesso.

```text
Análise do paciente
├── linhaDoTempo[]
│   └── item: texto + natureza + evidencias[]
├── padroes[]
│   └── item: texto + natureza + evidencias[]
├── pontosDeAtencao[]
│   └── item: texto + natureza + evidencias[]
└── limitacoes[]

Cada evidência
├── apelidoRegistro
├── registroId
├── campo: TEXTO | HUMOR | MEDICAMENTOS
└── citacao: trecho literal daquele campo
```

Uma observação pode citar vários registros. Observações diferentes podem citar conjuntos diferentes de registros, ou citar trechos diferentes do mesmo registro. A lista de evidências pertence ao item, não à seção inteira. Também é possível uma seção não possuir itens.

## Evidências no código

- `apps/frontend/src/features/analises/servicoAnalises.ts`: `AnaliseClinica` declara três arrays de `ItemAnalise`; cada `ItemAnalise` possui `evidencias: EvidenciaAnalise[]`.
- `apps/frontend/src/features/analises/PainelAnaliseAtual.tsx`: `SecaoAnalise` percorre `itens.map(...)` e passa `item.evidencias` para `ListaEvidencias` separadamente.
- `apps/frontend/src/features/analises/ListaEvidencias.tsx`: cada evidência abre sua própria fonte e exibe campo e citação.
- `apps/backend/src/main/java/com/psiqapp/adapter/in/web/AnaliseResponse.java`: a resposta HTTP mantém as três listas de itens e a lista de evidências de cada item.
- `apps/backend/src/main/java/com/psiqapp/application/servico/AnaliseResponseValidator.java`: valida cada item, exige evidência não vazia, resolve o registro no snapshot e verifica se a citação literal existe no campo indicado.

Não é necessário alterar o contrato de domínio para representar isso no redesign.

## Demonstração corrigida

| Seção | Item | Fontes vinculadas |
|---|---|---|
| Linha do tempo resumida | Contexto de julho | Texto do parecer de julho |
| Linha do tempo resumida | Sono em agosto | Texto do parecer de agosto |
| Linha do tempo resumida | Sono e caminhadas em setembro | Texto do parecer de setembro |
| Padrões observados | Rotina profissional e dificuldade de desacelerar | Trechos específicos de agosto e setembro |
| Padrões observados | Retomada de atividades pessoais | Outros trechos, de julho e setembro |
| Pontos de atenção | Dificuldade após o trabalho | Texto do parecer de setembro |
| Pontos de atenção | Apreensão com a rotina | Campo Estado/humor do parecer de agosto |
| Pontos de atenção | Pouco tempo para lazer | Outro trecho do texto de agosto |

São oito itens e dez vínculos de evidência no exemplo, sem inferência de diagnóstico, prescrição ou causalidade. Os dados são fictícios e não são gerados por IA durante o uso do protótipo.

O fluxo visual é: abrir uma observação → ler suas citações → abrir o registro completo com destaque do trecho → retornar à observação ou ao histórico. Cada novo paciente cadastrado começa sem registros e sem análise; os dados de Helena não aparecem em outro prontuário.
