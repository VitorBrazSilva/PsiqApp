package com.psiqapp.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface RepositorySequenciaPacientePort {
    record Sequencias(long revisaoClinica, long sequenciaRequest) {}

    Optional<Sequencias> reservarParaNovoRegistroClinico(UUID pacienteId);
    Optional<Sequencias> reservarParaRegeneracao(UUID pacienteId);
}
