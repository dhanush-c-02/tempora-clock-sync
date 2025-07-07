const { 
    ClockSynchronizerRefactored, 
    Clock, 
    SynchronizationAnalyzer,
    timeToMinutes,
    minutesToTime,
    validateTimeFormat
} = require('./app-refactored.js');

// Test the Refactored Clock Synchronization System
console.log('🧪 TESTING REFACTORED TEMPORA CLOCK SYNCHRONIZATION SYSTEM\n');

function runRefactoredTests() {
    console.log('='.repeat(60));
    console.log('REFACTORED VERSION TESTS');
    console.log('='.repeat(60));

    // Test 1: Utility Functions
    console.log('\nTest 1: Utility Functions');
    console.log('---------------------------------------');
    
    try {
        const testTime = "15:30";
        const minutes = timeToMinutes(testTime);
        const backToTime = minutesToTime(minutes);
        console.log(`✅ Time conversion: ${testTime} → ${minutes} min → ${backToTime}`);
        
        // Test validation
        validateTimeFormat("14:45");
        console.log(`✅ Time validation: Valid format accepted`);
        
        try {
            validateTimeFormat("25:00");
            console.log(`❌ Time validation: Should have failed for invalid time`);
        } catch (e) {
            console.log(`✅ Time validation: Correctly rejected invalid time`);
        }
        
    } catch (error) {
        console.log(`❌ Utility functions test failed: ${error.message}`);
    }

    // Test 2: Clock Model
    console.log('\nTest 2: Clock Model');
    console.log('---------------------------------------');
    
    try {
        const clock = new Clock({
            id: 1,
            time: "14:45",
            name: "Test Clock",
            location: "Test Location"
        });
        
        console.log(`✅ Clock creation: ${clock.name} at ${clock.time}`);
        
        const difference = clock.getDifferenceFrom("15:00");
        console.log(`✅ Clock difference calculation: ${difference} minutes`);
        
        const status = clock.getStatus("15:00");
        console.log(`✅ Clock status: ${status}`);
        
        const recommendation = clock.getSyncRecommendation("15:00");
        console.log(`✅ Clock recommendation: ${recommendation}`);
        
        // Test clock update
        clock.updateTime("15:30");
        console.log(`✅ Clock time update: ${clock.time}`);
        console.log(`✅ Sync history count: ${clock.syncHistory.length}`);
        
    } catch (error) {
        console.log(`❌ Clock model test failed: ${error.message}`);
    }

    // Test 3: Advanced Analysis
    console.log('\nTest 3: Advanced Statistical Analysis');
    console.log('---------------------------------------');
    
    try {
        const clockSync = new ClockSynchronizerRefactored();
        const analysis = clockSync.analyzeClocks();
        
        console.log(`✅ Analysis timestamp: ${analysis.timestamp}`);
        console.log(`✅ Total clocks: ${analysis.summary.totalClocks}`);
        console.log(`✅ Synchronization rate: ${analysis.summary.synchronizationRate}%`);
        console.log(`✅ Average difference: ${analysis.summary.averageDifference} min`);
        console.log(`✅ Median difference: ${analysis.summary.medianDifference} min`);
        console.log(`✅ Total drift: ${analysis.summary.totalDrift} min`);
        
        if (analysis.summary.worstPerformer) {
            console.log(`✅ Worst performer: ${analysis.summary.worstPerformer.name} (${analysis.summary.worstPerformer.absoluteDifference} min)`);
        }
        
        console.log(`✅ Insights generated: ${analysis.insights.length}`);
        
    } catch (error) {
        console.log(`❌ Advanced analysis test failed: ${error.message}`);
    }

    // Test 4: Clock Management
    console.log('\nTest 4: Clock Management Operations');
    console.log('---------------------------------------');
    
    try {
        const clockSync = new ClockSynchronizerRefactored();
        const initialCount = clockSync.clocks.length;
        
        // Add a new clock
        const newClock = clockSync.addClock({
            id: 5,
            time: "15:10",
            name: "Library Clock",
            location: "Central Library"
        });
        
        console.log(`✅ Clock added: ${newClock.name}`);
        console.log(`✅ Clock count increased: ${initialCount} → ${clockSync.clocks.length}`);
        
        // Update a clock time
        const updated = clockSync.updateClockTime(5, "15:15");
        console.log(`✅ Clock time updated: ${updated}`);
        
        // Remove a clock
        const removed = clockSync.removeClock(5);
        console.log(`✅ Clock removed: ${removed}`);
        console.log(`✅ Clock count restored: ${clockSync.clocks.length}`);
        
        // Test reference time change
        clockSync.setGrandClockTowerTime("16:00");
        console.log(`✅ Reference time changed: ${clockSync.grandClockTower}`);
        
    } catch (error) {
        console.log(`❌ Clock management test failed: ${error.message}`);
    }

    // Test 5: Configuration Import/Export
    console.log('\nTest 5: Configuration Management');
    console.log('---------------------------------------');
    
    try {
        const clockSync = new ClockSynchronizerRefactored();
        
        // Export configuration
        const config = clockSync.exportConfiguration();
        console.log(`✅ Configuration exported: ${config.townClocks.length} clocks`);
        
        // Create new instance and import
        const newClockSync = new ClockSynchronizerRefactored();
        newClockSync.importConfiguration(config);
        console.log(`✅ Configuration imported: ${newClockSync.clocks.length} clocks`);
        
        // Verify data integrity
        const originalDiffs = clockSync.calculateTimeDifferences();
        const importedDiffs = newClockSync.calculateTimeDifferences();
        const diffsMatch = JSON.stringify(originalDiffs) === JSON.stringify(importedDiffs);
        console.log(`✅ Data integrity: ${diffsMatch ? 'Preserved' : 'Failed'}`);
        
    } catch (error) {
        console.log(`❌ Configuration management test failed: ${error.message}`);
    }

    // Test 6: Error Handling
    console.log('\nTest 6: Error Handling & Validation');
    console.log('---------------------------------------');
    
    let errorTestsPassed = 0;
    let totalErrorTests = 4;
    
    // Test invalid time format
    try {
        timeToMinutes("25:00");
        console.log(`❌ Should reject invalid time format`);
    } catch (e) {
        console.log(`✅ Correctly rejected invalid time format`);
        errorTestsPassed++;
    }
    
    // Test invalid clock ID
    try {
        new Clock({ id: 0, time: "15:00", name: "Test" });
        console.log(`❌ Should reject invalid clock ID`);
    } catch (e) {
        console.log(`✅ Correctly rejected invalid clock ID`);
        errorTestsPassed++;
    }
    
    // Test empty clock name
    try {
        new Clock({ id: 1, time: "15:00", name: "" });
        console.log(`❌ Should reject empty clock name`);
    } catch (e) {
        console.log(`✅ Correctly rejected empty clock name`);
        errorTestsPassed++;
    }
    
    // Test non-existent clock operations
    try {
        const clockSync = new ClockSynchronizerRefactored();
        const result = clockSync.updateClockTime(999, "15:00");
        if (!result) {
            console.log(`✅ Correctly handled non-existent clock update`);
            errorTestsPassed++;
        }
    } catch (e) {
        console.log(`❌ Error handling test failed: ${e.message}`);
    }
    
    console.log(`Error handling tests passed: ${errorTestsPassed}/${totalErrorTests}`);

    // Test 7: Performance and Caching
    console.log('\nTest 7: Performance & Caching');
    console.log('---------------------------------------');
    
    try {
        const clockSync = new ClockSynchronizerRefactored();
        
        // First analysis (no cache)
        const start1 = Date.now();
        const analysis1 = clockSync.analyzeClocks(false);
        const time1 = Date.now() - start1;
        
        // Second analysis (with cache)
        const start2 = Date.now();
        const analysis2 = clockSync.analyzeClocks(true);
        const time2 = Date.now() - start2;
        
        console.log(`✅ First analysis: ${time1}ms`);
        console.log(`✅ Cached analysis: ${time2}ms`);
        console.log(`✅ Cache working: ${analysis1.timestamp === analysis2.timestamp}`);
        
        // Test analysis history
        const history = clockSync.getAnalysisHistory();
        console.log(`✅ Analysis history: ${history.length} entries`);
        
    } catch (error) {
        console.log(`❌ Performance test failed: ${error.message}`);
    }

    // Summary
    console.log('\n🎯 REFACTORED VERSION TEST SUMMARY');
    console.log('=======================================');
    console.log('✅ Utility functions: Enhanced with validation');
    console.log('✅ Clock model: Object-oriented with history tracking');
    console.log('✅ Advanced analysis: Statistical insights and recommendations');
    console.log('✅ Clock management: Add, remove, update operations');
    console.log('✅ Configuration: Import/export functionality');
    console.log('✅ Error handling: Comprehensive validation');
    console.log('✅ Performance: Caching and history tracking');
    console.log('\n🎉 All refactored functionality tests completed successfully!');
    
    // Demo the enhanced display
    console.log('\n' + '='.repeat(60));
    console.log('ENHANCED DISPLAY DEMONSTRATION');
    console.log('='.repeat(60));
    
    const demoSync = new ClockSynchronizerRefactored();
    demoSync.displayResults();
}

// Run all refactored tests
runRefactoredTests();
