/**
 * Auth Logic: Manages UI states between Login, Register, and Reset Password.
 */

const authForm = document.getElementById('auth-form');
const toggleBtn = document.getElementById('toggle-auth');
const forgotBtn = document.getElementById('forgot-btn');

// UI Elements
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const usernameInput = document.getElementById('username');
const passInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');
const passLabel = document.getElementById('pass-label');

// Sections
const regFields = document.getElementById('registration-fields');
const regExtras = document.getElementById('reg-password-extras');
const confirmField = document.getElementById('confirm-field');
const adminGroup = document.getElementById('admin-group');
const forgotPassContainer = document.getElementById('forgot-pass-container');

// State Manager: 'LOGIN', 'REGISTER', or 'RESET'
let currentMode = 'LOGIN';

// Toggle between Login and Register
toggleBtn.addEventListener('click', () => {
    currentMode = currentMode === 'REGISTER' ? 'LOGIN' : 'REGISTER';
    updateUIState();
});

// Trigger Reset Password Mode
forgotBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) {
        api.showToast("Please enter your username first to identify your account.", "info");
        usernameInput.focus();
        return;
    }
    currentMode = 'RESET';
    updateUIState();
    api.showToast(`Setting new password for: ${username}`, "info");
});

function updateUIState() {
    // FIX: Preserve the username before resetting the form
    const preservedUsername = usernameInput.value;
    
    authForm.reset();
    
    if (currentMode === 'LOGIN') {
        formTitle.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleBtn.textContent = "Don't have an account? Register";
        toggleBtn.style.display = 'block';
        passLabel.textContent = 'Password';
        passInput.placeholder = "Enter password";

        regFields.classList.add('hidden');
        regExtras.classList.add('hidden');
        confirmField.classList.add('hidden');
        adminGroup.style.display = 'none';
        forgotPassContainer.style.display = 'block';
        usernameInput.disabled = false;
        
        // Restore username if switching back from Reset mode
        if (preservedUsername) usernameInput.value = preservedUsername;

    } else if (currentMode === 'REGISTER') {
        formTitle.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleBtn.textContent = "Already have an account? Login";
        toggleBtn.style.display = 'block';
        passLabel.textContent = 'Create Password';
        passInput.placeholder = "Create strong password";

        regFields.classList.remove('hidden');
        regExtras.classList.remove('hidden');
        confirmField.classList.remove('hidden');
        adminGroup.style.display = 'flex';
        forgotPassContainer.style.display = 'none';
        usernameInput.disabled = false;

    } else if (currentMode === 'RESET') {
        formTitle.textContent = 'Reset Password';
        submitBtn.textContent = 'Save New Password';
        toggleBtn.textContent = "Cancel and back to Login";
        toggleBtn.style.display = 'block';
        passLabel.textContent = 'New Password';
        passInput.placeholder = "Enter new password";

        regFields.classList.add('hidden');
        regExtras.classList.remove('hidden'); // Show strength meter
        confirmField.classList.remove('hidden'); // Show confirm password
        adminGroup.style.display = 'none';
        forgotPassContainer.style.display = 'none';
        
        // FIX: Restore the preserved username and lock the field
        usernameInput.value = preservedUsername;
        usernameInput.disabled = true; 
    }
    
    validate(); // Re-run validation based on new mode
}

window.toggleVisibility = function(id, icon) {
    const el = document.getElementById(id);
    const isPass = el.type === "password";
    el.type = isPass ? "text" : "password";
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
};

// Real-time Validation
passInput.addEventListener('input', validate);
confirmInput.addEventListener('input', validate);

function validate() {
    if (currentMode === 'LOGIN') {
        setSubmitState(true);
        return;
    }

    const val = passInput.value;
    const conf = confirmInput.value;
    
    const hasCapsStart = /^[A-Z]/.test(val);
    const hasMinLen = val.length >= 8;
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);

    updateRuleUI('rule-caps', hasCapsStart);
    updateRuleUI('rule-len', hasMinLen);
    updateRuleUI('rule-spec', hasSpecial);

    let strength = 0;
    if (hasCapsStart) strength += 33;
    if (hasMinLen) strength += 33;
    if (hasSpecial) strength += 34;

    const bar = document.getElementById('strength-bar');
    const label = document.getElementById('strength-label');
    if (bar && label) {
        bar.style.width = strength + "%";
        if (strength < 40) { bar.style.background = "#ef4444"; label.innerText = "Weak"; }
        else if (strength < 90) { bar.style.background = "#f59e0b"; label.innerText = "Moderate"; }
        else { bar.style.background = "#10b981"; label.innerText = "Strong"; }
    }

    const matchMsg = document.getElementById('match-msg');
    const isMatch = val === conf && val !== "";
    if (matchMsg) {
        if (conf === "") matchMsg.innerText = "";
        else {
            matchMsg.innerText = isMatch ? "Passwords match" : "Passwords do not match";
            matchMsg.style.color = isMatch ? "#10b981" : "#ef4444";
        }
    }

    const isValid = hasCapsStart && hasMinLen && hasSpecial && isMatch;
    setSubmitState(isValid);
}

function setSubmitState(isEnabled) {
    submitBtn.disabled = !isEnabled;
    submitBtn.style.opacity = isEnabled ? "1" : "0.6";
    submitBtn.style.cursor = isEnabled ? "pointer" : "not-allowed";
}

function updateRuleUI(id, isValid) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `rule-item ${isValid ? 'valid' : 'invalid'}`;
    const icon = el.querySelector('i');
    if (icon) icon.className = `fa-solid ${isValid ? 'fa-circle-check' : 'fa-circle-xmark'}`;
}

// API Submission Handler
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passInput.value;
    
    if (currentMode === 'LOGIN') {
        try {
            const result = await api.post('/login', { username, password });
            api.showToast(`Welcome back, ${result.username}!`, 'success');
            session.setUser(result);
            setTimeout(() => {
                window.location.href = result.role === 'ADMIN' ? 'admin.html' : 'student.html';
            }, 1000);
        } catch (err) {}
        
    } else if (currentMode === 'RESET') {
        try {
            await api.post('/auth/reset-password', { username, newPassword: password });
            api.showToast("Password updated successfully! Please login.", "success");
            currentMode = 'LOGIN';
            usernameInput.disabled = false;
            updateUIState();
        } catch (err) {}
        
    } else if (currentMode === 'REGISTER') {
        const payload = {
            username: username,
            password: password,
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            mobile: document.getElementById('mobile').value,
            isAdmin: document.getElementById('isAdmin').checked
        };
        
        try {
            await api.post('/register', payload);
            api.showToast("Registration successful! Please login.", 'success');
            currentMode = 'LOGIN';
            updateUIState();
        } catch (err) {}
    }

 // Method 1: The logout function
 function logout() {
     localStorage.removeItem('userToken'); 
     window.location.replace("index.html"); 
 }
});