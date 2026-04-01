package com.quizapp.controller;

import com.quizapp.dao.AttemptDao;
import io.javalin.Javalin;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Handles all incoming requests related to quiz results, scores, and leaderboards.
 * Fulfills Requirement #4: Scoring and Progress Tracking.
 */
public class ResultController {
    
    private final AttemptDao attemptDao;
    // Formatter for IST time display
    private static final DateTimeFormatter IST_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public ResultController() {
        this.attemptDao = new AttemptDao();
    }

    /**
     * Data Transfer Object for receiving quiz attempt data from the frontend.
     */
    public static class AttemptDto {
        public int userId;
        public int quizId;
        public int score;
        public int totalQuestions;
        public String timestamp; // Optional field for client-side time
    }

    public void setupRoutes(Javalin app) {
        
        // POST /api/results
        // Records a new quiz attempt. Captures the current IST time for the record.
        app.post("/api/results", ctx -> {
            AttemptDto attempt = ctx.bodyAsClass(AttemptDto.class);
            
            // Capture current time in IST (Asia/Kolkata)
            LocalDateTime istNow = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
            String formattedTime = istNow.format(IST_FORMATTER);
            
            boolean success = attemptDao.saveAttempt(
                attempt.userId, 
                attempt.quizId, 
                attempt.score, 
                attempt.totalQuestions
            );

            if (success) {
                ctx.status(201).json(Map.of(
                    "message", "Result saved successfully",
                    "recordedTimeIST", formattedTime
                ));
            } else {
                ctx.status(500).json(Map.of("error", "Failed to save quiz result"));
            }
        });

        // GET /api/leaderboard
        // Returns the top 10 global scores across all users and quizzes.
        app.get("/api/leaderboard", ctx -> {
            // The attemptDao.getLeaderboard() method is responsible for 
            // returning only the top 10 results from the database.
            ctx.json(attemptDao.getLeaderboard());
        });

        // GET /api/results/user/{userId}
        // Requirement 4: Fetches the history of attempts for a specific student.
        app.get("/api/results/user/{userId}", ctx -> {
            try {
                int userId = Integer.parseInt(ctx.pathParam("userId"));
                ctx.json(attemptDao.getUserAttempts(userId));
            } catch (NumberFormatException e) {
                ctx.status(400).json(Map.of("error", "Invalid User ID format"));
            }
        });
    }
}