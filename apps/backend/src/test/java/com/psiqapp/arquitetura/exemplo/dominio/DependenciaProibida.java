package com.psiqapp.domain.exemplo;

import com.psiqapp.adapter.exemplo.AdapterDeExemplo;

/** Fixture negativa: comprova que o gate arquitetural detecta uma dependencia invertida. */
public class DependenciaProibida {
    private AdapterDeExemplo adapter;

    public AdapterDeExemplo dependenciaArquiteturalProibida() {
        return adapter;
    }
}
