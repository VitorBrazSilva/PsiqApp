package com.psiqapp.aplicacao.port;

import com.psiqapp.dominio.modelo.Paciente;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioPacientePort {
    Paciente salvar(Paciente paciente);
    Optional<Paciente> buscarPorId(UUID id);
    boolean existePorCpf(String cpf);
    Pagina<Paciente> buscarPorNome(String termoBusca, int pagina, int tamanho);
}
