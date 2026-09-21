package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.RegistroIdempotencia;
import com.psiqapp.application.port.out.RepositoryIdempotenciaPort;
import java.time.Clock;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdapterIdempotenciaJpa implements RepositoryIdempotenciaPort {
    private final RepositoryIdempotenciaJpaSpring repositorio;
    private final Clock relogio;

    AdapterIdempotenciaJpa(RepositoryIdempotenciaJpaSpring repositorio, Clock relogio) {
        this.repositorio = repositorio;
        this.relogio = relogio;
    }

    @Override
    public Optional<RegistroIdempotencia> buscar(String operacao, UUID pacienteId, UUID chave) {
        return repositorio.buscar(operacao, pacienteId, chave).map(this::paraDominio);
    }

    @Override
    public void salvar(RegistroIdempotencia registro) {
        var entidade = new EntidadeIdempotenciaJpa();
        entidade.id = UUID.randomUUID();
        entidade.operacao = registro.operacao();
        entidade.pacienteId = registro.pacienteId();
        entidade.chave = registro.chave();
        entidade.hashPayload = registro.hashPayload();
        entidade.tipoRecurso = registro.tipoRecurso();
        entidade.recursoId = registro.recursoId();
        entidade.statusOriginal = (short) registro.statusOriginal();
        entidade.criadoEm = relogio.instant();
        repositorio.saveAndFlush(entidade);
    }

    private RegistroIdempotencia paraDominio(EntidadeIdempotenciaJpa entidade) {
        return new RegistroIdempotencia(entidade.operacao, entidade.pacienteId, entidade.chave,
                entidade.hashPayload, entidade.tipoRecurso, entidade.recursoId, entidade.statusOriginal.intValue());
    }
}
