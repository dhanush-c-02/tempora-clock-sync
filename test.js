const { ClockSynchronizer } = require('./app.js');

// Test the Clock Synchronization System
console.log('🧪 TESTING TEMPORA CLOCK SYNCHRONIZATION SYSTEM\n');

function runTests() {
    const clockSync = new ClockSynchronizer();
    
    // Test 1: Time conversion
    console.log('Test 1: Time Conversion');
    console.log('---------------------------------------');
    const testTime = "15:30";
    const minutes = clockSync.timeToMinutes(testTime);
    const backToTime = clockSync.minutesToTime(minutes);
    console.log(`${testTime} → ${minutes} minutes → ${backToTime}`);
    console.log(`✅ Conversion test: ${testTime === backToTime ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 2: Time differences calculation
    console.log('Test 2: Time Differences Calculation');
    console.log('---------------------------------------');
    const differences = clockSync.calculateTimeDifferences();
    const expectedDifferences = [-15, 5, 0, -20]; // Expected results
    console.log(`Calculated differences: [${differences.join(', ')}]`);
    console.log(`Expected differences:   [${expectedDifferences.join(', ')}]`);
    
    const differencesMatch = JSON.stringify(differences) === JSON.stringify(expectedDifferences);
    console.log(`✅ Time differences test: ${differencesMatch ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 3: Analysis functionality
    console.log('Test 3: Analysis Functionality');
    console.log('---------------------------------------');
    const analysis = clockSync.analyzeClocks();
    console.log(`Grand Clock Tower: ${analysis.grandClockTower}`);
    console.log(`Total clocks analyzed: ${analysis.summary.totalClocks}`);
    console.log(`Synchronized clocks: ${analysis.summary.synchronized}`);
    console.log(`Clocks ahead: ${analysis.summary.ahead}`);
    console.log(`Clocks behind: ${analysis.summary.behind}`);
    console.log(`✅ Analysis test: ${analysis.summary.totalClocks === 4 ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 4: Recommendations generation
    console.log('Test 4: Recommendations Generation');
    console.log('---------------------------------------');
    const recommendations = clockSync.generateRecommendations();
    console.log(`Generated ${recommendations.length} recommendations:`);
    recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
    });
    console.log(`✅ Recommendations test: ${recommendations.length === 4 ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 5: Edge cases
    console.log('Test 5: Edge Cases');
    console.log('---------------------------------------');
    
    // Test midnight edge case
    const midnightMinutes = clockSync.timeToMinutes("00:00");
    console.log(`Midnight (00:00) = ${midnightMinutes} minutes`);
    
    // Test late evening
    const lateEvening = clockSync.timeToMinutes("23:59");
    console.log(`Late evening (23:59) = ${lateEvening} minutes`);
    
    console.log(`✅ Edge cases test: ${midnightMinutes === 0 && lateEvening === 1439 ? 'PASSED' : 'FAILED'}\n`);
    
    // Summary
    console.log('🎯 TEST SUMMARY');
    console.log('===============');
    console.log('All core functionality tests completed.');
    console.log('The system is ready for clock synchronization!\n');
    
    // Display full analysis
    console.log('📊 FULL SYSTEM ANALYSIS:');
    console.log('='.repeat(50));
    clockSync.displayResults();
}

// Run all tests
runTests();
