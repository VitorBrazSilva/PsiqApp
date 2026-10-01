package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.ConexaoGoogleAgendaPort;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AdapterConexaoGoogleAgendaJpa implements ConexaoGoogleAgendaPort {
    private static final UUID ID_UNICO = new UUID(0, 1);
    private final ConexaoGoogleAgendaJpaRepository repositorio;
    private final CifraTokenGoogleAgenda cifra;
    public AdapterConexaoGoogleAgendaJpa(ConexaoGoogleAgendaJpaRepository repositorio, CifraTokenGoogleAgenda cifra) { this.repositorio = repositorio; this.cifra = cifra; }
    @Override @Transactional(readOnly = true) public String estado() {
        return repositorio.findById(ID_UNICO).map(ConexaoGoogleAgendaEntity::estado).orElse("NAO_CONECTADA");
    }
    @Override @Transactional(readOnly = true) public Optional<Conexao> obter() {
        return repositorio.findById(ID_UNICO).filter(e -> "CONECTADA".equals(e.estado()) && e.token() != null)
                .map(e -> new Conexao(cifra.decifrar(new CifraTokenGoogleAgenda.Dados(e.iv(), e.token())), e.atualizadaEm()));
    }
    @Override @Transactional public void salvar(String refreshToken, Instant conectadaEm) {
        var token = cifra.cifrar(refreshToken);
        repositorio.save(new ConexaoGoogleAgendaEntity(ID_UNICO, "CONECTADA", token.iv(), token.valor(), conectadaEm));
    }
    @Override @Transactional public void desconectar(Instant desconectadaEm) {
        repositorio.save(new ConexaoGoogleAgendaEntity(ID_UNICO, "DESCONECTADA", null, null, desconectadaEm));
    }
}
