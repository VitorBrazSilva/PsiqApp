# Manutenção documental — Task 01

## Decisão

- `README.md`: atualizado com configuração OAuth opcional, destinos fixos, chave AES-256-GCM e limite de dados fictícios.
- `.env.example`: placeholders adicionados; nenhum segredo real.
- `docs/TECHNICAL.md`: responsabilidades, endpoints, estados, cifra e variáveis de ambiente documentados; tasks posteriores identificadas como pendentes.
- `docs/BUSINESS.md`: NONE. A task implementa a base server-side de autorização e não altera regras de negócio ou linguagem ubíqua.

## Revisão

A documentação foi comparada com a migration V005, configuração, endpoints, adapter OAuth, cifra e testes. Não descreve consulta FreeBusy, eventos ou UI como implementados. A execução operacional requer cadastrar o callback fixo no cliente OAuth e fornecer secrets fora do Git.

## Status

Concluída antes do commit, conforme `sdd-workflow/execute_task.md`.
