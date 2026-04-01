package com.quizapp.dao;

import com.quizapp.model.Question;
import com.quizapp.model.Quiz;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class QuizDao {

    // ==========================================
    // QUIZ OPERATIONS
    // ==========================================

    public int createQuiz(Quiz quiz) {
        String sql = "INSERT INTO quizzes (title, description, created_by) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, quiz.getTitle());
            pstmt.setString(2, quiz.getDescription());
            pstmt.setInt(3, quiz.getCreatedBy());
            pstmt.executeUpdate();

            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public List<Quiz> getAllQuizzes() {
        List<Quiz> quizzes = new ArrayList<>();
        String sql = "SELECT * FROM quizzes";
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Quiz q = new Quiz();
                q.setId(rs.getInt("id"));
                q.setTitle(rs.getString("title"));
                q.setDescription(rs.getString("description"));
                q.setCreatedBy(rs.getInt("created_by"));
                quizzes.add(q);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return quizzes;
    }

    public void updateQuiz(int id, Quiz quiz) {
        String sql = "UPDATE quizzes SET title = ?, description = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, quiz.getTitle());
            pstmt.setString(2, quiz.getDescription());
            pstmt.setInt(3, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteQuiz(int id) {
        // Because of ON DELETE CASCADE in schema, this will also delete associated questions
        String sql = "DELETE FROM quizzes WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // ==========================================
    // QUESTION OPERATIONS
    // ==========================================

    public void addQuestion(int quizId, Question q) {
        String sql = "INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, quizId);
            pstmt.setString(2, q.getQuestionText());
            pstmt.setString(3, q.getOptionA());
            pstmt.setString(4, q.getOptionB());
            pstmt.setString(5, q.getOptionC());
            pstmt.setString(6, q.getOptionD());
            pstmt.setString(7, q.getCorrectOption());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<Question> getQuestionsByQuizId(int quizId) {
        List<Question> questions = new ArrayList<>();
        String sql = "SELECT * FROM questions WHERE quiz_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, quizId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Question q = new Question();
                    q.setId(rs.getInt("id"));
                    q.setQuizId(rs.getInt("quiz_id"));
                    q.setQuestionText(rs.getString("question_text"));
                    q.setOptionA(rs.getString("option_a"));
                    q.setOptionB(rs.getString("option_b"));
                    q.setOptionC(rs.getString("option_c"));
                    q.setOptionD(rs.getString("option_d"));
                    q.setCorrectOption(rs.getString("correct_option"));
                    questions.add(q);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return questions;
    }

    /**
     * NEW: Updates a specific question by its ID
     */
    public void updateQuestion(int questionId, Question q) {
        String sql = "UPDATE questions SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=? WHERE id=?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, q.getQuestionText());
            pstmt.setString(2, q.getOptionA());
            pstmt.setString(3, q.getOptionB());
            pstmt.setString(4, q.getOptionC());
            pstmt.setString(5, q.getOptionD());
            pstmt.setString(6, q.getCorrectOption());
            pstmt.setInt(7, questionId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to update question", e);
        }
    }

    /**
     * NEW: Deletes a specific question by its ID
     */
    public void deleteQuestion(int questionId) {
        String sql = "DELETE FROM questions WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, questionId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to delete question", e);
        }
    }
}