package com.psiqapp.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "psiqapp.analysis.worker")
public record AnaliseWorkerPropriedades(boolean enabled, Duration pollInterval, Duration callTimeout,
        Duration attemptBudget, Duration leaseTtl, int maxAttempts, Duration backoffInitial,
        Duration backoffFinal) {}
