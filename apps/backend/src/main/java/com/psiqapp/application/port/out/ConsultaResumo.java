package com.psiqapp.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface ConsultaResumo {
    Optional<UUID> pacienteDaConsulta(UUID consultaId);
}
