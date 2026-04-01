package com.quizapp.controller;

import com.quizapp.dao.QuizDao;
import com.quizapp.model.Question;
import com.quizapp.model.Quiz;
import io.javalin.Javalin;
import java.util.Map;

public class QuizController {

    private final QuizDao quizDao;

    public QuizController() {
        this.quizDao = new QuizDao();
    }

    public void setupRoutes(Javalin app) {

        // ==========================================
        // QUIZ ROUTES
        // ==========================================

        // Get all quizzes
        app.get("/api/quizzes", ctx -> {
            ctx.json(quizDao.getAllQuizzes());
        });

        // Create a new quiz
        app.post("/api/quizzes", ctx -> {
            Quiz quiz = ctx.bodyAsClass(Quiz.class);
            int id = quizDao.createQuiz(quiz);
            if (id > 0) {
                ctx.status(201).json(Map.of("message", "Quiz created", "quizId", id));
            } else {
                ctx.status(500).json(Map.of("error", "Failed to create quiz"));
            }
        });

        // Update quiz details (title/description)
        app.put("/api/quizzes/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Quiz quiz = ctx.bodyAsClass(Quiz.class);
            quizDao.updateQuiz(id, quiz);
            ctx.json(Map.of("message", "Quiz updated successfully"));
        });

        // Delete an entire quiz (and its questions)
        app.delete("/api/quizzes/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            quizDao.deleteQuiz(id);
            ctx.json(Map.of("message", "Quiz deleted successfully"));
        });


        // ==========================================
        // QUESTION ROUTES
        // ==========================================

        // Get all questions for a specific quiz
        app.get("/api/quizzes/{id}/questions", ctx -> {
            int quizId = Integer.parseInt(ctx.pathParam("id"));
            ctx.json(quizDao.getQuestionsByQuizId(quizId));
        });

        // Add a new question to a specific quiz
        app.post("/api/quizzes/{id}/questions", ctx -> {
            int quizId = Integer.parseInt(ctx.pathParam("id"));
            Question question = ctx.bodyAsClass(Question.class);
            quizDao.addQuestion(quizId, question);
            ctx.status(201).json(Map.of("message", "Question added"));
        });

        // NEW: Update a specific question by Question ID
        app.put("/api/questions/{id}", ctx -> {
            try {
                int questionId = Integer.parseInt(ctx.pathParam("id"));
                Question question = ctx.bodyAsClass(Question.class);
                quizDao.updateQuestion(questionId, question);
                ctx.json(Map.of("message", "Question updated successfully"));
            } catch (Exception e) {
                ctx.status(500).json(Map.of("error", "Failed to update question"));
            }
        });

        // NEW: Delete a specific question by Question ID
        app.delete("/api/questions/{id}", ctx -> {
            try {
                int questionId = Integer.parseInt(ctx.pathParam("id"));
                quizDao.deleteQuestion(questionId);
                ctx.json(Map.of("message", "Question deleted successfully"));
            } catch (Exception e) {
                ctx.status(500).json(Map.of("error", "Failed to delete question"));
            }
        });
    }
}