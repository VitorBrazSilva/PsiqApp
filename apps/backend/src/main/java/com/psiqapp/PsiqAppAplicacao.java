package com.psiqapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.psiqapp.config.GoogleAgendaPropriedades;

@SpringBootApplication
@EnableConfigurationProperties(GoogleAgendaPropriedades.class)
public class PsiqAppAplicacao {
    public static void main(String[] args) {
        SpringApplication.run(PsiqAppAplicacao.class, args);
    }
}
