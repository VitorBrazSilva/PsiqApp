Você é responsável por implementar exatamente uma task SDD por vez.

<critical>Implemente somente uma task principal por execução.</critical>
<critical>Leia AGENTS.md, Rules, PRD, TechSpec, task e skills aplicáveis antes de alterar código.</critical>
<critical>NÃO introduza comportamento fora da especificação sem registrar a necessidade.</critical>
<critical>Todos os testes aplicáveis devem passar antes da conclusão.</critical>
<critical>A task só pode ser concluída após aprovação do `task-reviewer` e ausência de blockers no `code-reviewer`.</critical>
<critical>Após aprovação dos reviews/testes e antes do commit final, execute obrigatoriamente `project-documentation-maintainer`.</critical>
<critical>Somente crie commit e Pull Request após testes aprovados, `task-reviewer` aprovado, `code-reviewer` sem blockers e manutenção documental concluída.</critical>
<critical>O Pull Request deve ser pequeno, restrito ao escopo da task e direcionado para `main`.</critical>

## Entradas

### Fontes normativas

- `./tasks/prd-[feature-slug]/prd.md`
- `./tasks/prd-[feature-slug]/techspec.md`
- `./tasks/prd-[feature-slug]/tasks.md`
- `./tasks/prd-[feature-slug]/NN_task.md`
- `./.agents/rules/`
- `./.agents/skills/`
- `./AGENTS.md`

### Documentação humana viva

- `./docs/BUSINESS.md`, quando existir
- `./docs/TECHNICAL.md`, quando existir
- `./README.md`, quando existir

A documentação humana pode ser usada para compreender o estado atual do projeto, mas não deve sobrescrever decisões presentes em Rules, PRD, TechSpec ou na task atual.

Em caso de conflito:

1. Rules têm precedência como invariantes do projeto.
2. PRD define comportamento e requisitos do produto.
3. TechSpec define decisões técnicas aprovadas.
4. A task define o escopo executável daquela entrega.
5. A documentação humana representa o estado atual derivado da implementação.

Se uma task exigir algo incompatível com Rules, PRD ou TechSpec, não invente uma solução nem altere silenciosamente a especificação. Registre o conflito e interrompa apenas o ponto afetado.

## Lifecycle obrigatório da task

1. Identifique a próxima task não concluída ou a task explicitamente informada.

2. Leia sua rastreabilidade RF/RNF/AC/TS.

3. Leia integralmente as Rules aplicáveis, PRD, TechSpec e a task atual antes de implementar.

4. Explore o código impactado e identifique o estado atual da implementação.

5. Carregue skills aplicáveis somente quando forem realmente úteis para a task.

6. Consulte as seções relevantes de `docs/BUSINESS.md` e `docs/TECHNICAL.md` para compreender o domínio e as responsabilidades dos módulos afetados. Consulte `README.md` quando setup, configuração, execução ou verificações operacionais forem pertinentes. Explore os arquivos de código e testes impactados; não faça leitura geral do repositório sem necessidade comprovada.

7. Crie uma branch dedicada, com nome curto e relacionado à task, caso ainda não esteja em uma branch apropriada.

   Se já estiver em uma branch dedicada e compatível com a task atual, permaneça nela.

8. Apresente um resumo curto contendo:

   - objetivo da task;
   - escopo principal;
   - arquivos ou áreas provavelmente impactados;
   - testes previstos;
   - riscos ou dependências relevantes;
   - módulo existente e responsabilidade que a mudança estende.

Antes de implementar, confirme que o escopo da task preserva a fronteira aprovada na TechSpec. Se surgir necessidade de mudar responsabilidade, direção de dependência, Rule ou convenção global não aprovada, registre o conflito e pare somente o trecho dependente dessa decisão.

9. Implemente somente o escopo da task atual.

10. Não implemente antecipadamente funcionalidades pertencentes a tasks futuras.

11. Adicione ou ajuste os testes definidos pela task.

12. Execute todos os checks aplicáveis, incluindo quando disponíveis:

   - testes unitários;
   - testes de integração;
   - typecheck;
   - lint;
   - build;
   - migrations;
   - testes arquiteturais;
   - testes de concorrência;
   - testes E2E, somente quando fizerem parte do escopo atual.

13. Execute `task-reviewer`.

14. O `task-reviewer` deve validar principalmente:

   - escopo da task;
   - requisitos;
   - critérios de aceite;
   - rastreabilidade;
   - testes obrigatórios;
   - evidências da implementação;
   - ausência de implementação indevida de tasks futuras.

15. Se o `task-reviewer` apontar problemas bloqueantes:

   - corrija somente os problemas pertencentes ao escopo da task;
   - execute novamente os testes/checks afetados;
   - execute novamente o `task-reviewer`;
   - repita até aprovação ou até identificar conflito que não possa ser resolvido dentro da task.

16. Execute `code-reviewer`.

17. O `code-reviewer` deve validar principalmente:

   - qualidade técnica;
   - arquitetura;
   - direção de dependências;
   - coesão;
   - legibilidade;
   - duplicação relevante;
   - testabilidade;
   - tratamento de erros;
   - transações;
   - concorrência, quando aplicável;
   - uso correto de ports/adapters;
   - acoplamento com frameworks;
   - riscos técnicos e de manutenção;
   - ausência de overengineering.

18. Se o `code-reviewer` apontar algum `BLOCKER`:

   - corrija somente os blockers pertencentes ao escopo da task;
   - não aumente artificialmente o escopo;
   - execute novamente os testes/checks afetados;
   - execute novamente o `code-reviewer`;
   - repita até não haver blockers.

19. Achados `NON_BLOCKING` do `code-reviewer` podem ser corrigidos quando:

   - forem pequenos;
   - locais;
   - claramente benéficos;
   - não aumentarem significativamente o escopo da task.

20. Após qualquer correção realizada depois dos reviews, execute novamente todos os testes/checks relevantes afetados.

21. Execute obrigatoriamente `project-documentation-maintainer`.

22. O `project-documentation-maintainer` deve:

   - analisar o código realmente implementado;
   - analisar a task concluída;
   - analisar testes e reviews;
   - comparar o estado atual com a documentação existente;
   - decidir entre atualizar `BUSINESS.md`, `TECHNICAL.md`, `README.md` ou `NONE`;
   - fazer somente alterações documentais necessárias;
   - não documentar funcionalidades futuras como se estivessem prontas;
   - remover ou ajustar linguagem de planejamento quando a implementação já existir;
   - não transformar a documentação em changelog.

23. Verifique o diff final completo.

24. Confirme que:

   - nenhuma alteração contradiz Rules, PRD ou TechSpec;
   - nenhuma funcionalidade futura foi implementada por conveniência;
   - nenhuma documentação afirma algo que o código ainda não suporta;
   - nenhum secret ou dado sensível foi incluído;
   - arquivos de review pertencem à task correta;
   - testes continuam aprovados.

25. Marque a task como concluída:

   - em `tasks.md`;
   - no arquivo `NN_task.md`.

   Isso só pode ocorrer após:

   - testes aprovados;
   - `task-reviewer` aprovado;
   - `code-reviewer` sem blockers;
   - manutenção documental concluída.

26. Crie um commit pequeno, coeso e bem nomeado relacionado exclusivamente à task atual.

27. O commit deve incluir:

   - código da task;
   - testes;
   - migrations aplicáveis;
   - arquivos de review;
   - atualização da task;
   - atualização de `tasks.md`;
   - documentação viva modificada pelo `project-documentation-maintainer`.

28. Faça push da branch atual para o remote configurado.

29. Crie um Pull Request direcionado para `main`.

30. O Pull Request deve seguir obrigatoriamente a estrutura definida abaixo.

31. Ao final, informe:

   - task executada;
   - branch;
   - commit;
   - número ou URL do Pull Request;
   - resumo da implementação;
   - testes/checks executados;
   - status do `task-reviewer`;
   - status do `code-reviewer`;
   - documentação atualizada;
   - rastreabilidade atendida;
   - pendências ou observações não bloqueantes, quando existirem.

## Padrão obrigatório do Pull Request

O título do Pull Request deve ser curto, objetivo e representar exclusivamente a task atual.

Exemplos:

```text
chore: bootstrap local infrastructure
chore: bootstrap Spring Boot backend
feat: add patient and appointment backend
feat: add clinical records
feat: add clinical analysis worker
feat: add patient and appointment frontend
test: validate PsiqApp MVP integration
```

Não use títulos genéricos como:

```text
updates
changes
task implementation
fix project
```

A descrição do Pull Request deve seguir esta estrutura:

```markdown
## Objetivo

Descrever resumidamente o propósito da task e o resultado entregue.

## Implementado

- listar as principais mudanças;
- destacar componentes, módulos ou fluxos relevantes;
- evitar listar alterações triviais de implementação.

## Requisitos atendidos

### PRD

- RF/RNF aplicáveis

### TechSpec

- TS aplicáveis

### Critérios de aceite

- ACs aplicáveis

## Testes executados

- comandos executados;
- testes unitários;
- testes de integração;
- typecheck/lint/build;
- migrations;
- testes de concorrência;
- outros checks aplicáveis.

## Reviews

- task-reviewer: APROVADO
- code-reviewer: APROVADO ou APROVADO COM OBSERVAÇÕES

## Documentação

- `README.md`: atualizado / não aplicável
- `docs/BUSINESS.md`: atualizado / não aplicável
- `docs/TECHNICAL.md`: atualizado / não aplicável

## Fora do escopo

- listar itens explicitamente não implementados por pertencerem a tasks futuras;
- não sugerir que funcionalidades fora da task estejam prontas.

## Observações

- trade-offs relevantes;
- riscos conhecidos;
- pendências não bloqueantes;
- `Nenhuma`, quando não houver observações relevantes.
```

## Regras do Pull Request

- Um PR corresponde a exatamente uma task principal.
- O PR deve ser direcionado para `main`.
- Não misture alterações de tasks diferentes.
- Não inclua secrets.
- Não inclua dados reais de pacientes.
- Não inclua conteúdo clínico sensível em descrição, logs ou evidências do PR.
- Não declare requisito como atendido sem código/teste/evidência correspondente.
- Não declare testes como executados se eles não foram realmente executados.
- Não esconda problemas não bloqueantes relevantes encontrados pelos reviewers.
- O PR deve permanecer pequeno e revisável.
- Não introduza refactors amplos sem necessidade direta da task.

Se não for possível criar o Pull Request por ausência de:

- autenticação;
- remote;
- CLI apropriada;
- permissão;
- acesso ao Git provider;

não improvise nem altere configuração sem autorização.

Nesse caso:

1. faça o commit normalmente, se possível;
2. faça push somente se houver acesso válido;
3. prepare título e descrição completos do PR;
4. informe claramente por que o PR não pôde ser criado automaticamente.

## Regra de documentação viva

O commit final da task deve deixar o repositório documentalmente coerente com o estado atual.

### `docs/BUSINESS.md`

Avaliar quando houver mudança funcional, de domínio ou comportamento percebido pelo usuário.

Exemplos:

- regras de negócio;
- conceitos de domínio;
- estados funcionais;
- fluxos;
- comportamento da IA;
- limitações funcionais.

### `docs/TECHNICAL.md`

Avaliar quando houver mudança técnica ou arquitetural.

Exemplos:

- stack;
- estrutura;
- componentes;
- banco;
- migrations;
- APIs;
- worker;
- OpenAI;
- segurança técnica;
- testes;
- observabilidade;
- infraestrutura.

### `README.md`

Avaliar quando houver mudança de:

- setup;
- execução local;
- dependências;
- variáveis de ambiente;
- comandos;
- testes;
- onboarding.

### `NONE`

Se a task não mudar nenhuma verdade documental relevante, não altere documentos artificialmente.

A documentação representa o estado atual do projeto, não o histórico de implementação.

O histórico pertence ao Git, commits e Pull Requests.

## Regra de review

`task-reviewer` e `code-reviewer` possuem responsabilidades diferentes.

### task-reviewer

Responde principalmente:

> A task entregou corretamente o que foi especificado?

Avalia:

- requisitos;
- escopo;
- critérios de aceite;
- rastreabilidade;
- testes;
- evidências;
- ausência de vazamento para tasks futuras.

### code-reviewer

Responde principalmente:

> A solução foi tecnicamente bem implementada?

Avalia:

- arquitetura;
- qualidade de código;
- legibilidade;
- coesão;
- acoplamento;
- dependências;
- testabilidade;
- tratamento de erros;
- persistência;
- transações;
- concorrência;
- simplicidade;
- riscos de manutenção.

Um reviewer não substitui o outro.

## Regra de precedência

Quando houver conflito entre informações:

```text
Rules
  ↓
PRD
  ↓
TechSpec
  ↓
Task atual
  ↓
Código implementado
  ↓
Documentação humana derivada
```

Não altere silenciosamente uma fonte superior para satisfazer uma fonte inferior.

Se a implementação revelar que uma decisão aprovada precisa mudar, registre explicitamente a necessidade antes de prosseguir com comportamento divergente.

## Regra de branch

`1 task principal = 1 branch dedicada`.

Se uma branch adequada já estiver ativa:

- permaneça nela;
- não crie outra branch sem necessidade;
- não troque de branch automaticamente.

Se estiver em `main` ou branch incompatível:

- crie uma branch dedicada antes de alterar código.

Prefira nomes previsíveis como:

```text
task/01-infra-bootstrap
task/02-backend-bootstrap
task/03-frontend-bootstrap
task/04-backend-patient-appointment
```

## Regra de commit

`1 task principal = 1 commit final coeso`, salvo necessidade técnica excepcional claramente justificada.

O commit deve:

- representar somente aquela task;
- usar mensagem objetiva;
- não misturar trabalho futuro;
- incluir código, testes, reviews e documentação aplicável.

## Regra de ouro

`1 task principal = 1 branch dedicada = 1 entrega pequena = testes = task-reviewer = code-reviewer = documentação viva = 1 commit coeso = 1 PR pequeno`.

Não agrupe tasks futuras “por conveniência”.

Não implemente funcionalidade adicional apenas porque seria fácil fazê-la no mesmo momento.

Não transforme uma task pequena em uma refatoração geral.

Não utilize complexidade futura para resolver um problema que o MVP ainda não possui.
