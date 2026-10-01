package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AdapterConexaoGoogleAgendaJpa implements ConexaoGoogleAgendaPort {
    private static final UUID ID_UNICO = new UUID(0, 1);

    private final ConexaoGoogleAgendaJpaRepository repositorio;
    private final CifraTokenGoogleAgenda cifra;
    private final Clock relogio;

    public AdapterConexaoGoogleAgendaJpa(ConexaoGoogleAgendaJpaRepository repositorio,
            CifraTokenGoogleAgenda cifra, Clock relogio) {
        this.repositorio = repositorio;
        this.cifra = cifra;
        this.relogio = relogio;
    }

    @Override
    @Transactional(readOnly = true)
    public String estado() {
        return repositorio.findById(ID_UNICO).map(ConexaoGoogleAgendaEntity::estado).orElse("NAO_CONECTADA");
    }

    @Override
    @Transactional
    public Optional<Conexao> obter() {
        return repositorio.findById(ID_UNICO).filter(entidade ->
                        "CONECTADA".equals(entidade.estado()) && entidade.token() != null)
                .map(entidade -> {
                    try {
                        String refreshToken = cifra.decifrar(
                                new CifraTokenGoogleAgenda.Dados(entidade.iv(), entidade.token()));
                        return new Conexao(refreshToken, entidade.atualizadaEm());
                    } catch (RuntimeException falhaDeCifra) {
                        salvarEstado("INDISPONIVEL", relogio.instant());
                        return null;
                    }
                });
    }

    @Override
    @Transactional
    public void salvar(String refreshToken, Instant conectadaEm) {
        var token = cifra.cifrar(refreshToken);
        repositorio.save(new ConexaoGoogleAgendaEntity(ID_UNICO, "CONECTADA", token.iv(), token.valor(), conectadaEm));
    }

    @Override
    @Transactional
    public void desconectar(Instant desconectadaEm) {
        salvarEstado("DESCONECTADA", desconectadaEm);
    }

    @Override
    @Transactional
    public void marcarIndisponivel(Instant indisponivelEm) {
        salvarEstado("INDISPONIVEL", indisponivelEm);
    }

    private void salvarEstado(String estado, Instant alteradaEm) {
        repositorio.save(new ConexaoGoogleAgendaEntity(ID_UNICO, estado, null, null, alteradaEm));
    }
}
