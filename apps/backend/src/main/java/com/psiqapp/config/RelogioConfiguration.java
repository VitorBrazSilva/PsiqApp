package com.psiqapp.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class RelogioConfiguration {
    @Bean
    Clock relogio() {
        return Clock.systemUTC();
    }
}
