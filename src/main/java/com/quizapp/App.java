package com.quizapp;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
// Add these imports to fix the "cannot be resolved" errors
import com.quizapp.controller.AuthController;
import com.quizapp.controller.QuizController;
import com.quizapp.controller.ResultController;

public class App {
    public static void main(String[] args) {
        // Initialize the Javalin web server
        Javalin app = Javalin.create(config -> {
            // Serve static files (HTML, CSS, JS) from the resources/static folder
            config.staticFiles.add("/static", Location.CLASSPATH);
        }).start(8080);

        System.out.println("🚀 Server started successfully!");
        System.out.println("🌐 Access your app at: http://localhost:8080/html/index.html");

        // A simple test endpoint to make sure the API is working
        app.get("/api/health", ctx -> {
            ctx.result("Quiz API is up and running!");
        });

        // Register Controllers
        AuthController authController = new AuthController();
        authController.setupRoutes(app);

        QuizController quizController = new QuizController();
        quizController.setupRoutes(app);

        ResultController resultController = new ResultController();
        resultController.setupRoutes(app);
    }
}