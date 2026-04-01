package com.quizapp.dao;

import java.sql.*;
import java.util.*;

public class AttemptDao {

    public boolean saveAttempt(int userId, int quizId, int score, int totalQuestions) {
        String sql = "INSERT INTO quiz_results (user_id, quiz_id, score, total_questions) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, userId);
            pstmt.setInt(2, quizId);
            pstmt.setInt(3, score);
            pstmt.setInt(4, totalQuestions);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { return false; }
    }

    public List<Map<String, Object>> getLeaderboard() {
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        String sql = "SELECT u.username, q.title, r.score, r.total_questions, r.attempt_date " +
                     "FROM quiz_results r " +
                     "JOIN users u ON r.user_id = u.id " +
                     "JOIN quizzes q ON r.quiz_id = q.id " +
                     "ORDER BY r.score DESC LIMIT 10";
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("username", rs.getString("username"));
                row.put("quizTitle", rs.getString("title"));
                row.put("score", rs.getInt("score"));
                row.put("totalQuestions", rs.getInt("total_questions"));
                leaderboard.add(row);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return leaderboard;
    }

    /**
     * NEW: Fetches all past attempts for a specific student (Requirement 4).
     */
    public List<Map<String, Object>> getUserAttempts(int userId) {
        List<Map<String, Object>> attempts = new ArrayList<>();
        String sql = "SELECT q.title, r.score, r.total_questions, r.attempt_date " +
                     "FROM quiz_results r " +
                     "JOIN quizzes q ON r.quiz_id = q.id " +
                     "WHERE r.user_id = ? " +
                     "ORDER BY r.attempt_date DESC";
                     
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("quizTitle", rs.getString("title"));
                row.put("score", rs.getInt("score"));
                row.put("totalQuestions", rs.getInt("total_questions"));
                row.put("date", rs.getString("attempt_date"));
                attempts.add(row);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return attempts;
    }
}