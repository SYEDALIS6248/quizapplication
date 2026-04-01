package com.quizapp.service;

import com.quizapp.dao.UserDao;
import com.quizapp.model.User;
import com.quizapp.util.PasswordUtil;

public class AuthService {
    private final UserDao userDao;

    public AuthService() {
        this.userDao = new UserDao();
    }

    public boolean hasAdmin() {
        return userDao.isAdminExists();
    }

    public boolean register(String username, String rawPassword, String firstName, String lastName, String mobile, boolean isAdmin) {
        if (username == null || username.trim().isEmpty() || rawPassword == null) {
            return false;
        }
        String hashedPassword = PasswordUtil.hashPassword(rawPassword);
        String role = isAdmin ? "ADMIN" : "STUDENT";
        return userDao.registerUser(username, hashedPassword, firstName, lastName, mobile, role);
    }

    public User authenticate(String username, String rawPassword) {
        User user = userDao.getUserByUsername(username);
        if (user != null && PasswordUtil.checkPassword(rawPassword, user.getPasswordHash())) {
            return user;
        }
        return null;
    }

    /**
     * Hashes the new password and sends it to the DAO to update the database.
     */
    public boolean updatePassword(String username, String newRawPassword) {
        if (username == null || newRawPassword == null) return false;
        
        String newHashedPassword = PasswordUtil.hashPassword(newRawPassword);
        return userDao.updateUserPassword(username, newHashedPassword);
    }
}