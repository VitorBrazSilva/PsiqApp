import type { ReactNode } from 'react'

type NomeIcone = 'calendario' | 'relogio' | 'paciente' | 'manha' | 'tarde' | 'noite' | 'informacao'
  | 'seta-esquerda' | 'seta-direita' | 'mes-anterior' | 'proximo-mes'

const desenhos: Record<NomeIcone, ReactNode> = {
  calendario: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  paciente: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" /></>,
  manha: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  tarde: <><path d="M3 17h18M5 21h14M6 17a6 6 0 0 1 12 0M12 3v3M3 9l2 2m14 0 2-2M2 14h2m16 0h2" /></>,
  noite: <path d="M20.5 13.5A9 9 0 0 1 10.5 3a9 9 0 1 0 10 10.5Z" />,
  informacao: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10h.01" /></>,
  'seta-esquerda': <path d="M20 12H4m6-6-6 6 6 6" />,
  'seta-direita': <path d="M4 12h16m-6-6 6 6-6 6" />,
  'mes-anterior': <path d="m14 6-6 6 6 6" />,
  'proximo-mes': <path d="m10 6 6 6-6 6" />,
}

export function IconeAgendamento({ nome, className = '' }: { nome: NomeIcone, className?: string }) {
  return <svg className={`agendamento-icone ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {desenhos[nome]}
  </svg>
}
