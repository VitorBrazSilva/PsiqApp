package com.psiqapp.application.port.out;

import com.psiqapp.domain.modelo.RegistroClinico;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryRegistroClinicoPort {
    record EstatisticasSnapshot(int totalRegistros, int totalOriginais, int totalComplementos, UUID ultimoRegistroId) {}

    RegistroClinico salvar(RegistroClinico registro);
    Optional<RegistroClinico> buscarNoPaciente(UUID pacienteId, UUID registroId);
    Optional<RegistroClinico> buscarOriginalNoPaciente(UUID pacienteId, UUID registroId);
    Pagina<RegistroClinico> listarLinhaDoTempo(UUID pacienteId, int pagina, int tamanho);
    EstatisticasSnapshot estatisticasDoPaciente(UUID pacienteId);
    EstatisticasSnapshot estatisticasDoPacienteAteRevisao(UUID pacienteId, long revisao);
    List<RegistroClinico> listarSnapshot(UUID pacienteId, long revisaoSnapshot);
}
