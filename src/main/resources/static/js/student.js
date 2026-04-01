const user = session.getUser();
if (!user || user.role !== 'STUDENT') {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('user-display').textContent = user.username;

    document.getElementById('logout-btn').addEventListener('click', () => {
        session.clear();
        localStorage.setItem('logout_success', 'Successfully logged out!');
        window.location.href = 'index.html';
    });

    loadDashboard();
});

async function loadDashboard() {
    try {
        const quizzes = await api.get('/quizzes');
        const qContainer = document.getElementById('quizzes-container');
        qContainer.innerHTML = quizzes.length ? '' : '<p>No quizzes available yet.</p>';
        
        quizzes.forEach(quiz => {
            const div = document.createElement('div');
            div.className = 'quiz-item';
            div.innerHTML = `
                <div class="quiz-info">
                    <h3>${quiz.title}</h3>
                    <p>${quiz.description}</p>
                </div>
                <button class="btn-take" onclick="startQuiz(${quiz.id}, '${quiz.title.replace(/'/g, "\\'")}')">Take Quiz</button>
            `;
            qContainer.appendChild(div);
        });

        const leaderboard = await api.get('/leaderboard');
        const lbBody = document.getElementById('leaderboard-body');
        lbBody.innerHTML = '';
        leaderboard.forEach((entry, index) => {
            const tr = document.createElement('tr');
            const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            const percentage = ((entry.score / entry.totalQuestions) * 100).toFixed(0);
            tr.innerHTML = `
                <td><span style="margin-right: 8px;">${rankIcon}</span> <strong>${entry.username}</strong></td>
                <td>${entry.quizTitle}</td>
                <td>
                    <span class="badge badge-success">${entry.score}/${entry.totalQuestions}</span>
                    <small style="color: var(--text-muted); margin-left: 5px;">(${percentage}%)</small>
                </td>
            `;
            lbBody.appendChild(tr);
        });

        const myAttempts = await api.get(`/results/user/${user.userId}`);
        const attBody = document.getElementById('attempts-body');
        
        if (!myAttempts || myAttempts.length === 0) {
            attBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No history found.</td></tr>';
        } else {
            attBody.innerHTML = '';

            const attemptCounts = {};
            myAttempts.forEach(att => {
                attemptCounts[att.quizTitle] = (attemptCounts[att.quizTitle] || 0) + 1;
            });

            // Formatter for IST (Indian Standard Time)
            const istFormatter = new Intl.DateTimeFormat('en-IN', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            myAttempts.forEach(att => {
                const percent = ((att.score / att.totalQuestions) * 100).toFixed(1);
                const totalAttemptsForThisQuiz = attemptCounts[att.quizTitle];
                
                let localTime = "N/A";
                if (att.date) {
                    try {
                        // FIX: SQLite gives "YYYY-MM-DD HH:MM:SS". 
                        // We replace space with 'T' and add 'Z' to tell JS it is UTC.
                        const utcString = att.date.replace(" ", "T") + "Z";
                        const dateObj = new Date(utcString);
                        localTime = istFormatter.format(dateObj);
                    } catch (e) {
                        localTime = att.date;
                    }
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <strong>${att.quizTitle}</strong>
                        <div style="font-size: 0.7rem; color: #6366f1; margin-top: 2px;">
                            (Attempt count: ${totalAttemptsForThisQuiz})
                        </div>
                    </td>
                    <td>${att.score} / ${att.totalQuestions}</td>
                    <td>
                        <div style="background: #e5e7eb; border-radius: 10px; width: 100px; height: 10px; margin-bottom: 4px;">
                            <div style="background: var(--primary-color); width: ${percent}%; height: 100%; border-radius: 10px;"></div>
                        </div>
                        <span style="font-size: 0.8rem;">${percent}%</span>
                    </td>
                    <td><span class="badge ${percent >= 50 ? 'badge-success' : 'badge-error'}">${percent >= 50 ? 'Passed' : 'Failed'}</span></td>
                    <td style="color: #4b5563; font-family: monospace; font-size: 0.85rem;">${localTime}</td>
                `;
                attBody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function startQuiz(quizId, quizTitle) {
    localStorage.setItem('active_quiz_id', quizId);
    localStorage.setItem('active_quiz_title', quizTitle);
    window.location.href = 'quiz.html';
}