## Documentation impact

- BUSINESS.md: UPDATED
- TECHNICAL.md: UPDATED
- README.md: UPDATED

### Motivo

A task torna disponível na Agenda a integração Google que antes estava documentada como pendente. Também muda o fluxo de agendamento, os estados mostrados por consulta, o comportamento do cliente HTTP para ignorar explicitamente o mock local e as opções de isolamento dos testes E2E.

### Alterações realizadas

- `docs/BUSINESS.md`: capacidade atual, regras de disponibilidade, estados/retry de sincronização, fluxo de criação e estado das fontes foram alinhados ao comportamento implementado.
- `docs/TECHNICAL.md`: estrutura, responsabilidades da Agenda, opção `usarApiReal`, configuração E2E, quantidade/escopo dos testes Playwright e estado verificável da feature foram atualizados.
- `README.md`: descrição da SPA e da integração, divulgação dos dados Google, execução E2E com provider fake e variáveis opcionais de isolamento foram atualizadas.
- `techspec.md`: o metadado de estado foi alinhado às aprovações das Tasks 01/02 e à autorização explícita da Task 03; as decisões técnicas permaneceram inalteradas.

### Verificações documentais

- Busca por referências à interface Google ainda pendente nos três documentos vivos — nenhuma ocorrência encontrada.
- Os fluxos e contratos documentados foram conferidos contra os componentes da Agenda, serviços HTTP, testes e TS-001/005/006.
- Não foram alteradas Rules, fronteiras arquiteturais ou decisões de produto.
- Não restaram referências nos documentos vivos à interface Google como pendente; não foram alteradas Rules nem fronteiras arquiteturais.
