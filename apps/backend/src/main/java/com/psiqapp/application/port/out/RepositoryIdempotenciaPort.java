package com.psiqapp.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface RepositoryIdempotenciaPort {
    Optional<RegistroIdempotencia> buscar(String operacao, UUID pacienteId, UUID chave);
    void salvar(RegistroIdempotencia registro);
}
