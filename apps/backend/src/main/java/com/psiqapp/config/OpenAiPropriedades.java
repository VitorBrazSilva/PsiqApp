package com.psiqapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "psiqapp.analise.provider")
public record OpenAiPropriedades(String type, String model) {}
