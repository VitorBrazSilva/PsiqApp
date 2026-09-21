package com.psiqapp.adapter.in.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class FiltroRequestId extends OncePerRequestFilter {
    public static final String ATRIBUTO = FiltroRequestId.class.getName() + ".requestId";
    public static final String HEADER = "X-Request-Id";
    private static final Pattern UUID_CANONICO = Pattern.compile(
            "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
    private static final Logger LOG = LoggerFactory.getLogger("com.psiqapp.operacional");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        Map<String, String> contextoAnterior = MDC.getCopyOfContextMap();
        String recebido = request.getHeader(HEADER);
        String requestId = recebido != null && UUID_CANONICO.matcher(recebido).matches()
                ? recebido.toLowerCase(java.util.Locale.ROOT) : UUID.randomUUID().toString();
        request.setAttribute(ATRIBUTO, requestId);
        response.setHeader(HEADER, requestId);
        long inicio = System.nanoTime();
        boolean concluiu = false;
        try {
            MDC.clear();
            MDC.put("requestId", requestId);
            chain.doFilter(request, response);
            concluiu = true;
        } finally {
            MDC.put("status", Integer.toString(concluiu ? response.getStatus() : 500));
            MDC.put("duracaoMs", Long.toString((System.nanoTime() - inicio) / 1_000_000));
            LOG.info("requisicao_finalizada");
            MDC.clear();
            if (contextoAnterior != null) {
                MDC.setContextMap(contextoAnterior);
            }
        }
    }
}
