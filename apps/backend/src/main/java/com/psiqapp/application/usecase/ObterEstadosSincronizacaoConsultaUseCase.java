package com.psiqapp.application.usecase;

import com.psiqapp.application.port.out.RepositorySincronizacaoConsultaPort;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public class ObterEstadosSincronizacaoConsultaUseCase {
    private final RepositorySincronizacaoConsultaPort sincronizacoes;

    public ObterEstadosSincronizacaoConsultaUseCase(RepositorySincronizacaoConsultaPort sincronizacoes) {
        this.sincronizacoes = sincronizacoes;
    }

    public Optional<RepositorySincronizacaoConsultaPort.Situacao> buscar(UUID consultaId) {
        return sincronizacoes.buscar(consultaId);
    }

    public Map<UUID, RepositorySincronizacaoConsultaPort.Situacao> listar(List<UUID> consultaIds) {
        return sincronizacoes.listar(consultaIds);
    }
}
