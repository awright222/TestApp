// 🎓 CLEAN VERSION - Copy this entire block and paste in browser console

(function() {
    console.log('🎓 Adding Showcase Test...');
    
    const test = {
        "id": "showcase-seed-test",
        "title": "🎓 Complete Learning Showcase",
        "description": "A comprehensive test showcasing all question types",
        "questions": [
            {
                "id": "q1",
                "question_text": "🎯 Which learning method is most effective?",
                "question_type": "multiple choice",
                "choices": "A. Active practice\nB. Passive reading\nC. Memorizing\nD. Avoiding challenges",
                "correct_answer": "A",
                "explanation": "Active practice enhances learning retention!"
            },
            {
                "id": "q2",
                "question_text": "💡 Name a benefit of spaced repetition.",
                "question_type": "short answer",
                "choices": "memory, retention, recall",
                "correct_answer": "memory",
                "explanation": "Spaced repetition improves memory retention."
            },
            {
                "id": "q3",
                "question_text": "🖱️ Click on brain memory regions:",
                "question_type": "hotspot",
                "choices": "Memory: hippocampus\nLanguage: broca",
                "correct_answer": "Memory: hippocampus",
                "explanation": "Hippocampus is crucial for memory."
            },
            {
                "id": "q4",
                "question_text": "🔄 Match techniques to purposes:",
                "question_type": "drag and drop",
                "choices": "Items: Flashcards, Tests\nZones: Recall, Assessment",
                "correct_answer": "Flashcards -> Recall",
                "explanation": "Different techniques serve different purposes."
            },
            {
                "id": "q5",
                "question_text": "📝 Describe your ideal study space.",
                "question_type": "essay",
                "choices": "Personal preferences",
                "correct_answer": "Personal response",
                "explanation": "Everyone has unique learning preferences."
            }
        ],
        "settings": {
            "timeLimit": 0,
            "showExplanations": true,
            "showCorrectAnswers": true,
            "passingScore": 60
        },
        "questionCount": 5,
        "createdAt": new Date().toISOString(),
        "icon": "🎓",
        "color": "#4A90E2",
        "isActive": true,
        "isSeedTest": true
    };
    
    try {
        let publishedTests = JSON.parse(localStorage.getItem('publishedTests') || '[]');
        publishedTests = publishedTests.filter(t => t.id !== 'showcase-seed-test');
        publishedTests.unshift(test);
        localStorage.setItem('publishedTests', JSON.stringify(publishedTests));
        
        console.log('✅ SUCCESS! Test added to localStorage');
        console.log('📊 Total tests now:', publishedTests.length);
        console.log('🔄 Refreshing page...');
        
        setTimeout(() => window.location.reload(), 1000);
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.log('Please check if you are on localhost:3000');
    }
})();
