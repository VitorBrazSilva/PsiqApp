package com.psiqapp.dominio.modelo;

import java.util.List;

public record ItemAnaliseClinica(String text, NaturezaObservacao nature, List<EvidenciaAnalise> evidence) {}
