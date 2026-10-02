package com.psiqapp.application.port.out;

import com.psiqapp.domain.modelo.Consulta;
import com.psiqapp.domain.modelo.StatusConsulta;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface RepositoryConsultaPort extends ConsultaResumo {
    Consulta salvar(Consulta consulta);
    Optional<Consulta> buscarPorId(UUID id);
    Pagina<Consulta> listar(Instant de, Instant ate, UUID pacienteId, int pagina, int tamanho);
    PaginaAgendaConsultas listarAgenda(GrupoAgendaConsulta grupo, UUID pacienteId, Instant de, Instant ate,
            Instant referenciaEm, int pagina, int tamanho);
    boolean atualizarStatusSeAgendada(UUID id, StatusConsulta status, Instant alteradoEm);
    void bloquearAgendaParaCriacao();
    boolean existeAgendadaSobreposta(Instant inicio, Instant fim);
    List<Instant> listarIniciosAgendadosSobrepostos(Instant inicio, Instant fim);
}
