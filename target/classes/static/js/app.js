let questions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswer = null;
let timeLeft = 0;
let timerInterval = null;
let quizReview = []; // Array to store {question, selected, correct, isCorrect}

const quizId = localStorage.getItem('active_quiz_id');
const quizTitle = localStorage.getItem('active_quiz_title');
const user = session.getUser();

if (!quizId || !user) {
    window.location.href = 'student.html';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('quiz-title-display').textContent = quizTitle || "Quiz Session";
    fetchQuestions();

    document.getElementById('next-btn').addEventListener('click', () => {
        submitAnswer();
    });
});

async function fetchQuestions() {
    try {
        questions = await api.get(`/quizzes/${quizId}/questions`);
        if (questions.length === 0) {
            api.showToast("This quiz has no questions yet!", "error");
            setTimeout(() => window.location.href = 'student.html', 2000);
            return;
        }
        
        quizReview = []; // Reset review
        showQuestion();
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

function showQuestion() {
    const q = questions[currentIndex];
    const area = document.getElementById('question-area');
    selectedAnswer = null;
    document.getElementById('next-btn').style.display = 'none';
    
    document.getElementById('progress').textContent = `Question ${currentIndex + 1} of ${questions.length}`;

    area.innerHTML = `
        <p class="question-text">${q.questionText}</p>
        <div class="options-container">
            <button class="option-btn" onclick="selectOption(this, 'A')">A) ${q.optionA}</button>
            <button class="option-btn" onclick="selectOption(this, 'B')">B) ${q.optionB}</button>
            <button class="option-btn" onclick="selectOption(this, 'C')">C) ${q.optionC}</button>
            <button class="option-btn" onclick="selectOption(this, 'D')">D) ${q.optionD}</button>
        </div>
    `;

    startTimer(30);
}

function selectOption(btn, choice) {
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedAnswer = choice;
    document.getElementById('next-btn').style.display = 'block';
}

function startTimer(seconds) {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = seconds;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            api.showToast("Time's up!", "info");
            submitAnswer(); 
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 5) {
        timerElement.style.color = "#ef4444";
    } else {
        timerElement.style.color = "white";
    }
}

function submitAnswer() {
    const currentQ = questions[currentIndex];
    const isCorrect = (selectedAnswer === currentQ.correctOption);

    // Save for review
    quizReview.push({
        questionText: currentQ.questionText,
        selected: selectedAnswer || "No Answer",
        correct: currentQ.correctOption,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        score++;
    }

    currentIndex++;
    if (currentIndex < questions.length) {
        showQuestion();
    } else {
        clearInterval(timerInterval);
        finishQuiz();
    }
}

async function finishQuiz() {
    try {
        await api.post('/results', {
            userId: user.userId,
            quizId: parseInt(quizId),
            score: score,
            totalQuestions: questions.length
        });

        const modalContent = document.querySelector('.modal-content');
        
        // Generate Review HTML
        let reviewHtml = `
            <h2>Quiz Finished!</h2>
            <p id="final-score" style="font-size: 1.5rem; margin: 0.5rem 0;">Your Score: ${score} / ${questions.length}</p>
            <div class="review-section" style="max-height: 300px; overflow-y: auto; text-align: left; margin: 1rem 0; border-top: 1px solid #eee; padding-top: 1rem;">
                <h3 style="margin-bottom: 10px; font-size: 1rem;">Answer Review:</h3>
        `;

        quizReview.forEach((item, idx) => {
            reviewHtml += `
                <div style="margin-bottom: 15px; padding: 10px; border-radius: 6px; background: ${item.isCorrect ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${item.isCorrect ? '#bcf0da' : '#fecaca'};">
                    <div style="font-weight: bold; font-size: 0.9rem;">Q${idx + 1}: ${item.questionText}</div>
                    <div style="font-size: 0.85rem; margin-top: 4px;">
                        Your Answer: <span style="color: ${item.isCorrect ? '#16a34a' : '#dc2626'}">${item.selected}</span> 
                        ${!item.isCorrect ? ` | Correct: <span style="color: #16a34a">${item.correct}</span>` : ''}
                    </div>
                </div>
            `;
        });

        reviewHtml += `
            </div>
            <button onclick="window.location.href='student.html'">Back to Dashboard</button>
        `;

        modalContent.innerHTML = reviewHtml;
        document.getElementById('result-modal').style.display = 'flex';

    } catch (err) {
        api.showToast("Error saving results", "error");
    }
}