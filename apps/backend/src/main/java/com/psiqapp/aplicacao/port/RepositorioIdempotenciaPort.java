package com.psiqapp.aplicacao.port;

import java.util.Optional;
import java.util.UUID;

public interface RepositorioIdempotenciaPort {
    Optional<RegistroIdempotencia> buscar(String operacao, UUID pacienteId, UUID chave);
    void salvar(RegistroIdempotencia registro);
}
