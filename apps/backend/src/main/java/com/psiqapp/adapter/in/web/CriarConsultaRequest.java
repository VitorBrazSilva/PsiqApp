package com.psiqapp.adapter.in.web;

import java.time.Instant;

public record CriarConsultaRequest(Instant agendadaPara, String observacoes) {}
