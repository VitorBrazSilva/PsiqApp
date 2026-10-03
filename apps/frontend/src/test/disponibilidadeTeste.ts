import type { DisponibilidadeMensal } from '../features/consultas/servicoConsultas'

export const disponibilidadeTeste: DisponibilidadeMensal = {
  mes: '2026-10', hoje: '2026-10-02', fusoHorario: 'America/Sao_Paulo', verificadoEm: '2026-10-02T12:00:00Z', fonteDisponibilidade: 'LOCAL',
  dias: [
    { data: '2026-10-02', horarios: ['2026-10-02T13:00:00Z'] },
    { data: '2026-10-03', horarios: ['2026-10-03T03:00:00Z', '2026-10-03T12:00:00Z', '2026-10-03T17:30:00Z', '2026-10-04T02:30:00Z'] },
  ],
}
