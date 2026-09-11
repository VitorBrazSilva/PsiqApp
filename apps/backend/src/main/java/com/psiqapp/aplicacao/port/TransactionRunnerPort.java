package com.psiqapp.aplicacao.port;

import java.util.function.Supplier;

public interface TransactionRunnerPort {
    <T> T executar(Supplier<T> bloco);
}
