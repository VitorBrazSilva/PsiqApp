package com.psiqapp.adapter.out.persistence;

import com.psiqapp.domain.modelo.EstadoGeracaoAnalise;
import com.psiqapp.domain.modelo.GatilhoGeracaoAnalise;
import com.psiqapp.domain.modelo.ModoAnalise;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "geracao_analise")
class EntidadeGeracaoAnaliseJpa {
    @Id UUID id;
    @Column(name = "paciente_id", nullable = false) UUID pacienteId;
    @Enumerated(EnumType.STRING)
    @Column(name = "gatilho", nullable = false) GatilhoGeracaoAnalise gatilho;
    @Column(name = "registro_disparador_id") UUID registroDisparadorId;
    @Column(name = "revisao_snapshot", nullable = false) long revisaoSnapshot;
    @Column(name = "sequencia_requisicao", nullable = false) long sequenciaRequest;
    @Column(name = "solicitada_em", nullable = false) Instant solicitadaEm;
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false) EstadoGeracaoAnalise state;
    @Column(name = "total_registros", nullable = false) int totalRegistros;
    @Column(name = "total_pareceres", nullable = false) int totalOriginais;
    @Column(name = "total_complementos", nullable = false) int totalComplementos;
    @Column(name = "ultimo_registro_clinico_id") UUID ultimoRegistroClinicoId;
    @Column(name = "contagem_tentativas", nullable = false) int tentativas;
    @Enumerated(EnumType.STRING)
    @Column(name = "modo", nullable = false) ModoAnalise mode;
}
