package com.psiqapp.application.port.out;

import com.psiqapp.domain.modelo.AnaliseClinica;
import com.psiqapp.domain.modelo.GeracaoAnalise;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryAnaliseClinicaPort {
    AnaliseClinica salvar(AnaliseClinica analise);
    Optional<AnaliseClinica> buscarAtual(UUID pacienteId);
    Optional<AnaliseClinica> buscarNoPaciente(UUID pacienteId, UUID analiseId);
    Pagina<GeracaoAnalise> listarGeracoes(UUID pacienteId, int pagina, int tamanho);
}
