/**
 * Quiz Engine Logic
 * Handles: Question rendering, Scoring, Timer, and Randomization
 */

let questions = [];
let currentIdx = 0;
let score = 0;
let quizId = localStorage.getItem('active_quiz_id');
const user = session.getUser();

// Timer variables
let timeLeft = 0;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Validate session
    if (!quizId || !user) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('quiz-title-display').textContent = localStorage.getItem('active_quiz_title');
    
    // 2. Fetch Questions
    try {
        questions = await api.get(`/quizzes/${quizId}/questions`);
        
        if (questions.length === 0) {
            api.showToast("This quiz has no questions yet.", "error");
            setTimeout(() => window.location.href = 'student.html', 2000);
            return;
        }

        // FEATURE: Random Question Selection
        // Shuffles the questions array so every attempt is unique
        shuffleArray(questions);

        // FEATURE: Timer-based Quizzes
        // Calculate total time (e.g., 30 seconds per question)
        timeLeft = questions.length * 30; 
        startTimer();

        // 3. Start Quiz
        renderQuestion();

    } catch (err) {
        console.error("Failed to load quiz:", err);
        api.showToast("Error loading quiz data.", "error");
    }
});

/**
 * Fisher-Yates Shuffle Algorithm to randomize questions
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Initializes and updates the countdown timer
 */
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            api.showToast("Time's up!", "info");
            finishQuiz(); // Auto-submit when time runs out
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    timerEl.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Add urgency visually if 10 seconds or less remain
    if (timeLeft <= 10) {
        timerEl.style.color = "#ef4444"; // Red text
        timerEl.style.background = "#fee2e2"; // Light red background
    }
}

/**
 * Renders the current question to the screen
 */
function renderQuestion() {
    const q = questions[currentIdx];
    const container = document.getElementById('question-area');
    
    // Progress tracking
    document.getElementById('progress').textContent = `Question ${currentIdx + 1} of ${questions.length}`;

    container.innerHTML = `
        <div class="question-card">
            <h2 class="question-text">${q.questionText}</h2>
            <div class="options-container">
                <button class="option-btn" onclick="checkAnswer('A', this)">A) ${q.optionA}</button>
                <button class="option-btn" onclick="checkAnswer('B', this)">B) ${q.optionB}</button>
                <button class="option-btn" onclick="checkAnswer('C', this)">C) ${q.optionC}</button>
                <button class="option-btn" onclick="checkAnswer('D', this)">D) ${q.optionD}</button>
            </div>
        </div>
    `;
}

/**
 * Evaluates the selected answer and provides visual feedback
 */
function checkAnswer(selected, btn) {
    const correct = questions[currentIdx].correctOption;
    const buttons = document.querySelectorAll('.option-btn');
    
    // Prevent multiple clicks
    buttons.forEach(b => {
        b.disabled = true;
        b.style.cursor = 'not-allowed';
    });

    if (selected === correct) {
        btn.style.backgroundColor = 'var(--success)';
        btn.style.color = 'white';
        btn.style.borderColor = 'var(--success)';
        score++;
        api.showToast("Correct!", "success");
    } else {
        btn.style.backgroundColor = 'var(--error)';
        btn.style.color = 'white';
        btn.style.borderColor = 'var(--error)';
        
        // Highlight the correct option automatically
        buttons.forEach(b => {
            if (b.textContent.startsWith(correct + ')')) {
                b.style.backgroundColor = 'var(--success)';
                b.style.color = 'white';
                b.style.borderColor = 'var(--success)';
            }
        });
        api.showToast("Wrong answer.", "error");
    }

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
        currentIdx++;
        if (currentIdx < questions.length) {
            renderQuestion();
        } else {
            finishQuiz();
        }
    }, 1500);
}

/**
 * Submits the score to the backend and displays the modal
 */
async function finishQuiz() {
    clearInterval(timerInterval); // Stop the timer

    try {
        await api.post('/results', {
            userId: user.userId,
            quizId: parseInt(quizId),
            score: score,
            totalQuestions: questions.length
        });

        // Trigger the Result Modal built into quiz.html
        document.getElementById('final-score').textContent = `Your Score: ${score} / ${questions.length}`;
        document.getElementById('result-modal').style.display = 'flex';
        
    } catch (err) {
        console.error("Result save error:", err);
        api.showToast("Failed to save result to the database.", "error");
    }
}