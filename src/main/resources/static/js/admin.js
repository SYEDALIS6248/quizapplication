/**
 * Admin Dashboard Logic
 * Handles: Quiz management (CRUD), Question editing, and Tab navigation.
 */

const user = session.getUser();
if (!user || user.role !== 'ADMIN') {
    window.location.href = 'index.html';
}

let currentQuizId = null;
let isQuestionEditing = false;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-name').textContent = user.username;
    
    loadQuizzes();

    document.getElementById('logout-btn').addEventListener('click', () => {
        session.clear();
        window.location.href = 'index.html';
    });

    // Create Quiz Initial Details
    document.getElementById('quiz-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            title: document.getElementById('quiz-title').value,
            description: document.getElementById('quiz-desc').value,
            createdBy: user.userId
        };

        try {
            const result = await api.post('/quizzes', data);
            currentQuizId = result.quizId;
            openQuestionEditor(data.title);
            api.showToast("Quiz details saved. Now add questions.", "success");
            document.getElementById('quiz-form').reset();
            loadQuizzes(); // Refresh the list in the background
        } catch (err) { }
    });

    // Add or Update Question
    document.getElementById('question-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('question-form').dataset.editId;
        
        const qData = {
            questionText: document.getElementById('q-text').value,
            optionA: document.getElementById('q-a').value,
            optionB: document.getElementById('q-b').value,
            optionC: document.getElementById('q-c').value,
            optionD: document.getElementById('q-d').value,
            correctOption: document.getElementById('q-correct').value
        };

        try {
            if (editId) {
                // Using standard fetch for PUT if not in api.js
                await fetch(`http://localhost:8080/api/questions/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(qData)
                });
                api.showToast("Question updated!", "success");
            } else {
                await api.post(`/quizzes/${currentQuizId}/questions`, qData);
                api.showToast("Question added!", "success");
            }
            
            resetQuestionForm();
            loadQuestionsList(currentQuizId);
        } catch (err) { }
    });

    // Back to Quizzes button inside Question Editor
    document.getElementById('finish-btn').addEventListener('click', () => {
        // Switch to the Manage Quizzes tab smoothly
        switchTab('manage-section', document.getElementById('nav-manage'));
        loadQuizzes();
    });

    // Edit Quiz Metadata Modal
    document.getElementById('edit-quiz-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-quiz-id').value;
        const updateData = {
            title: document.getElementById('edit-quiz-title').value,
            description: document.getElementById('edit-quiz-desc').value
        };

        try {
            await api.put(`/quizzes/${id}`, updateData);
            api.showToast("Quiz info updated!", "success");
            closeEditModal();
            loadQuizzes();
        } catch (err) { }
    });
});

async function loadQuizzes() {
    const listArea = document.getElementById('quizzes-list-area');
    try {
        const quizzes = await api.get('/quizzes');
        listArea.innerHTML = quizzes.length ? '' : '<p>No quizzes found.</p>';
        
        quizzes.forEach(q => {
            const div = document.createElement('div');
            div.className = 'quiz-manage-item';
            div.innerHTML = `
                <div>
                    <strong>${q.title}</strong>
                    <p style="font-size: 0.8rem; color: #666;">${q.description}</p>
                </div>
                <div class="action-btns">
                    <button class="btn-edit" onclick="manageQuestions(${q.id}, '${q.title.replace(/'/g, "\\'")}')">Questions</button>
                    <button class="btn-edit" style="background:#6366f1" onclick="openEditModal(${q.id}, '${q.title.replace(/'/g, "\\'")}', '${q.description.replace(/'/g, "\\'")}')">Info</button>
                    <button class="btn-delete" onclick="deleteQuiz(${q.id})">Delete</button>
                </div>
            `;
            listArea.appendChild(div);
        });
    } catch (err) { }
}

function openQuestionEditor(title) {
    document.getElementById('active-quiz-name').textContent = title;
    // Utilize the global switchTab function to shift view to the questions section
    // We do not highlight a specific sidebar tab to indicate we are in a sub-view
    switchTab('add-questions-section', null); 
}

async function manageQuestions(quizId, title) {
    currentQuizId = quizId;
    openQuestionEditor(title);
    loadQuestionsList(quizId);
}

async function loadQuestionsList(quizId) {
    const container = document.getElementById('questions-manager-list');
    container.innerHTML = "<h4>Questions</h4><p>Loading...</p>";
    
    try {
        const questions = await api.get(`/quizzes/${quizId}/questions`);
        container.innerHTML = "<h4>Questions</h4>";
        
        if (questions.length === 0) {
            container.innerHTML += "<p>No questions yet.</p>";
            return;
        }

        questions.forEach((q, idx) => {
            const div = document.createElement('div');
            div.className = 'quiz-manage-item';
            div.style.padding = "10px";
            div.innerHTML = `
                <div style="flex:1">
                    <strong>Q${idx+1}: ${q.questionText}</strong>
                </div>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editSingleQuestion(${JSON.stringify(q).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn-delete" onclick="deleteQuestion(${q.id})">Delete</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (err) { }
}

function editSingleQuestion(q) {
    document.getElementById('q-text').value = q.questionText;
    document.getElementById('q-a').value = q.optionA;
    document.getElementById('q-b').value = q.optionB;
    document.getElementById('q-c').value = q.optionC;
    document.getElementById('q-d').value = q.optionD;
    document.getElementById('q-correct').value = q.correctOption;
    
    document.getElementById('question-form').dataset.editId = q.id;
    const btn = document.querySelector('#question-form button[type="submit"]');
    btn.textContent = "Update Question";
    btn.style.background = "var(--info)";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetQuestionForm() {
    document.getElementById('question-form').reset();
    delete document.getElementById('question-form').dataset.editId;
    const btn = document.querySelector('#question-form button[type="submit"]');
    btn.textContent = "Add Question";
    btn.style.background = "var(--success)";
}

async function deleteQuestion(qId) {
    if (!confirm("Delete question?")) return;
    try {
        await api.delete(`/questions/${qId}`); 
        api.showToast("Question deleted", "info");
        loadQuestionsList(currentQuizId);
    } catch (err) { }
}

async function deleteQuiz(id) {
    if (!confirm("Warning: This deletes all questions and results too! Continue?")) return;
    try {
        await api.delete(`/quizzes/${id}`);
        api.showToast("Quiz removed", "success");
        loadQuizzes();
    } catch (err) { }
}

function openEditModal(id, title, desc) {
    document.getElementById('edit-quiz-id').value = id;
    document.getElementById('edit-quiz-title').value = title;
    document.getElementById('edit-quiz-desc').value = desc;
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}