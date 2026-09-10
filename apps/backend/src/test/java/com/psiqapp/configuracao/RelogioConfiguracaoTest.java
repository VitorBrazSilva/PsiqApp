package com.psiqapp.configuracao;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Primary;

class RelogioConfiguracaoTest {
    @Test
    void relogioPadraoUtcPodeSerSubstituidoPorClockFixo() {
        try (var contexto = new AnnotationConfigApplicationContext(RelogioConfiguracao.class)) {
            assertThat(contexto.getBean(Clock.class).getZone()).isEqualTo(ZoneOffset.UTC);
        }
        try (var contexto = new AnnotationConfigApplicationContext(RelogioConfiguracao.class, RelogioFixo.class)) {
            assertThat(Instant.now(contexto.getBean(Clock.class))).isEqualTo(Instant.parse("2026-01-01T00:00:00Z"));
        }
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class RelogioFixo {
        @Bean
        @Primary
        Clock fixo() {
            return Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
        }
    }
}
