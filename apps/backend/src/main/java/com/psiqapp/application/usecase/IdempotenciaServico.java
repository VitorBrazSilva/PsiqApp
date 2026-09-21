package com.psiqapp.application.usecase;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.psiqapp.application.port.out.RegistroIdempotencia;
import com.psiqapp.application.port.out.RepositoryIdempotenciaPort;
import com.psiqapp.domain.validation.ConflitoException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

public class IdempotenciaServico {
    private static final Map<String, Object> LOCKS = new ConcurrentHashMap<>();
    private final RepositoryIdempotenciaPort repositorio;
    private final ObjectMapper json;

    public IdempotenciaServico(RepositoryIdempotenciaPort repositorio, ObjectMapper json) {
        this.repositorio = repositorio;
        this.json = json;
    }

    public <T> T serializar(String operacao, UUID pacienteId, UUID chave, Supplier<T> bloco) {
        String escopo = operacao + ":" + (pacienteId == null ? "global" : pacienteId) + ":" + chave;
        Object lock = LOCKS.computeIfAbsent(escopo, ignorado -> new Object());
        synchronized (lock) {
            return bloco.get();
        }
    }

    Optional<RegistroIdempotencia> existente(String operacao, UUID pacienteId, UUID chave, Object payload) {
        var existente = repositorio.buscar(operacao, pacienteId, chave);
        if (existente.isPresent() && !Arrays.equals(existente.get().hashPayload(), hash(payload))) {
            throw new ConflitoException();
        }
        return existente;
    }

    void registrar(String operacao, UUID pacienteId, UUID chave, Object payload, String tipoRecurso,
            UUID recursoId, int status) {
        repositorio.salvar(new RegistroIdempotencia(operacao, pacienteId, chave, hash(payload),
                tipoRecurso, recursoId, status));
    }

    private byte[] hash(Object payload) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(json.writeValueAsBytes(payload));
        } catch (NoSuchAlgorithmException | JsonProcessingException e) {
            throw new IllegalStateException("Falha ao calcular idempotencia.", e);
        }
    }
}
