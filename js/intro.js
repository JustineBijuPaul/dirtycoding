import apiService from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingOverlay);

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = field.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('error-message')) {
            const div = document.createElement('div');
            div.classList.add('error-message');
            div.textContent = message;
            field.parentNode.insertBefore(div, field.nextSibling);
        } else {
            errorDiv.textContent = message;
        }
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const admissionNumber = document.getElementById('admissionNumber').value.trim();
        let isValid = true;

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        if (!name) {
            showError('name', 'Name is required');
            isValid = false;
        }

        if (!email) {
            showError('email', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email');
            isValid = false;
        }

        if (!admissionNumber) {
            showError('admissionNumber', 'Admission number is required');
            isValid = false;
        }

        if (!isValid) return;

        const userData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            admissionNumber: document.getElementById('admissionNumber').value.trim()
        };

        try {
            showLoading();
            const response = await apiService.login(userData);
            
            if (response.success) {
                // Save all user details to localStorage
                localStorage.setItem('userId', response.userId);
                localStorage.setItem('userName', userData.name);
                localStorage.setItem('userEmail', userData.email);
                localStorage.setItem('userAdmission', userData.admissionNumber);
                localStorage.setItem('lastLoginDate', new Date().toISOString());
                
                window.location.href = './pages/code.html';
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (error) {
            const errorMessage = error.message || 'Login failed. Please try again.';
            showError('email', errorMessage);
        } finally {
            hideLoading();
        }
    });
});
