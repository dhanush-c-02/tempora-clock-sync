/**
 * Tempora - Clock Synchronization System (Refactored)
 * 
 * This is the improved, modular version of the clock synchronization system
 * with better separation of concerns, error handling, and maintainability.
 */

// Import modules using require for Node.js compatibility
const path = require('path');

// Helper functions that were moved to utils
function validateTimeFormat(timeString) {
    const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (typeof timeString !== 'string') {
        throw new Error('Time must be a string');
    }
    
    if (!TIME_REGEX.test(timeString)) {
        throw new Error(`Invalid time format: ${timeString}. Expected format: HH:MM`);
    }
}

function timeToMinutes(timeString) {
    validateTimeFormat(timeString);
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
    if (typeof totalMinutes !== 'number' || totalMinutes < 0) {
        throw new Error(`Invalid minutes value: ${totalMinutes}`);
    }
    
    const normalizedMinutes = totalMinutes % (24 * 60);
    const hours = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Clock Model Class
class Clock {
    constructor({ id, time, name, location = '', color = '#4a5568' }) {
        this.validateClockData({ id, time, name });
        
        this.id = id;
        this.time = time;
        this.name = name;
        this.location = location;
        this.color = color;
        this.lastSyncTime = null;
        this.syncHistory = [];
    }

    validateClockData({ id, time, name }) {
        if (!Number.isInteger(id) || id < 1) {
            throw new Error(`Invalid clock ID: ${id}. Must be a positive integer`);
        }

        validateTimeFormat(time);

        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Clock name must be a non-empty string');
        }
    }

    updateTime(newTime) {
        validateTimeFormat(newTime);
        const oldTime = this.time;
        this.time = newTime;
        this.lastSyncTime = new Date().toISOString();
        
        this.syncHistory.push({
            timestamp: this.lastSyncTime,
            oldTime,
            newTime,
            action: 'time_update'
        });
    }

    getDifferenceFrom(referenceTime) {
        validateTimeFormat(referenceTime);
        
        const clockMinutes = timeToMinutes(this.time);
        const referenceMinutes = timeToMinutes(referenceTime);
        
        return clockMinutes - referenceMinutes;
    }

    getStatus(referenceTime) {
        const difference = this.getDifferenceFrom(referenceTime);
        
        if (difference === 0) return 'synchronized';
        if (difference > 0) return 'ahead';
        return 'behind';
    }

    getDetailedInfo(referenceTime) {
        const difference = this.getDifferenceFrom(referenceTime);
        const status = this.getStatus(referenceTime);
        
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            time: this.time,
            color: this.color,
            difference,
            absoluteDifference: Math.abs(difference),
            status,
            lastSyncTime: this.lastSyncTime,
            syncCount: this.syncHistory.length
        };
    }

    getSyncRecommendation(referenceTime) {
        const difference = this.getDifferenceFrom(referenceTime);
        const absoluteDifference = Math.abs(difference);
        const minuteText = absoluteDifference === 1 ? 'minute' : 'minutes';

        if (difference === 0) {
            return `✅ ${this.name}: Perfect synchronization - no adjustment needed`;
        } else if (difference > 0) {
            return `⏰ ${this.name}: Move backward by ${absoluteDifference} ${minuteText}`;
        } else {
            return `⏰ ${this.name}: Move forward by ${absoluteDifference} ${minuteText}`;
        }
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            time: this.time,
            color: this.color,
            lastSyncTime: this.lastSyncTime,
            syncHistory: this.syncHistory
        };
    }

    static fromJSON(data) {
        const clock = new Clock(data);
        clock.lastSyncTime = data.lastSyncTime;
        clock.syncHistory = data.syncHistory || [];
        return clock;
    }
}

// Statistics Analyzer
class SynchronizationAnalyzer {
    static analyzeClocks(clocksData) {
        const differences = clocksData.map(clock => clock.difference);
        const absoluteDifferences = differences.map(Math.abs);

        return {
            totalClocks: clocksData.length,
            synchronized: this.countByStatus(clocksData, 'synchronized'),
            ahead: this.countByStatus(clocksData, 'ahead'),
            behind: this.countByStatus(clocksData, 'behind'),
            maxDifference: Math.max(...absoluteDifferences),
            minDifference: Math.min(...absoluteDifferences),
            averageDifference: this.calculateAverage(absoluteDifferences),
            medianDifference: this.calculateMedian(absoluteDifferences),
            totalDrift: this.calculateTotalDrift(differences),
            synchronizationRate: this.calculateSynchronizationRate(clocksData),
            worstPerformer: this.findWorstPerformer(clocksData),
            bestPerformer: this.findBestPerformer(clocksData)
        };
    }

    static countByStatus(clocksData, status) {
        return clocksData.filter(clock => clock.status === status).length;
    }

    static calculateAverage(numbers) {
        if (numbers.length === 0) return 0;
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        return Math.round((sum / numbers.length) * 10) / 10;
    }

    static calculateMedian(numbers) {
        if (numbers.length === 0) return 0;
        
        const sorted = [...numbers].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        return sorted[middle];
    }

    static calculateTotalDrift(differences) {
        return differences.reduce((sum, diff) => sum + diff, 0);
    }

    static calculateSynchronizationRate(clocksData) {
        const synchronizedCount = this.countByStatus(clocksData, 'synchronized');
        return Math.round((synchronizedCount / clocksData.length) * 100);
    }

    static findWorstPerformer(clocksData) {
        if (clocksData.length === 0) return null;
        
        return clocksData.reduce((worst, current) => {
            return current.absoluteDifference > worst.absoluteDifference ? current : worst;
        });
    }

    static findBestPerformer(clocksData) {
        const nonSynchronized = clocksData.filter(clock => clock.absoluteDifference > 0);
        if (nonSynchronized.length === 0) return null;
        
        return nonSynchronized.reduce((best, current) => {
            return current.absoluteDifference < best.absoluteDifference ? current : best;
        });
    }

    static generateInsights(analysis) {
        const insights = [];

        if (analysis.synchronizationRate === 100) {
            insights.push("🎯 Perfect synchronization achieved across all clocks!");
        } else if (analysis.synchronizationRate >= 75) {
            insights.push("👍 Good synchronization rate - most clocks are aligned");
        } else if (analysis.synchronizationRate >= 50) {
            insights.push("⚠️ Moderate synchronization - some clocks need attention");
        } else {
            insights.push("🚨 Poor synchronization - immediate action required");
        }

        if (Math.abs(analysis.totalDrift) > 30) {
            const direction = analysis.totalDrift > 0 ? "fast" : "slow";
            insights.push(`⏰ Significant system-wide drift detected - clocks running ${direction}`);
        }

        if (analysis.worstPerformer && analysis.worstPerformer.absoluteDifference > 15) {
            insights.push(`🔧 "${analysis.worstPerformer.name}" requires immediate attention (${analysis.worstPerformer.absoluteDifference} min off)`);
        }

        return insights;
    }
}

// Display Formatter
class DisplayFormatter {
    static formatHeader(title = 'TEMPORA - CLOCK SYNCHRONIZATION SYSTEM') {
        const separator = '='.repeat(50);
        return `🕰️  ${title}\n${separator}`;
    }

    static formatSectionHeader(title, icon = '') {
        const separator = '-'.repeat(30);
        return `\n${icon} ${title}:\n${separator}`;
    }

    static formatClockAnalysis(clocksData) {
        let output = this.formatSectionHeader('CLOCK ANALYSIS', '📊');
        
        clocksData.forEach(clock => {
            const statusIcon = this.getStatusIcon(clock.status);
            const diffText = this.formatDifferenceText(clock.difference);
            const locationText = clock.location ? ` (${clock.location})` : '';
            
            output += `\n${statusIcon} ${clock.name}${locationText}: ${clock.time} (${diffText})`;
        });

        return output;
    }

    static formatSummaryStatistics(summary) {
        let output = this.formatSectionHeader('SUMMARY STATISTICS', '📈');
        
        output += `\nTotal Clocks: ${summary.totalClocks}`;
        output += `\nSynchronized: ${summary.synchronized}`;
        output += `\nRunning Ahead: ${summary.ahead}`;
        output += `\nRunning Behind: ${summary.behind}`;
        output += `\nSynchronization Rate: ${summary.synchronizationRate || 0}%`;
        output += `\nMax Difference: ${summary.maxDifference} minutes`;
        output += `\nAverage Difference: ${summary.averageDifference} minutes`;
        
        if (summary.medianDifference !== undefined) {
            output += `\nMedian Difference: ${summary.medianDifference} minutes`;
        }
        
        if (summary.totalDrift !== undefined) {
            output += `\nTotal System Drift: ${summary.totalDrift > 0 ? '+' : ''}${summary.totalDrift} minutes`;
        }

        return output;
    }

    static formatInsights(insights) {
        if (!insights || insights.length === 0) return '';
        
        let output = this.formatSectionHeader('SYSTEM INSIGHTS', '💡');
        
        insights.forEach(insight => {
            output += `\n${insight}`;
        });

        return output;
    }

    static formatRecommendations(recommendations) {
        let output = this.formatSectionHeader('SYNCHRONIZATION RECOMMENDATIONS', '🔧');
        
        recommendations.forEach(rec => {
            output += `\n${rec}`;
        });

        return output;
    }

    static formatTimeDifferencesArray(differences) {
        let output = this.formatSectionHeader('TIME DIFFERENCES ARRAY', '📋');
        output += `\n${JSON.stringify(differences)}`;
        return output;
    }

    static getStatusIcon(status) {
        switch (status) {
            case 'synchronized': return '✅';
            case 'ahead': return '⏩';
            case 'behind': return '⏪';
            default: return '❓';
        }
    }

    static formatDifferenceText(difference) {
        if (difference === 0) {
            return 'synchronized';
        }
        
        const sign = difference > 0 ? '+' : '';
        return `${sign}${difference} min`;
    }

    static createCompleteReport(analysisData) {
        const {
            grandClockTower,
            clocks,
            summary,
            recommendations,
            timeDifferences,
            insights
        } = analysisData;

        let report = this.formatHeader();
        report += `\n📍 Grand Clock Tower Time: ${grandClockTower}`;
        
        report += this.formatClockAnalysis(clocks);
        report += this.formatSummaryStatistics(summary);
        
        if (insights && insights.length > 0) {
            report += this.formatInsights(insights);
        }
        
        report += this.formatRecommendations(recommendations);
        report += this.formatTimeDifferencesArray(timeDifferences);

        return report;
    }
}

// Main ClockSynchronizer Class
class ClockSynchronizer {
    constructor(config = {}) {
        // Default configuration
        this.grandClockTower = config.grandClockTower || "15:00";
        
        const defaultClocks = [
            { id: 1, time: "14:45", name: "Town Square Clock", location: "Main Plaza" },
            { id: 2, time: "15:05", name: "Railway Station Clock", location: "Central Station" },
            { id: 3, time: "15:00", name: "Church Bell Tower", location: "St. Mary's Cathedral" },
            { id: 4, time: "14:40", name: "Market Clock", location: "Town Market Square" }
        ];
        
        this.clocks = this.initializeClocks(config.townClocks || defaultClocks);
        this.analysisHistory = [];
        this.lastAnalysis = null;
    }

    initializeClocks(clocksConfig) {
        return clocksConfig.map(clockData => new Clock(clockData));
    }

    setGrandClockTowerTime(newTime) {
        validateTimeFormat(newTime);
        this.grandClockTower = newTime;
        this.lastAnalysis = null;
    }

    addClock(clockData) {
        const clock = new Clock(clockData);
        this.clocks.push(clock);
        this.lastAnalysis = null;
        return clock;
    }

    removeClock(clockId) {
        const initialLength = this.clocks.length;
        this.clocks = this.clocks.filter(clock => clock.id !== clockId);
        
        if (this.clocks.length < initialLength) {
            this.lastAnalysis = null;
            return true;
        }
        return false;
    }

    updateClockTime(clockId, newTime) {
        const clock = this.clocks.find(c => c.id === clockId);
        if (clock) {
            clock.updateTime(newTime);
            this.lastAnalysis = null;
            return true;
        }
        return false;
    }

    getClock(clockId) {
        return this.clocks.find(clock => clock.id === clockId) || null;
    }

    calculateTimeDifferences() {
        return this.clocks.map(clock => clock.getDifferenceFrom(this.grandClockTower));
    }

    analyzeClocks(useCache = true) {
        if (useCache && this.lastAnalysis) {
            return this.lastAnalysis;
        }

        const clocksData = this.clocks.map(clock => 
            clock.getDetailedInfo(this.grandClockTower)
        );

        const summary = SynchronizationAnalyzer.analyzeClocks(clocksData);
        const insights = SynchronizationAnalyzer.generateInsights(summary);

        const analysis = {
            timestamp: new Date().toISOString(),
            grandClockTower: this.grandClockTower,
            clocks: clocksData,
            summary: summary,
            insights: insights,
            timeDifferences: this.calculateTimeDifferences()
        };

        this.lastAnalysis = analysis;
        this.analysisHistory.push({
            timestamp: analysis.timestamp,
            summary: summary
        });

        return analysis;
    }

    generateRecommendations() {
        return this.clocks.map(clock => 
            clock.getSyncRecommendation(this.grandClockTower)
        );
    }

    displayResults(compact = false) {
        const analysis = this.analyzeClocks();
        const recommendations = this.generateRecommendations();

        const displayData = {
            ...analysis,
            recommendations
        };

        console.log(DisplayFormatter.createCompleteReport(displayData));
        return analysis;
    }

    getAnalysisHistory() {
        return [...this.analysisHistory];
    }

    exportConfiguration() {
        return {
            grandClockTower: this.grandClockTower,
            townClocks: this.clocks.map(clock => clock.toJSON())
        };
    }

    importConfiguration(config) {
        if (config.grandClockTower) {
            this.setGrandClockTowerTime(config.grandClockTower);
        }
        
        if (config.townClocks) {
            this.clocks = config.townClocks.map(clockData => Clock.fromJSON(clockData));
        }
        
        this.lastAnalysis = null;
    }


    syncToCurrentTime() {
        // Get current IST time in HH:MM format
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const ist = new Date(now.getTime() + istOffset);
        const hours = ist.getUTCHours().toString().padStart(2, '0');
        const minutes = ist.getUTCMinutes().toString().padStart(2, '0');
        this.setGrandClockTowerTime(`${hours}:${minutes}`);
    }
}

const clockSync = new ClockSynchronizer();

// Export classes and utilities
module.exports = { 
    ClockSynchronizer,
    Clock,
    SynchronizationAnalyzer,
    DisplayFormatter,
    timeToMinutes,
    minutesToTime,
    validateTimeFormat
};

// Run analysis if this file is executed directly
if (require.main === module) {
    console.log('Starting Tempora Clock Synchronization System...\n');
    clockSync.displayResults();
}
