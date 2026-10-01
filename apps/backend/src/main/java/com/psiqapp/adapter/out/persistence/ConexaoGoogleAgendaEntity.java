package com.psiqapp.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "conexao_google_agenda")
public class ConexaoGoogleAgendaEntity {
    @Id private UUID id;
    @Column(name = "estado", nullable = false, length = 24) private String estado;
    @Column(name = "refresh_token_iv", length = 24) private String iv;
    @Column(name = "refresh_token_cifrado", length = 4096) private String token;
    @Column(name = "atualizada_em", nullable = false) private Instant atualizadaEm;
    protected ConexaoGoogleAgendaEntity() {}
    public ConexaoGoogleAgendaEntity(UUID id, String estado, String iv, String token, Instant atualizadaEm) {
        this.id = id; this.estado = estado; this.iv = iv; this.token = token; this.atualizadaEm = atualizadaEm;
    }
    public UUID id() { return id; }
    public String estado() { return estado; }
    public String iv() { return iv; }
    public String token() { return token; }
    public Instant atualizadaEm() { return atualizadaEm; }
}
