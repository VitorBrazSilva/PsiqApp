# Revisão documental do estado do PsiqApp

Revisão realizada em 01/10/2026. Foram comparados `docs/BUSINESS.md` e `docs/TECHNICAL.md` com o código de `apps/backend` e `apps/frontend`, as migrations, os testes versionados, o workflow de CI, `README.md`, as Rules e os artefatos SDD disponíveis em `tasks/`.

Esta foi uma revisão estática. As suítes de teste, o CI e as migrations não foram executados. Nenhum código de produção foi alterado.

## Conclusão

As documentações anteriores ainda descreviam gates e relatórios de features cujos artefatos não estão presentes no checkout atual. Também havia links para essas pastas ausentes e afirmações incorretas sobre a abertura de análises históricas. `BUSINESS.md` e `TECHNICAL.md` foram atualizados para distinguir comportamento implementado, limites verificados no código e trabalho apenas especificado. O README teve somente seus dois caminhos obsoletos de task atualizados.

As pastas SDD disponíveis atualmente descrevem a integração com Google Agenda. O PRD dessa feature tem spec review aprovado e existe uma TechSpec, mas não foram encontrados componentes da integração no backend ou frontend. A agenda que funciona hoje permanece interna ao PsiqApp.

## Estado observável neste checkout

| Área | Estado observado |
|---|---|
| Pacientes, consultas, prontuário e análise | Os fluxos estão presentes no backend e no frontend, com testes unitários, de integração e E2E versionados. Esta revisão não executou esses testes e não declara aprovação de entrega. |
| Integração com Google Agenda | PRD, spec review aprovado e TechSpec presentes; não há implementação correspondente nem task de execução em `tasks/`. |
| Gates antigos do MVP e da refatoração de nomenclaturas | As pastas e os relatórios que registravam esses gates não estão presentes. Seus estados históricos não podem ser confirmados a partir do checkout atual. |
| Privacidade do MVP | As Rules, o README e o aviso da interface restringem o uso a dados fictícios. `BUSINESS.md` agora registra a mesma regra. |

## Achados que afetam a documentação

### 1. Referências e status de entrega estavam desatualizados

`BUSINESS.md`, `TECHNICAL.md` e `README.md` apontavam para `tasks/prd-psiqapp-mvp/` e/ou `tasks/prd-refatoracao-arquitetural-nomenclaturas/`, que não existem no checkout atual. As documentações ainda repetiam estados `READY`/`NOT READY` de relatórios ausentes e uma data de revisão de 23/09/2026.

Os links foram substituídos por referências existentes. Os documentos não atribuem mais um gate histórico às features antigas. Isso não significa que esses gates foram aprovados ou reprovados; significa que não há evidência atual no checkout para confirmá-los.

### 2. Integração com Google Agenda é especificada, mas ainda não implementada

`tasks/prd-integracao-google-agenda/` contém PRD, spec review e TechSpec. A busca no código atual não encontrou rotas OAuth/disponibilidade, adapter Google, migration V005, worker de sincronização ou interface de conexão. `BUSINESS.md` e `TECHNICAL.md` agora identificam a integração como planejamento, mantendo a agenda interna como comportamento atual.

### 3. A regra de dados fictícios precisava estar explícita no documento de negócio

A versão de trabalho de `BUSINESS.md` não mencionava mais a restrição de dados fictícios. A Rule `clinical-data-privacy.md`, o README e o aviso persistente da interface continuam exigindo essa restrição para o MVP. Ela foi recolocada no contexto de uso, no glossário e nas regras de privacidade de `BUSINESS.md`.

### 4. A API e a interface já permitem abrir análises históricas

`GeracaoAnaliseResponse` inclui `analiseId`. `HistoricoGeracoes` oferece a ação de abrir uma geração concluída quando esse identificador está disponível, e a tela consulta a análise histórica. A documentação anterior dizia que o contrato não expunha esse vínculo e que a interface não abria análises anteriores; `BUSINESS.md` e a tabela/descrição técnica foram corrigidos.

### 5. O conjunto E2E cresceu, mas não cobre falha real do provider

Há sete testes Playwright em três arquivos. Eles cobrem cadastro/busca, consulta, parecer/complemento/evidência, isolamento, histórico insuficiente, layout responsivo e navegação por teclado no histórico. Apesar do nome `isolamento-e-falha-ia.spec.ts`, esse arquivo não simula falha, timeout ou retry do provider. `TECHNICAL.md` registra a quantidade e o limite pelo comportamento efetivamente presente.

### 6. O upgrade V003 → V004 de uma base populada ainda não está demonstrado

`BackendBootstrapIT` verifica a aplicação das quatro migrations em um banco novo; não foi encontrado teste versionado que inicie de V003 com análises e evidências existentes.

Na leitura estática de V004 foram confirmados estes riscos para dados históricos:

- a migration reativa o trigger append-only de `analise_clinica` antes das atualizações que normalizam seu JSONB;
- os valores antigos de `evidencia_analise.campo` (`TEXT`, `MOOD`, `MEDICATIONS`) não são convertidos antes da inclusão do CHECK que aceita os nomes em português;
- a normalização dos objetos de evidência no JSONB é feita apenas em `linhaDoTempo`, não em `padroes` e `pontosDeAtencao`.

Por isso, uma execução bem-sucedida em banco vazio não demonstra que uma base V003 populada migra ou preserva seu histórico.

### 7. O adapter OpenAI envia identificadores internos e o prompt não acompanha o schema

`OpenAiAnaliseClinicaAdapter.montarPayload` serializa diretamente cada `RegistroSnapshot`, incluindo `id` UUID e `revisao`. O prompt usa nomes de chaves e modo em inglês (`timeline`, `patterns`, `SUMMARY_ONLY`, entre outros), enquanto o contrato e os modos usados no backend são em português. O texto do prompt também contém sequências de caracteres acentuados corrompidas no arquivo atual.

A documentação técnica agora registra essa diferença como pendência de minimização e alinhamento do contrato. A revisão não alterou o adapter.

### 8. Uma lease expirada no limite de tentativas pode deixar a geração ativa

`AdapterGeracaoAnaliseJpa.recuperarLeaseExpirado` só reivindica uma geração quando `contagem_tentativas < maxTentativas`. Se o processo cair durante a última tentativa e a lease expirar, a linha pode continuar em `EM_EXECUCAO` sem ser reivindicada nem marcada como falha terminal. Esse limite foi registrado em `TECHNICAL.md`.

## Documentação atualizada

- `docs/BUSINESS.md`: removeu status e links para relatórios ausentes; reafirmou a regra de dados fictícios; distinguiu a agenda implementada da integração Google especificada; atualizou as fontes e os limites de validação.
- `docs/TECHNICAL.md`: atualizou data, estrutura e estado dos artefatos disponíveis; corrigiu o DTO de histórico e o inventário E2E; registrou limites técnicos confirmados no código sem afirmar gates de entrega inexistentes.
- `README.md`: atualizou os caminhos da estrutura do repositório e da seção de documentação para a pasta SDD presente.
- `docs/REVISAO-DOCUMENTAL.md`: substituiu os achados de 23/09 por esta revisão.

## Verificações e limites

Foram conferidos os caminhos referenciados nos documentos atualizados contra os arquivos existentes e relidos os diffs das alterações documentais. Testes, CI, execução de migrations e chamadas ao provider de IA não foram realizados; os resultados dessas verificações não são declarados aqui.
