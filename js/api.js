class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    async analyzeCode(code, language) {
        try {
            const response = await fetch(`${this.baseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'omit',
                body: JSON.stringify({ code, language })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Analysis failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Analysis error:', error);
            throw new Error(error.message || 'Failed to analyze code');
        }
    }

    async submitCode(submissionData) {
        try {
            if (!submissionData.code || !submissionData.language || !submissionData.userId) {
                throw new Error('Missing required fields');
            }

            const response = await fetch(`${this.baseUrl}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'omit',
                body: JSON.stringify(submissionData)
            });

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Submission failed');
            }

            return data;
        } catch (error) {
            console.error('Submission error:', error);
            throw new Error(error.message || 'Failed to submit code');
        }
    }

    async login(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
}

// Change export to be more explicit
const apiService = new ApiService();
export default apiService;
