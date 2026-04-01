package com.quizapp.util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Fulfills Requirement #9: Security Considerations.
 * Implements password hashing and salting using the BCrypt algorithm.
 */
public class PasswordUtil {

    /**
     * Hashes a plain text password.
     * BCrypt automatically generates a unique salt for every password and 
     * embeds it into the resulting hash string.
     * * @param plainTextPassword The user's chosen password.
     * @return A secure, salted 60-character hash.
     */
    public static String hashPassword(String plainTextPassword) {
        // "12" is the log_rounds (cost factor). Higher numbers are more secure 
        // but take more CPU time to compute. 12 is a strong industry standard.
        return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt(12));
    }

    /**
     * Verifies if a provided password matches the stored hash.
     * The salt is extracted from the hashedPassword automatically.
     * * @param plainTextPassword The password entered during login.
     * @param hashedPassword The hash retrieved from the SQLite 'users' table.
     * @return true if they match, false otherwise.
     */
    public static boolean checkPassword(String plainTextPassword, String hashedPassword) {
        try {
            if (hashedPassword == null || !hashedPassword.startsWith("$2a$")) {
                return false;
            }
            return BCrypt.checkpw(plainTextPassword, hashedPassword);
        } catch (IllegalArgumentException e) {
            // Returns false if the hash format is corrupted or invalid
            return false;
        }
    }
}