package com.quizapp.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    // Path to the SQLite database file you created earlier
    private static final String URL = "jdbc:sqlite:quizapp.db";

    /**
     * Establishes and returns a connection to the SQLite database.
     */
    public static Connection getConnection() throws SQLException {
        // Ensures the SQLite driver is loaded
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            System.err.println("SQLite JDBC Driver not found. Check your pom.xml.");
            e.printStackTrace();
        }
        
        return DriverManager.getConnection(URL);
    }
}