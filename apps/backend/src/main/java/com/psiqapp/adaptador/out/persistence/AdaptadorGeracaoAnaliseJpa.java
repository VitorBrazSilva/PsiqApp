package com.psiqapp.adaptador.out.persistence;

import com.psiqapp.aplicacao.port.RepositorioGeracaoAnalisePort;
import com.psiqapp.dominio.modelo.GeracaoAnalise;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdaptadorGeracaoAnaliseJpa implements RepositorioGeracaoAnalisePort {
    private final RepositorioGeracaoAnaliseJpaSpring repositorio;

    AdaptadorGeracaoAnaliseJpa(RepositorioGeracaoAnaliseJpaSpring repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    public GeracaoAnalise salvar(GeracaoAnalise geracao) {
        return paraDominio(repositorio.saveAndFlush(paraJpa(geracao)));
    }

    @Override
    public Optional<GeracaoAnalise> buscarPorRegistroDisparador(UUID registroId) {
        return repositorio.findByRegistroDisparadorId(registroId).map(this::paraDominio);
    }

    private EntidadeGeracaoAnaliseJpa paraJpa(GeracaoAnalise geracao) {
        var entidade = new EntidadeGeracaoAnaliseJpa();
        entidade.id = geracao.id();
        entidade.pacienteId = geracao.pacienteId();
        entidade.gatilho = geracao.gatilho();
        entidade.registroDisparadorId = geracao.registroDisparadorId();
        entidade.revisaoSnapshot = geracao.revisaoSnapshot();
        entidade.sequenciaRequisicao = geracao.sequenciaRequisicao();
        entidade.solicitadaEm = geracao.solicitadaEm();
        entidade.state = geracao.estado();
        entidade.totalRegistros = geracao.totalRegistros();
        entidade.totalOriginais = geracao.totalOriginais();
        entidade.totalComplementos = geracao.totalComplementos();
        entidade.ultimoRegistroClinicoId = geracao.ultimoRegistroClinicoId();
        entidade.tentativas = 0;
        entidade.mode = geracao.modo();
        return entidade;
    }

    private GeracaoAnalise paraDominio(EntidadeGeracaoAnaliseJpa entidade) {
        return new GeracaoAnalise(entidade.id, entidade.pacienteId, entidade.gatilho,
                entidade.registroDisparadorId, entidade.revisaoSnapshot, entidade.sequenciaRequisicao,
                entidade.solicitadaEm, entidade.state, entidade.totalRegistros, entidade.totalOriginais,
                entidade.totalComplementos, entidade.ultimoRegistroClinicoId, entidade.mode);
    }
}
