package com.psiqapp.application.port.out;

import com.psiqapp.domain.modelo.TentativaGeracao;

public interface RepositoryTentativaGeracaoPort {
    TentativaGeracao salvar(TentativaGeracao tentativa);
}
