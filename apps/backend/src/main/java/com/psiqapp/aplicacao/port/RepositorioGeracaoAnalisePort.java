package com.psiqapp.aplicacao.port;

import com.psiqapp.dominio.modelo.GeracaoAnalise;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioGeracaoAnalisePort {
    GeracaoAnalise salvar(GeracaoAnalise geracao);
    Optional<GeracaoAnalise> buscarPorRegistroDisparador(UUID registroId);
    Optional<GeracaoAnalise> buscarPorIdNoPaciente(UUID pacienteId, UUID geracaoId);
    Optional<GeracaoAnalise> buscarAtiva(UUID pacienteId);
    Optional<GeracaoAnalise> buscarMaisRecente(UUID pacienteId);
}
