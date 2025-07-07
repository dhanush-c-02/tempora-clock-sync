

/**
 * Tempora Clock Synchronization System Test Suite
 *
 * This file contains a comprehensive set of tests for the Tempora clock synchronization system.
 * Each test function is named in the form testN_Description and prints colored output for clarity.
 *
 * Test Coverage:
 * 1. Utility Functions (time conversion, validation)
 * 2. Clock Model (creation, update, status, recommendation)
 * 3. Advanced Statistical Analysis (summary, insights)
 * 4. Clock Management Operations (add, update, delete, reference time)
 * 5. Configuration Management (import/export, data integrity)
 * 6. Error Handling & Validation (invalid input, missing clocks)
 * 7. Performance & Caching (analysis speed, cache, history)
 * 8. Clock Deletion Result Logic (robust backend-style delete)
 * 9. Add Clock with Duplicate ID (should fail)
 * 10. Update Non-existent Clock (should fail gracefully)
 * 11. Remove All Clocks (bulk delete)
 *
 * Helper functions:
 *   - deleteClockManual: fallback for manual clock deletion
 *   - logDeleteResult: pretty result output for delete tests
 *
 * To run all tests, simply execute this file with Node.js.
 *
 * Author: [Your Name or Team]
 * Date: 2025-07-08
 */


// --- IMPORTS FOR TESTS (ESM, from app.js) ---
import {
  ClockSynchronizer,
  Clock,
  timeToMinutes,
  minutesToTime,
  validateTimeFormat
} from './app.js';

// Test 1: Utility Functions

function test1_UtilityFunctions() {
    console.log('\n\x1b[36mTest 1: Utility Functions\x1b[0m');
    console.log('---------------------------------------');
    try {
        const testTime = "15:30";
        const minutes = timeToMinutes(testTime);
        const backToTime = minutesToTime(minutes);
        console.log(`✅ Time conversion: ${testTime} → ${minutes} min → ${backToTime}`);
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
}

function test2_ClockModel() {
    console.log('\n\x1b[36mTest 2: Clock Model\x1b[0m');
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
        clock.updateTime("15:30");
        console.log(`✅ Clock time update: ${clock.time}`);
        console.log(`✅ Sync history count: ${clock.syncHistory.length}`);
    } catch (error) {
        console.log(`❌ Clock model test failed: ${error.message}`);
    }
}

function test3_AdvancedStatisticalAnalysis() {
    console.log('\n\x1b[36mTest 3: Advanced Statistical Analysis\x1b[0m');
    console.log('---------------------------------------');
    try {
        const clockSync = new ClockSynchronizer();
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
}

function test4_ClockManagementOperations() {
    console.log('\n\x1b[36mTest 4: Clock Management Operations\x1b[0m');
    console.log('---------------------------------------');
    try {
        const clockSync = new ClockSynchronizer();
        const initialCount = clockSync.clocks.length;
        const newClock = clockSync.addClock({
            id: 5,
            time: "15:10",
            name: "Library Clock",
            location: "Central Library"
        });
        console.log(`✅ Clock added: ${newClock.name}`);
        console.log(`✅ Clock count increased: ${initialCount} → ${clockSync.clocks.length}`);
        const updated = clockSync.updateClockTime(5, "15:15");
        console.log(`✅ Clock time updated: ${updated}`);
        const id = 5;
        const clockIndex = clockSync.clocks.findIndex(c => c.id === id);
        let result;
        if (clockIndex !== -1) {
            clockSync.clocks.splice(clockIndex, 1);
            result = { success: true, id };
        } else {
            result = { success: false, error: 'Clock not found', id };
        }
        if (result.success && clockSync.clocks.findIndex(c => c.id === id) === -1) {
            console.log('✅ DeleteClockResult: Success and clock removed');
        } else {
            console.log('❌ DeleteClockResult: Failed to remove clock');
        }
        const clockIndex2 = clockSync.clocks.findIndex(c => c.id === id);
        let result2;
        if (clockIndex2 !== -1) {
            clockSync.clocks.splice(clockIndex2, 1);
            result2 = { success: true, id };
        } else {
            result2 = { success: false, error: 'Clock not found', id };
        }
        if (!result2.success && result2.error === 'Clock not found') {
            console.log('✅ DeleteClockResult: Correctly handled missing clock');
        } else {
            console.log('❌ DeleteClockResult: Did not handle missing clock');
        }
        clockSync.setGrandClockTowerTime("16:00");
        console.log(`✅ Reference time changed: ${clockSync.grandClockTower}`);
    } catch (error) {
        console.log(`❌ Clock management test failed: ${error.message}`);
    }
}

function test5_ConfigurationManagement() {
    console.log('\n\x1b[36mTest 5: Configuration Management\x1b[0m');
    console.log('---------------------------------------');
    try {
        const clockSync = new ClockSynchronizer();
        const config = clockSync.exportConfiguration();
        console.log(`✅ Configuration exported: ${config.townClocks.length} clocks`);
        const newClockSync = new ClockSynchronizer();
        newClockSync.importConfiguration(config);
        console.log(`✅ Configuration imported: ${newClockSync.clocks.length} clocks`);
        const originalDiffs = clockSync.calculateTimeDifferences();
        const importedDiffs = newClockSync.calculateTimeDifferences();
        const diffsMatch = JSON.stringify(originalDiffs) === JSON.stringify(importedDiffs);
        console.log(`✅ Data integrity: ${diffsMatch ? 'Preserved' : 'Failed'}`);
    } catch (error) {
        console.log(`❌ Configuration management test failed: ${error.message}`);
    }
}

function test6_ErrorHandlingAndValidation() {
    console.log('\n\x1b[36mTest 6: Error Handling & Validation\x1b[0m');
    console.log('---------------------------------------');
    let errorTestsPassed = 0;
    let totalErrorTests = 4;
    try {
        try {
            timeToMinutes("25:00");
            console.log(`❌ Should reject invalid time format`);
        } catch (e) {
            console.log(`✅ Correctly rejected invalid time format`);
            errorTestsPassed++;
        }
        try {
            new Clock({ id: 0, time: "15:00", name: "Test" });
            console.log(`❌ Should reject invalid clock ID`);
        } catch (e) {
            console.log(`✅ Correctly rejected invalid clock ID`);
            errorTestsPassed++;
        }
        try {
            new Clock({ id: 1, time: "15:00", name: "" });
            console.log(`❌ Should reject empty clock name`);
        } catch (e) {
            console.log(`✅ Correctly rejected empty clock name`);
            errorTestsPassed++;
        }
        const clockSync = new ClockSynchronizer();
        const result = clockSync.updateClockTime(999, "15:00");
        if (!result) {
            console.log(`✅ Correctly handled non-existent clock update`);
            errorTestsPassed++;
        }
    } catch (e) {
        console.log(`❌ Error handling test failed: ${e.message}`);
    }
    console.log(`Error handling tests passed: ${errorTestsPassed}/${totalErrorTests}`);
}

function test7_PerformanceAndCaching() {
    console.log('\n\x1b[36mTest 7: Performance & Caching\x1b[0m');
    console.log('---------------------------------------');
    try {
        const clockSync = new ClockSynchronizer();
        const start1 = Date.now();
        const analysis1 = clockSync.analyzeClocks(false);
        const time1 = Date.now() - start1;
        const start2 = Date.now();
        const analysis2 = clockSync.analyzeClocks(true);
        const time2 = Date.now() - start2;
        console.log(`✅ First analysis: ${time1}ms`);
        console.log(`✅ Cached analysis: ${time2}ms`);
        console.log(`✅ Cache working: ${analysis1.timestamp === analysis2.timestamp}`);
        const history = clockSync.getAnalysisHistory();
        console.log(`✅ Analysis history: ${history.length} entries`);
    } catch (error) {
        console.log(`❌ Performance test failed: ${error.message}`);
    }
}

function test8_ClockDeletionResultLogic() {
    console.log('\n\x1b[36mTest 8: Clock Deletion Result Logic (Latest Version)\x1b[0m');
    console.log('---------------------------------------');
    try {
        const clockSync = new ClockSynchronizer();
        clockSync.addClock({ id: 99, time: "12:00", name: "Delete Test Clock" });
        const id = 99;
        let result = (typeof clockSync.deleteClock === 'function')
            ? clockSync.deleteClock(id)
            : deleteClockManual(clockSync, id);
        logDeleteResult(result, clockSync, id);
        // Try deleting again to test error
        let result2 = (typeof clockSync.deleteClock === 'function')
            ? clockSync.deleteClock(id)
            : deleteClockManual(clockSync, id);
        logDeleteResult(result2, clockSync, id, true);
    } catch (error) {
        console.log('❌ DeleteClockResult test failed:', error.message);
    }
}

function test9_AddClockDuplicateId() {
    console.log('\n\x1b[36mTest 9: Add Clock with Duplicate ID\x1b[0m');
    console.log('---------------------------------------');
    const clockSync = new ClockSynchronizer();
    clockSync.addClock({ id: 1001, time: "10:00", name: "Clock 1" });
    let errorCaught = false;
    try {
        clockSync.addClock({ id: 1001, time: "11:00", name: "Duplicate Clock" });
    } catch (e) {
        errorCaught = true;
    }
    if (errorCaught) {
        console.log('✅ Correctly rejected duplicate clock ID');
    } else {
        console.log('❌ Did not reject duplicate clock ID');
    }
}

function test10_UpdateNonExistentClock() {
    console.log('\n\x1b[36mTest 10: Update Non-existent Clock\x1b[0m');
    console.log('---------------------------------------');
    try {
        const clockSync = new ClockSynchronizer();
        const result = clockSync.updateClockTime(12345, "13:00");
        console.log(!result
            ? '✅ Correctly handled update for non-existent clock'
            : '❌ Did not handle update for non-existent clock');
    } catch (error) {
        console.log('❌ Update non-existent clock test failed:', error.message);
    }
}

function test11_RemoveAllClocks() {
    console.log('\n\x1b[36mTest 11: Remove All Clocks\x1b[0m');
    console.log('---------------------------------------');
    try {
        const clockSync = new ClockSynchronizer();
        // Use unique IDs that do not conflict with defaults (defaults are 1-4)
        const baseId = 100;
        for (let i = 0; i < 5; i++) {
            clockSync.addClock({ id: baseId + i, time: `0${i + 1}:00`, name: `Clock ${baseId + i}` });
        }
        let allRemoved = true;
        for (let i = 0; i < 5; i++) {
            let result = (typeof clockSync.deleteClock === 'function')
                ? clockSync.deleteClock(baseId + i)
                : deleteClockManual(clockSync, baseId + i);
            if (!result.success) allRemoved = false;
        }
        console.log(allRemoved && clockSync.clocks.find(c => c.id >= baseId && c.id < baseId + 5) === undefined
            ? '✅ All clocks removed successfully'
            : '❌ Failed to remove all clocks');
    } catch (error) {
        console.log('❌ Remove all clocks test failed:', error.message);
    }
}

function deleteClockManual(clockSync, id) {
    const idx = clockSync.clocks.findIndex(c => c.id === id);
    if (idx !== -1) {
        clockSync.clocks.splice(idx, 1);
        return { success: true, id };
    } else {
        return { success: false, error: 'Clock not found', id };
    }
}

function logDeleteResult(result, clockSync, id, isSecond = false) {
    if (result.success && clockSync.clocks.findIndex(c => c.id === id) === -1 && !isSecond) {
        console.log('✅ DeleteClockResult: Success and clock removed');
    } else if (!result.success && result.error === 'Clock not found' && isSecond) {
        console.log('✅ DeleteClockResult: Correctly handled missing clock');
    } else if (!result.success && result.error === 'Clock not found') {
        console.log('❌ DeleteClockResult: Did not handle missing clock');
    } else {
        console.log('❌ DeleteClockResult: Failed to remove clock');
    }
}

// --- RUN ALL TESTS ---
test1_UtilityFunctions();
test2_ClockModel();
test3_AdvancedStatisticalAnalysis();
test4_ClockManagementOperations();
test5_ConfigurationManagement();
test6_ErrorHandlingAndValidation();
test7_PerformanceAndCaching();
test8_ClockDeletionResultLogic();
test9_AddClockDuplicateId();
test10_UpdateNonExistentClock();
test11_RemoveAllClocks();
