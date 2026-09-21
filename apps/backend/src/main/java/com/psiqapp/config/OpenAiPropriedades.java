package com.psiqapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "psiqapp.analysis.provider")
public record OpenAiPropriedades(String type, String model) {}
