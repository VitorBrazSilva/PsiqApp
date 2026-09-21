package com.psiqapp.arquitetura.exemplo.domain;

import com.psiqapp.arquitetura.exemplo.adapter.AdapterDeExemplo;

/** Fixture negativa: comprova que o gate arquitetural detecta uma dependencia invertida. */
public class DependenciaProibida {
    private AdapterDeExemplo adapter;
}
