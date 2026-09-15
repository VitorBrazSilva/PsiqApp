package com.psiqapp.aplicacao.port;

import java.util.Optional;
import java.util.UUID;

public interface RepositorioSequenciaPacientePort {
    record Sequencias(long revisaoClinica, long sequenciaRequisicao) {}

    Optional<Sequencias> reservarParaNovoRegistroClinico(UUID pacienteId);
}
