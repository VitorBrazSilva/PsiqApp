package com.psiqapp.configuracao;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class RelogioConfiguracao {
    @Bean
    Clock relogio() {
        return Clock.systemUTC();
    }
}
