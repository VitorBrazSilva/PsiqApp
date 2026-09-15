package com.psiqapp.aplicacao.port;

import com.psiqapp.dominio.modelo.GeracaoAnalise;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioGeracaoAnalisePort {
    GeracaoAnalise salvar(GeracaoAnalise geracao);
    Optional<GeracaoAnalise> buscarPorRegistroDisparador(UUID registroId);
}
