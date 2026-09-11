package com.psiqapp.configuracao;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.joran.JoranConfigurator;
import ch.qos.logback.classic.util.LogbackMDCAdapter;
import ch.qos.logback.core.OutputStreamAppender;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class LogsSegurosTest {
    @Test
    void encoderNaoEmiteMensagemArgumentosOuStacktrace() throws Exception {
        var contexto = new LoggerContext();
        contexto.setMDCAdapter(new LogbackMDCAdapter());
        contexto.getMDCAdapter().put("body", "MDC_FICTICIO_NAO_PERMITIDO");
        contexto.getMDCAdapter().put("requestId", "00000000-0000-0000-0000-000000000001");
        try {
            var configurador = new JoranConfigurator();
            configurador.setContext(contexto);
            configurador.doConfigure(getClass().getResource("/logback-spring.xml"));
            var logger = contexto.getLogger("ROOT");
            var appender = (OutputStreamAppender<?>) logger.getAppender("CONSOLE");
            var saida = new ByteArrayOutputStream();
            appender.setOutputStream(saida);
            logger.error("BODY_FICTICIO {}", "SEGREDO_FICTICIO", new RuntimeException("ERRO_FICTICIO"));
            String log = saida.toString(StandardCharsets.UTF_8);
            assertThat(log).contains("\"level\":\"ERROR\"")
                    .contains("00000000-0000-0000-0000-000000000001")
                    .doesNotContain("BODY_FICTICIO", "SEGREDO_FICTICIO", "ERRO_FICTICIO", "RuntimeException",
                            "MDC_FICTICIO_NAO_PERMITIDO");
        } finally {
            contexto.stop();
        }
    }
}
