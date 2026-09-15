package com.psiqapp.aplicacao.port;

import com.psiqapp.dominio.modelo.RegistroClinico;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioRegistroClinicoPort {
    record EstatisticasSnapshot(int totalRegistros, int totalOriginais, int totalComplementos, UUID ultimoRegistroId) {}

    RegistroClinico salvar(RegistroClinico registro);
    Optional<RegistroClinico> buscarNoPaciente(UUID pacienteId, UUID registroId);
    Optional<RegistroClinico> buscarOriginalNoPaciente(UUID pacienteId, UUID registroId);
    Pagina<RegistroClinico> listarLinhaDoTempo(UUID pacienteId, int pagina, int tamanho);
    EstatisticasSnapshot estatisticasDoPaciente(UUID pacienteId);
}
