package com.psiqapp.aplicacao.usecase;

import com.psiqapp.aplicacao.port.RepositorioPacientePort;
import com.psiqapp.aplicacao.port.TransactionRunnerPort;
import com.psiqapp.dominio.modelo.Paciente;
import com.psiqapp.dominio.validacao.ConflitoException;
import com.psiqapp.dominio.validacao.ErroDeValidacao;
import com.psiqapp.dominio.validacao.Normalizadores;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

public class CriarPacienteCasoDeUso {
    public record Comando(String nome, String cpf, LocalDate dataNascimento, String telefone,
            String email, String queixaInicial, UUID chaveIdempotencia) {}

    private static final String OPERACAO = "CRIAR_PACIENTE";
    private final RepositorioPacientePort pacientes;
    private final IdempotenciaServico idempotencia;
    private final TransactionRunnerPort transacao;
    private final Clock relogio;

    public CriarPacienteCasoDeUso(RepositorioPacientePort pacientes, IdempotenciaServico idempotencia,
            TransactionRunnerPort transacao, Clock relogio) {
        this.pacientes = pacientes;
        this.idempotencia = idempotencia;
        this.transacao = transacao;
        this.relogio = relogio;
    }

    public Paciente executar(Comando comando) {
        return idempotencia.serializar(OPERACAO, null, comando.chaveIdempotencia(), () -> transacao.executar(() -> {
            var existente = idempotencia.existente(OPERACAO, null, comando.chaveIdempotencia(), comando);
            if (existente.isPresent()) {
                return pacientes.buscarPorId(existente.get().recursoId()).orElseThrow(ConflitoException::new);
            }
            Paciente paciente = montar(comando);
            if (pacientes.existePorCpf(paciente.cpf())) throw new ConflitoException();
            Paciente salvo = pacientes.salvar(paciente);
            idempotencia.registrar(OPERACAO, null, comando.chaveIdempotencia(), comando, "PACIENTE", salvo.id(), 201);
            return salvo;
        }));
    }

    private Paciente montar(Comando comando) {
        var erros = new ArrayList<ErroDeValidacao>();
        String nome = Normalizadores.textoObrigatorio(comando.nome(), "nome", erros);
        String cpf = Normalizadores.cpf(comando.cpf(), erros);
        var nascimento = Normalizadores.nascimento(comando.dataNascimento(), relogio, erros);
        String telefone = Normalizadores.telefone(comando.telefone(), erros);
        String email = Normalizadores.email(comando.email(), erros);
        String queixa = Normalizadores.opcional(comando.queixaInicial());
        Normalizadores.validarSemErros(erros);
        return new Paciente(UUID.randomUUID(), nome, cpf, nascimento, telefone, email, queixa,
                Normalizadores.nomeBusca(nome), relogio.instant());
    }
}
