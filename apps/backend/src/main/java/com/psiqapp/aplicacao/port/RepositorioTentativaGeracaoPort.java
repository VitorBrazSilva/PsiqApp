package com.psiqapp.aplicacao.port;

import com.psiqapp.dominio.modelo.TentativaGeracao;

public interface RepositorioTentativaGeracaoPort {
    TentativaGeracao salvar(TentativaGeracao tentativa);
}
