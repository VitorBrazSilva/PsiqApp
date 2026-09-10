# PsiqApp MVP - Tasks

Este índice organiza a implementação do MVP em tasks pequenas, coesas e adequadas para o fluxo `1 task = 1 branch = 1 PR pequeno`.

## Status de Execução

- [x] 01 `infra-bootstrap`
- [ ] 02 `backend-bootstrap` — em andamento; build e 14 testes locais aprovados, integração Testcontainers bloqueada por ausência de Docker Engine. Ver `02_task_review.md`.

## Sequência Recomendada

| Ordem | Arquivo | Task | Objetivo resumido | Dependências |
| --- | --- | --- | --- | --- |
| 01 | `01_task.md` | `infra-bootstrap` | Infraestrutura local, Compose, configuração externa, CI inicial e onboarding. | Nenhuma |
| 02 | `02_task.md` | `backend-bootstrap` | Projeto backend Spring Boot, arquitetura hexagonal, health, erros base e testes. | 01 |
| 03 | `03_task.md` | `frontend-bootstrap` | SPA React/Vite, rotas, cliente HTTP, layout base e aviso de dados fictícios. | Nenhuma |
| 04 | `04_task.md` | `backend-patient-appointment` | Pacientes, busca, consultas, agenda, status e idempotência. | 01, 02 |
| 05 | `05_task.md` | `backend-clinical-records` | Pareceres, complementos, timeline append-only e criação de geração pendente. | 01, 02, 04 |
| 06 | `06_task.md` | `backend-analysis-core` | Modelo persistente de análise, snapshot, evidências, validações e endpoints de consulta/regeneração. | 01, 02, 05 |
| 07 | `07_task.md` | `backend-analysis-worker` | Worker assíncrono, lease, retry, provider OpenAI e finalização transacional. | 01, 02, 05, 06 |
| 08 | `08_task.md` | `backend-api-contract-validation` | Validação final de contratos REST/OpenAPI sem reimplementar casos de uso. | 04, 05, 06, 07 |
| 09 | `09_task.md` | `frontend-patient-appointment` | Fluxos frontend de pacientes, busca, agenda e status de consultas. | 03, 04, 08 |
| 10 | `10_task.md` | `frontend-clinical-analysis` | Prontuário, pareceres, complementos, análise, evidências, histórico e polling. | 03, 05, 07, 08 |
| 11 | `11_task.md` | `qa-integration` | Validação integrada E2E, privacidade, falhas de IA, isolamento e documentação final. | 01 a 10 |

## DAG de Dependências

```text
01 infra-bootstrap
   -> 02 backend-bootstrap
      -> 04 backend-patient-appointment
         -> 05 backend-clinical-records
            -> 06 backend-analysis-core
               -> 07 backend-analysis-worker
                  -> 08 backend-api-contract-validation

03 frontend-bootstrap
   -> 09 frontend-patient-appointment
   -> 10 frontend-clinical-analysis

08 backend-api-contract-validation
   -> 09 frontend-patient-appointment
   -> 10 frontend-clinical-analysis

01..10
   -> 11 qa-integration
```

## Ajustes Aplicados

- `backend-bootstrap` deixou de rastrear artificialmente `RF-001 a RF-020`; sua rastreabilidade agora fica restrita a requisitos não funcionais e TechSpec de base arquitetural.
- `frontend-bootstrap` deixou de herdar RFs de negócio ainda não implementados; fica focada na SPA base, cliente HTTP, rotas placeholder e aviso de dados fictícios.
- `frontend-bootstrap` não depende mais de `infra-bootstrap`, pois pode ser executada sem PostgreSQL ou backend funcional.
- A antiga `backend-analysis-worker` foi dividida em:
  - `backend-analysis-core`, para dominio, persistencia, snapshot, evidencias, validacoes e contratos de consulta/regeneracao;
  - `backend-analysis-worker`, para processamento assincrono, lease, retry, provider OpenAI e finalizacao atomica.
- A antiga `backend-api-integration` virou `backend-api-contract-validation`, com papel de gate de contrato. Ela não deve reimplementar controllers, casos de uso ou regras funcionais já entregues nas tasks anteriores.
