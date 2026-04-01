package com.quizapp.controller;

import com.quizapp.model.User;
import com.quizapp.service.AuthService;
import io.javalin.Javalin;
import java.util.Map;

public class AuthController {
    
    private final AuthService authService;

    public AuthController() {
        this.authService = new AuthService();
    }

    public static class UserCredentials {
        public String username;
        public String password;
        public String firstName;
        public String lastName;
        public String mobile;
        public boolean isAdmin;
    }

    // DTO specifically for Resetting Password
    public static class ResetCredentials {
        public String username;
        public String newPassword;
    }

    public void setupRoutes(Javalin app) {
        
        // POST /api/register
        app.post("/api/register", ctx -> {
            UserCredentials credentials = ctx.bodyAsClass(UserCredentials.class);
            
            if (credentials.isAdmin && authService.hasAdmin()) {
                ctx.status(403).json(Map.of("error", "An administrator already exists. Only one admin is allowed."));
                return;
            }

            boolean success = authService.register(
                credentials.username, 
                credentials.password, 
                credentials.firstName, 
                credentials.lastName, 
                credentials.mobile, 
                credentials.isAdmin
            );
            
            if (success) {
                ctx.status(201).json(Map.of("message", "User registered successfully!"));
            } else {
                ctx.status(400).json(Map.of("error", "Registration failed. Username might be taken."));
            }
        });

        // POST /api/login
        app.post("/api/login", ctx -> {
            UserCredentials credentials = ctx.bodyAsClass(UserCredentials.class);
            User user = authService.authenticate(credentials.username, credentials.password);

            if (user != null) {
                ctx.status(200).json(Map.of(
                    "userId", user.getId(),
                    "username", user.getUsername(),
                    "role", user.getRole()
                ));
            } else {
                ctx.status(401).json(Map.of("error", "Invalid username or password"));
            }
        });

        // POST /api/auth/reset-password
        app.post("/api/auth/reset-password", ctx -> {
            ResetCredentials creds = ctx.bodyAsClass(ResetCredentials.class);
            
            boolean success = authService.updatePassword(creds.username, creds.newPassword);
            
            if (success) {
                ctx.status(200).json(Map.of("message", "Password updated successfully"));
            } else {
                ctx.status(404).json(Map.of("error", "User not found. Please check the username."));
            }
        });
    }
}