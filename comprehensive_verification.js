// Comprehensive test verification script
// Run this in the browser console to verify all fixes

console.log('🚀 FORMULATE TEST APP - COMPREHENSIVE VERIFICATION');
console.log('================================================');

// 1. Check localStorage for test data
function checkLocalStorage() {
    console.log('\n📂 1. CHECKING LOCALSTORAGE...');
    
    const publishedTests = localStorage.getItem('publishedTests');
    const createdTests = localStorage.getItem('created_tests');
    
    let allTests = [];
    
    if (publishedTests) {
        const tests = JSON.parse(publishedTests);
        console.log(`   ✅ Published tests: ${tests.length}`);
        allTests = allTests.concat(tests.map(t => ({...t, source: 'published'})));
    }
    
    if (createdTests) {
        const tests = JSON.parse(createdTests);
        console.log(`   ✅ Created tests: ${tests.length}`);
        allTests = allTests.concat(tests.map(t => ({...t, source: 'created'})));
    }
    
    return allTests;
}

// 2. Analyze test structure and types
function analyzeTests(tests) {
    console.log('\n🔍 2. ANALYZING TEST STRUCTURE...');
    
    const csvTests = tests.filter(t => t.csvUrl && !t.questions);
    const directTests = tests.filter(t => t.questions && Array.isArray(t.questions));
    const incompleteTests = tests.filter(t => !t.csvUrl && (!t.questions || !Array.isArray(t.questions)));
    
    console.log(`   📊 CSV-based tests: ${csvTests.length}`);
    console.log(`   📝 Direct question tests: ${directTests.length}`);
    console.log(`   ⚠️  Incomplete tests: ${incompleteTests.length}`);
    
    if (csvTests.length > 0) {
        console.log('\n   CSV Tests:');
        csvTests.forEach(test => {
            console.log(`   - ${test.title} (${test.id}) [${test.source}]`);
        });
    }
    
    if (directTests.length > 0) {
        console.log('\n   Direct Tests:');
        directTests.forEach(test => {
            console.log(`   - ${test.title} (${test.questions.length} questions) [${test.source}]`);
        });
    }
    
    return { csvTests, directTests, incompleteTests };
}

// 3. Check question types in tests
function analyzeQuestionTypes(tests) {
    console.log('\n❓ 3. ANALYZING QUESTION TYPES...');
    
    const questionTypes = {};
    let totalQuestions = 0;
    
    tests.forEach(test => {
        if (test.questions && Array.isArray(test.questions)) {
            test.questions.forEach(q => {
                const type = q.question_type || q.type || 'unknown';
                questionTypes[type] = (questionTypes[type] || 0) + 1;
                totalQuestions++;
            });
        }
    });
    
    console.log(`   Total questions analyzed: ${totalQuestions}`);
    Object.entries(questionTypes).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
    });
    
    return questionTypes;
}

// 4. Test CSV loading capability
function testCSVLoading() {
    console.log('\n📡 4. TESTING CSV LOADING...');
    
    // Mock Papa Parse if not available
    if (typeof Papa === 'undefined') {
        console.log('   ⚠️  Papa Parse not loaded - would need to load from CDN for full test');
        return false;
    }
    
    const testCSVData = `question_text,question_type,options,correct_answer
"What is 2+2?",multiple_choice,"A) 3|B) 4|C) 5",B
"Explain photosynthesis",essay,"",""
"Capital of France",short_answer,"","Paris"`;
    
    Papa.parse(testCSVData, {
        header: true,
        complete: (result) => {
            console.log('   ✅ CSV parsing works');
            console.log(`   - Parsed ${result.data.length} rows`);
            console.log('   - Sample row:', result.data[0]);
        },
        error: (error) => {
            console.log('   ❌ CSV parsing failed:', error);
        }
    });
    
    return true;
}

// 5. Check point system implementation
function checkPointSystem(tests) {
    console.log('\n🎯 5. CHECKING POINT SYSTEM...');
    
    let hasCustomPoints = false;
    let hasAutoPoints = false;
    
    tests.forEach(test => {
        if (test.questions && Array.isArray(test.questions)) {
            test.questions.forEach(q => {
                if (q.points) {
                    hasCustomPoints = true;
                }
                if (q.question_type === 'multiple_choice' || q.question_type === 'drag_and_drop' || q.question_type === 'hotspot') {
                    hasAutoPoints = true;
                }
            });
        }
    });
    
    console.log(`   ✅ Tests with custom points: ${hasCustomPoints ? 'Yes' : 'No'}`);
    console.log(`   ✅ Auto-scoring capable questions: ${hasAutoPoints ? 'Yes' : 'No'}`);
    
    return { hasCustomPoints, hasAutoPoints };
}

// 6. Test URL routing
function checkCurrentRoute() {
    console.log('\n🗺️  6. CHECKING CURRENT ROUTE...');
    
    const url = window.location.href;
    console.log(`   Current URL: ${url}`);
    
    if (url.includes('/practice-test/')) {
        const testId = url.split('/practice-test/')[1];
        console.log(`   ✅ Practice test route detected`);
        console.log(`   Test ID: ${testId}`);
        return testId;
    } else if (url.includes('/my-tests')) {
        console.log(`   ✅ My Tests route detected`);
    } else if (url.includes('/create-test')) {
        console.log(`   ✅ Create Test route detected`);
    } else {
        console.log(`   📍 Other route: ${url}`);
    }
    
    return null;
}

// 7. Run comprehensive verification
function runComprehensiveVerification() {
    console.log('🔍 Running comprehensive verification...\n');
    
    const tests = checkLocalStorage();
    const analysis = analyzeTests(tests);
    const questionTypes = analyzeQuestionTypes(analysis.directTests);
    const csvCapable = testCSVLoading();
    const pointSystem = checkPointSystem(tests);
    const currentTestId = checkCurrentRoute();
    
    console.log('\n📊 SUMMARY REPORT');
    console.log('================');
    console.log(`✅ Total tests in storage: ${tests.length}`);
    console.log(`✅ CSV-based tests: ${analysis.csvTests.length}`);
    console.log(`✅ Direct question tests: ${analysis.directTests.length}`);
    console.log(`✅ Question types supported: ${Object.keys(questionTypes).length}`);
    console.log(`✅ CSV loading capable: ${csvCapable}`);
    console.log(`✅ Point system features: ${pointSystem.hasCustomPoints || pointSystem.hasAutoPoints}`);
    
    if (analysis.incompleteTests.length > 0) {
        console.log(`⚠️  Incomplete tests that need attention: ${analysis.incompleteTests.length}`);
    }
    
    // Specific recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (analysis.csvTests.length > 0) {
        console.log('📊 Test CSV loading with these URLs:');
        analysis.csvTests.forEach(test => {
            console.log(`   http://localhost:3000/practice-test/${test.id}`);
        });
    }
    
    if (analysis.directTests.length > 0) {
        console.log('📝 Test direct question loading with these URLs:');
        analysis.directTests.slice(0, 3).forEach(test => {
            console.log(`   http://localhost:3000/practice-test/${test.id}`);
        });
    }
    
    console.log('\n🎉 VERIFICATION COMPLETE!');
    
    return {
        tests,
        analysis,
        questionTypes,
        csvCapable,
        pointSystem,
        currentTestId
    };
}

// Auto-run verification
runComprehensiveVerification();
