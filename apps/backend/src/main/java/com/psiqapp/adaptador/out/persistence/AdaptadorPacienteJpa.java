package com.psiqapp.adaptador.out.persistence;

import com.psiqapp.aplicacao.port.Pagina;
import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.dominio.modelo.Paciente;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@ConditionalOnProperty(prefix = "psiqapp.product", name = "enabled", havingValue = "true", matchIfMissing = true)
class AdaptadorPacienteJpa implements RepositorioPacientePort {
    private final RepositorioPacienteJpaSpring repositorio;
    private final JdbcTemplate jdbc;

    AdaptadorPacienteJpa(RepositorioPacienteJpaSpring repositorio, JdbcTemplate jdbc) {
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
        var filtro = new StringBuilder(" from patient");
        if (!termoLiteral.isBlank()) {
            if (termoLiteral.contains("%") || termoLiteral.contains("_") || termoLiteral.contains("\\")) {
                filtro.append(" where position(? in search_name) > 0");
                parametros.add(termoLiteral);
            } else {
                filtro.append(" where search_name like ? escape '\\'");
                parametros.add("%" + termo + "%");
            }
        }
        Long total = jdbc.queryForObject("select count(*)" + filtro, Long.class, parametros.toArray());
        parametros.add(tamanho);
        parametros.add((long) pagina * tamanho);
        var itens = jdbc.query("""
                select id, name, search_name, cpf, birth_date, phone, email, initial_complaint, created_at
                """ + filtro + " order by search_name asc, id asc limit ? offset ?",
                (rs, rowNum) -> new Paciente(
                        rs.getObject("id", UUID.class),
                        rs.getString("name"),
                        rs.getString("cpf"),
                        rs.getDate("birth_date").toLocalDate(),
                        rs.getString("phone"),
                        rs.getString("email"),
                        rs.getString("initial_complaint"),
                        rs.getString("search_name"),
                        rs.getTimestamp("created_at").toInstant()),
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
        entidade.phone = paciente.telefone();
        entidade.email = paciente.email();
        entidade.queixaInicial = paciente.queixaInicial();
        entidade.criadoEm = paciente.criadoEm();
        return entidade;
    }

    private Paciente paraDominio(EntidadePacienteJpa entidade) {
        return new Paciente(entidade.id, entidade.nome, entidade.cpf, entidade.dataNascimento,
                entidade.phone, entidade.email, entidade.queixaInicial, entidade.nomeBusca, entidade.criadoEm);
    }
}
