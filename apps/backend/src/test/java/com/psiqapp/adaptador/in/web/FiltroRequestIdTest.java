package com.psiqapp.adaptador.in.web;

import static org.assertj.core.api.Assertions.*;

import jakarta.servlet.ServletException;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class FiltroRequestIdTest {
    @Test
    void restauraContextoMesmoQuandoCadeiaFalha() {
        MDC.put("anterior", "contexto");
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();
        try {
            assertThatThrownBy(() -> new FiltroRequestId().doFilter(request, response, (req, res) -> {
                assertThat(MDC.get("requestId")).isEqualTo(req.getAttribute(FiltroRequestId.ATRIBUTO));
                assertThat(MDC.get("anterior")).isNull();
                throw new ServletException("falha ficticia");
            })).isInstanceOf(ServletException.class);
            assertThat(MDC.get("anterior")).isEqualTo("contexto");
            assertThat(MDC.get("requestId")).isNull();
            assertThat(response.getHeader(FiltroRequestId.HEADER)).isNotNull();
        } finally {
            MDC.clear();
        }
    }

    @Test
    void geraIdsDistintosParaRequisicoesSemHeader() throws Exception {
        var filtro = new FiltroRequestId();
        var primeira = new MockHttpServletResponse();
        var segunda = new MockHttpServletResponse();
        filtro.doFilter(new MockHttpServletRequest(), primeira, (req, res) -> {});
        filtro.doFilter(new MockHttpServletRequest(), segunda, (req, res) -> {});
        assertThat(UUID.fromString(primeira.getHeader(FiltroRequestId.HEADER)))
                .isNotEqualTo(UUID.fromString(segunda.getHeader(FiltroRequestId.HEADER)));
    }
}
