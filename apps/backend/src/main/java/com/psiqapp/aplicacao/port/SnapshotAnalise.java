package com.psiqapp.aplicacao.port;

import com.psiqapp.dominio.modelo.TipoRegistroClinico;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SnapshotAnalise(UUID pacienteId, long revisaoSnapshot, List<RegistroSnapshot> registros) {
    public record RegistroSnapshot(String alias, UUID id, TipoRegistroClinico tipo, String originalAlias,
            Instant dataHoraClinica, String texto, String humor, String medicamentos, long revisao) {}
}
