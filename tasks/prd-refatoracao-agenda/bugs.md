# Ocorrências — Organização da Agenda

## Bugs abertos

Nenhum.

## Ocorrências resolvidas na validação

1. A primeira execução E2E em 5173 usava o bundle anterior do container Nginx, portanto não encontrava o novo botão. Confirmado por snapshot e bundle `index-B335U7rR.js`. QA do código passou a usar Vite 5174; após rebuild/recriação somente do frontend, seis E2E passaram em 5173 com o bundle atualizado.
2. Testes adaptados inicialmente tratavam `tamanho=100` como leitura de tamanho 1 por comparação parcial e usavam um helper de evento não disponível. Corrigidos para parâmetros de URL exatos e disparo do evento cancel nativo; 86 testes passaram.
3. O teste de cadastro retroativo pressupunha manter paciente após a confirmação. O diálogo fecha e reabre limpo pelo padrão aprovado; o teste passou a selecionar paciente no novo cadastro. O fluxo completo de conflito, falha Google, resposta perdida e retroativo passou.

Nenhuma dessas ocorrências exige alteração de Rule, contrato ou arquitetura.
