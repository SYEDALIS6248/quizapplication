-- Store user credentials and roles
-- Updated to include First Name, Last Name, and Mobile Number for Requirement #1
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username VARCHAR(50) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
first_name VARCHAR(100),
last_name VARCHAR(100),
mobile_number VARCHAR(15),
role VARCHAR(20) NOT NULL DEFAULT 'STUDENT' -- 'ADMIN' or 'STUDENT'
);

-- Store Quiz categories/topics
CREATE TABLE IF NOT EXISTS quizzes (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title VARCHAR(100) NOT NULL,
description TEXT,
created_by INTEGER,
FOREIGN KEY(created_by) REFERENCES users(id)
);

-- Store Questions linked to Quizzes
CREATE TABLE IF NOT EXISTS questions (
id INTEGER PRIMARY KEY AUTOINCREMENT,
quiz_id INTEGER NOT NULL,
question_text TEXT NOT NULL,
option_a VARCHAR(255) NOT NULL,
option_b VARCHAR(255) NOT NULL,
option_c VARCHAR(255) NOT NULL,
option_d VARCHAR(255) NOT NULL,
correct_option CHAR(1) NOT NULL, -- 'A', 'B', 'C', or 'D'
FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Track scoring and progress (Leaderboard source)
CREATE TABLE IF NOT EXISTS quiz_results (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
quiz_id INTEGER NOT NULL,
score INTEGER NOT NULL,
total_questions INTEGER NOT NULL,
attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(user_id) REFERENCES users(id),
FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
);