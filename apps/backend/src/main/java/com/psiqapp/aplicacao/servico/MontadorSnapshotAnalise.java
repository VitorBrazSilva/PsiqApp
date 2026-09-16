package com.psiqapp.aplicacao.servico;

import com.psiqapp.aplicacao.port.RepositorioRegistroClinicoPort;
import com.psiqapp.aplicacao.port.SnapshotAnalise;
import java.util.HashMap;
import java.util.UUID;

public class MontadorSnapshotAnalise {
    private final RepositorioRegistroClinicoPort registros;

    public MontadorSnapshotAnalise(RepositorioRegistroClinicoPort registros) {
        this.registros = registros;
    }

    public SnapshotAnalise montar(UUID pacienteId, long revisaoSnapshot) {
        var registrosSnapshot = registros.listarSnapshot(pacienteId, revisaoSnapshot);
        var aliases = new HashMap<UUID, String>();
        for (int i = 0; i < registrosSnapshot.size(); i++) {
            aliases.put(registrosSnapshot.get(i).id(), "R" + (i + 1));
        }
        var itens = registrosSnapshot.stream()
                .map(registro -> new SnapshotAnalise.RegistroSnapshot(
                        aliases.get(registro.id()),
                        registro.id(),
                        registro.tipo(),
                        registro.parecerOriginalId() == null ? null : aliases.get(registro.parecerOriginalId()),
                        registro.dataHoraClinica(),
                        registro.texto(),
                        registro.humor(),
                        registro.medicamentos(),
                        registro.revisao()))
                .toList();
        return new SnapshotAnalise(pacienteId, revisaoSnapshot, itens);
    }
}
