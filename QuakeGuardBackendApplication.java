package com.quakeguard.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class QuakeGuardBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuakeGuardBackendApplication.class, args);
        System.out.println("[QuakeGuard Backend Service] Initialized REST Server on Port 8080");
    }
}
