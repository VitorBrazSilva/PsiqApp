package com.psiqapp.application.port.out;

import com.psiqapp.domain.modelo.Consulta;
import com.psiqapp.domain.modelo.StatusConsulta;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryConsultaPort extends ConsultaResumo {
    Consulta salvar(Consulta consulta);
    Optional<Consulta> buscarPorId(UUID id);
    Pagina<Consulta> listar(Instant de, Instant ate, UUID pacienteId, int pagina, int tamanho);
    boolean atualizarStatusSeAgendada(UUID id, StatusConsulta status, Instant alteradoEm);
}
