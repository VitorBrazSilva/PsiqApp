# Bugs — Melhorias na Agenda

Nenhum bug bloqueante aberto. Achados do QA de 02/10/2026, corrigidos no encerramento das Tasks 1/2.

## QA-001 — Lista não renovava ao passar o início da consulta
Status: CORRIGIDO (Task 2; TS-008).
Reprodução: manter Próximas visível durante o início de uma consulta; sem foco/visibilidade/mutação, itens e contagens permaneciam anteriores. `useAgendaConsultas` possuía apenas recarga por eventos, sem timer.
Correção: timer com cleanup pelo próximo início visível, GET após a igualdade temporal, apenas em aba visível e com limite seguro de setTimeout; classificação/contagens permanecem no backend.
Evidência: `useAgendaConsultas.test.tsx` com relógio controlado verifica ausência de GET até a igualdade, GET após o início e contagem de anteriores atualizada.

## QA-002 — Resumo do prontuário não renovava ao retornar
Status: CORRIGIDO (Task 2; TS-009).
Reprodução: abrir prontuário, modificar agenda fora da janela e retornar; resumo só dependia de paciente/versão de mutação interna.
Correção: focus/visibilitychange incrementam versão da agenda quando visível; cleanup remove listeners.
Evidência: novo teste de `PaginaProntuario.test.tsx` verifica GET do resumo ao retornar e ausência após desmontar; testes de troca de paciente continuam verdes.

## QA-003 — Listas sem ícones de dia/hora previstos
Status: CORRIGIDO (Task 2; AC-RF004-06/TS-010).
Reprodução: abrir item em qualquer grupo; dia/hora apareciam por texto, sem os SVGs especificados.
Correção: calendário/relógio decorativos aria-hidden nas duas listas compartilhadas, com estilos locais e texto preservado.
Evidência: E2Es de grupos/status/teclado e imagens finais `agenda-360.png`/`agenda-desktop.png`; inspeção visual aprovada.

## QA-004 — Restrição Google ausente do gate arquitetural
Status: CORRIGIDO (Task 1; TS-012).
Reprodução: inspecionar `ArquiteturaTest`; listas de dependências proibidas continham OpenAI mas não `com.google..`, apesar da extensão prevista.
Correção: acrescentada restrição ao domínio e aplicação; removido comentário obsoleto sobre bootstrap sem casos de uso.
Evidência: `ArquiteturaTest` executado após extensão; código produtivo não possui dependência proibida.

## Diagnósticos de ambiente/documentação
Docker parado na primeira tentativa de verify: resolvido ao iniciar Docker e repetir a suíte. BUSINESS § 7 ainda descrevia somente entrada manual e TECHNICAL § 17 citava 14 E2Es: fontes canônicas corrigidas no fechamento.
