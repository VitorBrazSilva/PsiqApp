package com.psiqapp.aplicacao.port;

import com.psiqapp.dominio.modelo.AnaliseClinica;
import com.psiqapp.dominio.modelo.GeracaoAnalise;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioAnaliseClinicaPort {
    AnaliseClinica salvar(AnaliseClinica analise);
    Optional<AnaliseClinica> buscarAtual(UUID pacienteId);
    Optional<AnaliseClinica> buscarNoPaciente(UUID pacienteId, UUID analiseId);
    Pagina<GeracaoAnalise> listarGeracoes(UUID pacienteId, int pagina, int tamanho);
}
