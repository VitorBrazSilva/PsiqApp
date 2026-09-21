package com.psiqapp.adapter.out.persistence;

import com.psiqapp.application.port.out.Pagina;
import com.psiqapp.application.port.out.RepositoryPacientePort;
import com.psiqapp.domain.modelo.Paciente;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdapterPacienteJpa implements RepositoryPacientePort {
    private final RepositoryPacienteJpaSpring repositorio;
    private final JdbcTemplate jdbc;

    AdapterPacienteJpa(RepositoryPacienteJpaSpring repositorio, JdbcTemplate jdbc) {
        this.repositorio = repositorio;
        this.jdbc = jdbc;
    }

    @Override
    public Paciente salvar(Paciente paciente) {
        try {
            return paraDominio(repositorio.saveAndFlush(paraJpa(paciente)));
        } catch (DataIntegrityViolationException e) {
            throw e;
        }
    }

    @Override
    public Optional<Paciente> buscarPorId(UUID id) {
        return repositorio.findById(id).map(this::paraDominio);
    }

    @Override
    public boolean existePorCpf(String cpf) {
        return repositorio.existsByCpf(cpf);
    }

    @Override
    public Pagina<Paciente> buscarPorNome(String termoBusca, int pagina, int tamanho) {
        String termoLiteral = termoBusca;
        String termo = termoLiteral.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        var parametros = new ArrayList<>();
        var filtro = new StringBuilder(" from paciente");
        if (!termoLiteral.isBlank()) {
            if (termoLiteral.contains("%") || termoLiteral.contains("_") || termoLiteral.contains("\\")) {
                filtro.append(" where position(? in nome_busca) > 0");
                parametros.add(termoLiteral);
            } else {
                filtro.append(" where nome_busca like ? escape '\\'");
                parametros.add("%" + termo + "%");
            }
        }
        Long total = jdbc.queryForObject("select count(*)" + filtro, Long.class, parametros.toArray());
        parametros.add(tamanho);
        parametros.add((long) pagina * tamanho);
        var itens = jdbc.query("""
                select id, nome, nome_busca, cpf, data_nascimento, telefone, email, queixa_inicial, criado_em
                """ + filtro + " order by nome_busca asc, id asc limit ? offset ?",
                (rs, rowNum) -> new Paciente(
                        rs.getObject("id", UUID.class),
                        rs.getString("nome"),
                        rs.getString("cpf"),
                        rs.getDate("data_nascimento").toLocalDate(),
                        rs.getString("telefone"),
                        rs.getString("email"),
                        rs.getString("queixa_inicial"),
                        rs.getString("nome_busca"),
                        rs.getTimestamp("criado_em").toInstant()),
                parametros.toArray());
        return new Pagina<>(itens, pagina, tamanho, total == null ? 0 : total);
    }

    private EntidadePacienteJpa paraJpa(Paciente paciente) {
        var entidade = new EntidadePacienteJpa();
        entidade.id = paciente.id();
        entidade.nome = paciente.nome();
        entidade.nomeBusca = paciente.nomeBusca();
        entidade.cpf = paciente.cpf();
        entidade.dataNascimento = paciente.dataNascimento();
        entidade.telefone = paciente.telefone();
        entidade.email = paciente.email();
        entidade.queixaInicial = paciente.queixaInicial();
        entidade.criadoEm = paciente.criadoEm();
        return entidade;
    }

    private Paciente paraDominio(EntidadePacienteJpa entidade) {
        return new Paciente(entidade.id, entidade.nome, entidade.cpf, entidade.dataNascimento,
                entidade.telefone, entidade.email, entidade.queixaInicial, entidade.nomeBusca, entidade.criadoEm);
    }
}
