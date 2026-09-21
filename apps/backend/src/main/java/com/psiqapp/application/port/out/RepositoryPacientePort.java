package com.psiqapp.application.port.out;

import com.psiqapp.domain.modelo.Paciente;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryPacientePort {
    Paciente salvar(Paciente paciente);
    Optional<Paciente> buscarPorId(UUID id);
    boolean existePorCpf(String cpf);
    Pagina<Paciente> buscarPorNome(String termoBusca, int pagina, int tamanho);
}
