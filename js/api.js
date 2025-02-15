class ApiService {
    async analyzeCode(code, language) {
        // Mock analysis response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    timeComplexity: 'O(n)',
                    spaceComplexity: 'O(1)',
                    feedback: 'Code analysis completed successfully. This is a mock response.'
                });
            }, 1000);
        });
    }

    async submitCode(submissionData) {
        // Mock submission response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Code submitted successfully' });
            }, 1000);
        });
    }

    async login(userData) {
        // Mock login response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    userId: 'mock-' + Date.now(),
                    message: 'Login successful'
                });
            }, 500);
        });
    }
}

const apiService = new ApiService();
export default apiService;

export async function submitToGoogleSheets(data) {
    // Replace YOUR_FORM_ID with your actual Google Form ID
    const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSerf-NP5-JY0nbjJvvfSWbh_WsNI2o0D2sKVFS4rK-hOuzNUw/viewform?usp=dialog';
    
    try {
        const formData = new FormData();
        
        // Map your data to the correct entry IDs from your Google Form
        formData.append('entry.966009175', data.userName || ''); // Name field
        formData.append('entry.1563215521', data.userEmail || ''); // Email field
        formData.append('entry.171389808', data.userAdmission || ''); // Admission number
        formData.append('entry.1103237069', JSON.stringify({
            code: data.lastCode || '',
            enteredCode: data.enteredCode || '', // Add the user's entered code
            language: data.lastLanguage || '',
            timeComplexity: data.lastAnalysis?.timeComplexity || '',
            spaceComplexity: data.lastAnalysis?.spaceComplexity || '',
            feedback: data.lastAnalysis?.feedback || ''
        }));
        formData.append('entry.729929371', new Date().toISOString());

        // Using iframe to submit the form (to bypass CORS)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = FORM_URL;
        
        // Convert FormData to hidden inputs
        for (let pair of formData.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = pair[0];
            input.value = pair[1];
            form.appendChild(input);
        }
        
        iframe.contentDocument.body.appendChild(form);
        form.submit();
        
        // Clean up after submission
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 2000);

        return { success: true, message: 'Data submitted successfully' };
    } catch (error) {
        console.error('Error submitting data:', error);
        throw error;
    }
}

export function getAllLocalStorageData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
            data[key] = localStorage.getItem(key);
        }
    }
    return data;
}
