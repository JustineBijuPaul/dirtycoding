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

export function validateFormData(formData, localStorageData) {
    const validationResults = {
        isValid: true,
        errors: []
    };

    // Helper function to normalize values for comparison
    const normalizeValue = (value) => {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    };

    // Define expected mappings
    const mappings = [
        { form: 'entry.469241813', storage: 'userName', label: 'Name' },
        { form: 'entry.1505259246', storage: 'userEmail', label: 'Email' },
        { form: 'entry.533129011', storage: 'userAdmission', label: 'Admission' },
        { form: 'entry.1043374348', storage: 'enteredCode', label: 'Code' },
        { form: 'entry.235859947', storage: 'lastLanguage', label: 'Language' },
    ];

    // Check each mapping
    mappings.forEach(mapping => {
        const formValue = normalizeValue(formData.get(mapping.form));
        const storageValue = normalizeValue(localStorageData[mapping.storage]);
        
        if (!formValue && storageValue) {
            validationResults.isValid = false;
            validationResults.errors.push(
                `${mapping.label}: Form value missing but exists in localStorage`
            );
        } else if (formValue !== storageValue && storageValue) {
            validationResults.isValid = false;
            validationResults.errors.push(
                `${mapping.label}: Value mismatch - Form:(${formValue}) Storage:(${storageValue})`
            );
        }
    });

    // Special check for analysis data
    if (localStorageData.lastAnalysis) {
        const timeComplexity = normalizeValue(formData.get('entry.140314424'));
        const spaceComplexity = normalizeValue(formData.get('entry.2105143733'));
        const storedTimeComplexity = normalizeValue(localStorageData.lastAnalysis.timeComplexity);
        const storedSpaceComplexity = normalizeValue(localStorageData.lastAnalysis.spaceComplexity);
        
        if (timeComplexity !== storedTimeComplexity) {
            validationResults.isValid = false;
            validationResults.errors.push(
                `Time Complexity mismatch - Form:(${timeComplexity}) Storage:(${storedTimeComplexity})`
            );
        }
        if (spaceComplexity !== storedSpaceComplexity) {
            validationResults.isValid = false;
            validationResults.errors.push(
                `Space Complexity mismatch - Form:(${spaceComplexity}) Storage:(${storedSpaceComplexity})`
            );
        }
    }

    // Log validation results with more detail
    console.log('Form Data:', Object.fromEntries(formData.entries()));
    console.log('localStorage Data:', localStorageData);
    console.log('Validation Results:', validationResults);
    
    return validationResults;
}

export async function submitToGoogleSheets(data) {
    const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSerf-NP5-JY0nbjJvvfSWbh_WsNI2o0D2sKVFS4rK-hOuzNUw/formResponse';
    
    try {
        // Format analysis results as a comprehensive summary
        const analysisResults = data.lastAnalysis ? 
            `Code:\n${data.enteredCode}\n\n` +
            `Language: ${data.lastLanguage}\n` +
            `Time Complexity: ${data.lastAnalysis.timeComplexity}\n` +
            `Space Complexity: ${data.lastAnalysis.spaceComplexity}\n` +
            `Feedback: ${data.lastAnalysis.feedback || 'No feedback provided'}`
            : data.enteredCode || '';

        const formData = new FormData();
        
        // Split the data into separate form fields
        formData.append('entry.469241813', data.userName || ''); // Name
        formData.append('entry.1505259246', data.userEmail || ''); // Email
        formData.append('entry.533129011', data.userAdmission || ''); // Admission
        formData.append('entry.1043374348', analysisResults); // Analysis Results
        formData.append('entry.235859947', data.lastLanguage || ''); // Language
        formData.append('entry.140314424', data.lastAnalysis?.timeComplexity || ''); // Time Complexity
        formData.append('entry.2105143733', data.lastAnalysis?.spaceComplexity || ''); // Space Complexity
        formData.append('entry.119632947', new Date().toISOString()); // Timestamp

        // Validate form data against localStorage
        const localStorageData = getAllLocalStorageData();
        const validation = validateFormData(formData, data);
        
        if (!validation.isValid) {
            console.warn('Form data validation failed:', validation.errors);
        }

        // Submit form data using fetch
        const response = await fetch(FORM_URL, {
            method: 'POST',
            mode: 'no-cors', // This is required for Google Forms
            body: formData
        });

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
