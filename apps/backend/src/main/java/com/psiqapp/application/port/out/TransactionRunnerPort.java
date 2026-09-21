package com.psiqapp.application.port.out;

import java.util.function.Supplier;

public interface TransactionRunnerPort {
    <T> T executar(Supplier<T> bloco);
}
