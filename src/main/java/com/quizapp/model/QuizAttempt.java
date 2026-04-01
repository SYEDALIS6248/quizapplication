package com.quizapp.model;

public class QuizAttempt {
    private int id;
    private int userId;
    private int quizId;
    private int score;
    private int totalQuestions;
    private String attemptDate;

    public QuizAttempt() {}

    public QuizAttempt(int id, int userId, int quizId, int score, int totalQuestions, String attemptDate) {
        this.id = id;
        this.userId = userId;
        this.quizId = quizId;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.attemptDate = attemptDate;
    }

    // --- Getters and Setters ---
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getQuizId() { return quizId; }
    public void setQuizId(int quizId) { this.quizId = quizId; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public String getAttemptDate() { return attemptDate; }
    public void setAttemptDate(String attemptDate) { this.attemptDate = attemptDate; }
}