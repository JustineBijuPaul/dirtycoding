import apiService from './api.js';
import { submitToGoogleSheets, getAllLocalStorageData } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const codeInput = document.getElementById('codeInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const submitBtn = document.getElementById('submitBtn');
    const timeComplexity = document.getElementById('timeComplexity');
    const spaceComplexity = document.getElementById('spaceComplexity');
    const feedback = document.getElementById('feedback');
    const languageSelect = document.getElementById('languageSelect');

    // Add loading state elements
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

    function showError(message) {
        feedback.textContent = `Error: ${message}`;
        feedback.style.color = '#ff3b30';
    }

    // Load user info
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }

    // Load last used language if exists
    const lastLanguage = localStorage.getItem('lastLanguage');
    if (lastLanguage) {
        languageSelect.value = lastLanguage;
    }

    // Load last code if exists
    const lastCode = localStorage.getItem('lastCode');
    if (lastCode) {
        codeInput.value = lastCode;
    }

    // Event listeners
    analyzeBtn.addEventListener('click', async () => {
        try {
            showLoading();
            const code = codeInput.value;
            const language = languageSelect.value;
            
            // Save current code and language
            localStorage.setItem('lastCode', code);
            localStorage.setItem('lastLanguage', language);
            
            const analysis = await apiService.analyzeCode(code, language);
            
            timeComplexity.textContent = analysis.timeComplexity;
            spaceComplexity.textContent = analysis.spaceComplexity;
            feedback.textContent = analysis.feedback;
            feedback.style.color = '#b8b8b8';

            // Save analysis results
            const analysisResult = {
                timeComplexity: analysis.timeComplexity,
                spaceComplexity: analysis.spaceComplexity,
                feedback: analysis.feedback,
                timestamp: new Date().toISOString()
            };
            
            // Save last analysis
            localStorage.setItem('lastAnalysis', JSON.stringify(analysisResult));

            // Save to analysis history (keep last 5 analyses)
            const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
            history.unshift({
                code,
                language,
                analysis: analysisResult
            });
            localStorage.setItem('analysisHistory', JSON.stringify(history.slice(0, 5)));

            // Add animation effect
            [timeComplexity, spaceComplexity, feedback].forEach(element => {
                element.style.animation = 'none';
                element.offsetHeight;
                element.style.animation = 'fadeIn 0.5s ease-out';
            });
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    });

    submitBtn.addEventListener('click', async () => {
        try {
            const code = codeInput.value.trim();
            const language = languageSelect.value;
            
            // Gather all data from localStorage
            const submissionData = {
                userId: localStorage.getItem('userId'),
                userDetails: {
                    name: localStorage.getItem('userName'),
                    email: localStorage.getItem('userEmail'),
                    admissionNumber: localStorage.getItem('userAdmission'),
                    lastLoginDate: localStorage.getItem('lastLoginDate')
                },
                code: code,
                language: language,
                lastAnalysis: JSON.parse(localStorage.getItem('lastAnalysis') || '{}'),
                analysisHistory: JSON.parse(localStorage.getItem('analysisHistory') || '[]')
            };

            if (!code) {
                showError('Please enter some code before submitting');
                return;
            }

            if (!submissionData.userId) {
                showError('User session expired. Please login again');
                window.location.href = '../index.html';
                return;
            }

            showLoading();
            const result = await apiService.submitCode(submissionData);
            
            if (result.success) {
                feedback.textContent = 'Code submitted successfully!';
                feedback.style.color = '#00ff9d';
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    });

    document.getElementById('submitBtn').addEventListener('click', async () => {
        try {
            const allData = getAllLocalStorageData();
            await submitToGoogleSheets(allData);
            alert('Data submitted successfully!');
        } catch (error) {
            alert('Failed to submit data. Please try again.');
            console.error('Submission error:', error);
        }
    });

    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        // Keep analysis history but clear current session
        const analysisHistory = localStorage.getItem('analysisHistory');
        localStorage.clear();
        if (analysisHistory) {
            localStorage.setItem('analysisHistory', analysisHistory);
        }
        window.location.href = '../index.html';
    });
});
