document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userName = localStorage.getItem('userName');
    if (!userName) {
        window.location.href = '../index.html';
        return;
    }

    // Display user name
    document.getElementById('userName').textContent = userName;

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });

    const codeInput = document.getElementById('codeInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const timeComplexity = document.getElementById('timeComplexity');
    const spaceComplexity = document.getElementById('spaceComplexity');
    const feedback = document.getElementById('feedback');
    const languageSelect = document.getElementById('languageSelect');
    const submitBtn = document.getElementById('submitBtn');

    const languagePatterns = {
        javascript: {
            loop: /for\s*\(|while\s*\(|forEach|map|reduce|filter/g,
            array: /\[\s*\d*\s*\]|\new\s+Array/g,
            variable: /let|const|var/g,
            recursion: /function.*\{\s*.*\1/g
        },
        python: {
            loop: /for\s+|while\s+|list\s*comprehension/g,
            array: /list\(|dict\(|\[\s*\]/g,
            variable: /\w+\s*=/g,
            recursion: /def.*:\s*.*\1/g
        },
        java: {
            loop: /for\s*\(|while\s*\(/g,
            array: /new\s+\w+\[\]|\{\s*\}/g,
            variable: /int|double|float|String|boolean/g,
            recursion: /\w+\s*\(.*\)\s*\{\s*.*\1/g
        },
        cpp: {
            loop: /for\s*\(|while\s*\(/g,
            array: /vector|array|new\s+\w+\[\]/g,
            variable: /int|double|float|string|bool/g,
            recursion: /\w+\s*\(.*\)\s*\{\s*.*\1/g
        },
        ruby: {
            loop: /while|until|each|times|loop/g,
            array: /\[\s*\]|Array\.new/g,
            variable: /[@$]/g,
            recursion: /def.*\s+.*\1/g
        }
    };

    analyzeBtn.addEventListener('click', analyzeCode);
    submitBtn.addEventListener('click', submitCode);

    function analyzeCode() {
        const code = codeInput.value;
        const language = languageSelect.value;
        
        if (!code.trim()) {
            feedback.textContent = 'Please enter some code to analyze.';
            return;
        }

        const analysis = calculateComplexity(code, language);
        timeComplexity.textContent = analysis.time;
        spaceComplexity.textContent = analysis.space;
        feedback.textContent = analysis.feedback;

        // Save analysis results
        saveAnalysisResult(code, language, analysis);
    }

    function saveAnalysisResult(code, language, analysis) {
        const userName = localStorage.getItem('userName');
        const admissionNumber = localStorage.getItem('admissionNumber');
        
        const analysisData = {
            userName: userName,
            admissionNumber: admissionNumber,
            timestamp: new Date().toISOString(),
            code: code,
            language: language,
            timeComplexity: analysis.time,
            spaceComplexity: analysis.space,
            feedback: analysis.feedback
        };

        // Get existing analyses or initialize new array
        let userAnalyses = JSON.parse(localStorage.getItem(`analyses_${admissionNumber}`) || '[]');
        
        // Add new analysis
        userAnalyses.push(analysisData);
        
        // Save back to localStorage
        localStorage.setItem(`analyses_${admissionNumber}`, JSON.stringify(userAnalyses));
    }

    function submitCode() {
        const code = codeInput.value;
        const language = languageSelect.value;
        
        if (!code.trim()) {
            feedback.textContent = 'Please enter some code to submit.';
            return;
        }

        const analysis = calculateComplexity(code, language);
        
        // Create submission object
        const submission = {
            code: code,
            language: language,
            timeComplexity: analysis.time,
            spaceComplexity: analysis.space,
            timestamp: new Date().toISOString(),
            userName: localStorage.getItem('userName'),
            userEmail: localStorage.getItem('userEmail'),
            admissionNumber: localStorage.getItem('admissionNumber')
        };

        // Get existing submissions or initialize empty array
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        submissions.push(submission);
        localStorage.setItem('submissions', JSON.stringify(submissions));

        feedback.textContent = 'Code successfully submitted!';
    }

    function calculateComplexity(code, language) {
        const patterns = languagePatterns[language];
        let timeComplex = 'O(1)';
        let spaceComplex = 'O(1)';
        let feedbackMsg = '';

        // Check for patterns in the selected language
        const loopCount = (code.match(patterns.loop) || []).length;
        const arrayOps = (code.match(patterns.array) || []).length;
        const variableCount = (code.match(patterns.variable) || []).length;
        const hasRecursion = patterns.recursion.test(code);

        // Time complexity analysis
        if (hasRecursion) {
            timeComplex = 'O(2ⁿ)';
        } else if (loopCount > 1) {
            timeComplex = 'O(n²)';
        } else if (loopCount === 1) {
            timeComplex = 'O(n)';
        }

        // Space complexity analysis
        if (hasRecursion) {
            spaceComplex = 'O(n)';
        } else if (arrayOps > 0) {
            spaceComplex = 'O(n)';
        } else if (variableCount > 5) {
            spaceComplex = 'O(n)';
        }

        // Language-specific feedback
        feedbackMsg = `Analysis for ${language.toUpperCase()}: `;
        feedbackMsg += `Found ${loopCount} loops, ${arrayOps} array operations, `;
        feedbackMsg += `and ${variableCount} variable declarations. `;
        
        if (hasRecursion) {
            feedbackMsg += 'Recursive implementation detected. ';
        }

        if (timeComplex === 'O(2ⁿ)') {
            feedbackMsg += 'Consider optimizing recursive calls for better performance.';
        } else if (timeComplex === 'O(n²)') {
            feedbackMsg += 'Consider optimizing nested loops for better performance.';
        } else if (timeComplex === 'O(n)') {
            feedbackMsg += 'Linear time complexity is acceptable for most cases.';
        } else {
            feedbackMsg += 'Constant time complexity - great job!';
        }

        return {
            time: timeComplex,
            space: spaceComplex,
            feedback: feedbackMsg
        };
    }
});
