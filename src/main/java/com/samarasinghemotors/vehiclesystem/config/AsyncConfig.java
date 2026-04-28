package com.samarasinghemotors.vehiclesystem.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Configures asynchronous processing for background tasks like sending emails
}
