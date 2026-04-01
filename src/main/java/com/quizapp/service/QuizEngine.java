package com.quizapp.service;

import com.quizapp.dao.AttemptDao;
import com.quizapp.dao.QuizDao;
import com.quizapp.model.Question;
import java.util.List;

public class QuizEngine {
    private final QuizDao quizDao;
    private final AttemptDao attemptDao;

    public QuizEngine() {
        this.quizDao = new QuizDao();
        this.attemptDao = new AttemptDao();
    }

    /**
     * This service can be used for server-side validation of scores.
     * Currently, the frontend calculates the score, but this engine 
     * could be expanded to handle timed sessions or complex grading logic.
     */
    public double calculatePercentage(int score, int total) {
        if (total == 0) return 0;
        return ((double) score / total) * 100;
    }

    /**
     * Verifies if a specific answer is correct for a given question ID.
     * Fixed: Uses getQuestionsByQuizId to correctly match the QuizDao method.
     */
    public boolean isCorrect(int questionId, String userAnswer, int quizId) {
        List<Question> questions = quizDao.getQuestionsByQuizId(quizId);
        for (Question q : questions) {
            if (q.getId() == questionId) {
                return q.getCorrectOption().equalsIgnoreCase(userAnswer);
            }
        }
        return false;
    }

    /**
     * Business logic to process and save a result via the AttemptDao.
     */
    public boolean processAndSaveResult(int userId, int quizId, int score, int total) {
        return attemptDao.saveAttempt(userId, quizId, score, total);
    }
}