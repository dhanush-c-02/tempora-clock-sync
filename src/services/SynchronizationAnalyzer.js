/**
 * Statistics analyzer for clock synchronization data
 */

import { CLOCK_STATUS } from '../config/constants.js';

export class SynchronizationAnalyzer {
    /**
     * Analyzes clock synchronization statistics
     * @param {Array<Object>} clocksData - Array of detailed clock information
     * @returns {Object} Statistical analysis
     */
    static analyzeClocks(clocksData) {
        const differences = clocksData.map(clock => clock.difference);
        const absoluteDifferences = differences.map(Math.abs);

        return {
            totalClocks: clocksData.length,
            synchronized: this.countByStatus(clocksData, CLOCK_STATUS.SYNCHRONIZED),
            ahead: this.countByStatus(clocksData, CLOCK_STATUS.AHEAD),
            behind: this.countByStatus(clocksData, CLOCK_STATUS.BEHIND),
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

    /**
     * Counts clocks by status
     * @param {Array<Object>} clocksData - Clock data array
     * @param {string} status - Status to count
     * @returns {number} Count of clocks with given status
     */
    static countByStatus(clocksData, status) {
        return clocksData.filter(clock => clock.status === status).length;
    }

    /**
     * Calculates average of an array of numbers
     * @param {Array<number>} numbers - Array of numbers
     * @returns {number} Average value
     */
    static calculateAverage(numbers) {
        if (numbers.length === 0) return 0;
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        return Math.round((sum / numbers.length) * 10) / 10; // Round to 1 decimal
    }

    /**
     * Calculates median of an array of numbers
     * @param {Array<number>} numbers - Array of numbers
     * @returns {number} Median value
     */
    static calculateMedian(numbers) {
        if (numbers.length === 0) return 0;
        
        const sorted = [...numbers].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        return sorted[middle];
    }

    /**
     * Calculates total drift (sum of all differences)
     * @param {Array<number>} differences - Array of time differences
     * @returns {number} Total drift in minutes
     */
    static calculateTotalDrift(differences) {
        return differences.reduce((sum, diff) => sum + diff, 0);
    }

    /**
     * Calculates synchronization rate as percentage
     * @param {Array<Object>} clocksData - Clock data array
     * @returns {number} Synchronization rate (0-100)
     */
    static calculateSynchronizationRate(clocksData) {
        const synchronizedCount = this.countByStatus(clocksData, CLOCK_STATUS.SYNCHRONIZED);
        return Math.round((synchronizedCount / clocksData.length) * 100);
    }

    /**
     * Finds the clock with the worst synchronization
     * @param {Array<Object>} clocksData - Clock data array
     * @returns {Object|null} Clock with highest absolute difference
     */
    static findWorstPerformer(clocksData) {
        if (clocksData.length === 0) return null;
        
        return clocksData.reduce((worst, current) => {
            return current.absoluteDifference > worst.absoluteDifference ? current : worst;
        });
    }

    /**
     * Finds the best synchronized clock (excluding perfect matches)
     * @param {Array<Object>} clocksData - Clock data array
     * @returns {Object|null} Clock with lowest non-zero difference
     */
    static findBestPerformer(clocksData) {
        const nonSynchronized = clocksData.filter(clock => clock.absoluteDifference > 0);
        if (nonSynchronized.length === 0) return null;
        
        return nonSynchronized.reduce((best, current) => {
            return current.absoluteDifference < best.absoluteDifference ? current : best;
        });
    }

    /**
     * Generates insights based on analysis
     * @param {Object} analysis - Analysis results
     * @returns {Array<string>} Array of insight strings
     */
    static generateInsights(analysis) {
        const insights = [];

        // Synchronization rate insights
        if (analysis.synchronizationRate === 100) {
            insights.push("🎯 Perfect synchronization achieved across all clocks!");
        } else if (analysis.synchronizationRate >= 75) {
            insights.push("👍 Good synchronization rate - most clocks are aligned");
        } else if (analysis.synchronizationRate >= 50) {
            insights.push("⚠️ Moderate synchronization - some clocks need attention");
        } else {
            insights.push("🚨 Poor synchronization - immediate action required");
        }

        // Drift analysis
        if (Math.abs(analysis.totalDrift) > 30) {
            const direction = analysis.totalDrift > 0 ? "fast" : "slow";
            insights.push(`⏰ Significant system-wide drift detected - clocks running ${direction}`);
        }

        // Performance insights
        if (analysis.worstPerformer && analysis.worstPerformer.absoluteDifference > 15) {
            insights.push(`🔧 "${analysis.worstPerformer.name}" requires immediate attention (${analysis.worstPerformer.absoluteDifference} min off)`);
        }

        // Range insights
        const range = analysis.maxDifference - analysis.minDifference;
        if (range > 20) {
            insights.push("📊 Wide variation in clock accuracy detected");
        }

        return insights;
    }

    /**
     * Creates a summary report
     * @param {Object} analysis - Analysis results
     * @param {Array<Object>} clocksData - Original clock data
     * @returns {Object} Formatted summary report
     */
    static createSummaryReport(analysis, clocksData) {
        return {
            overview: {
                totalClocks: analysis.totalClocks,
                synchronizationRate: `${analysis.synchronizationRate}%`,
                averageDrift: `${analysis.averageDifference} min`,
                worstCase: `${analysis.maxDifference} min`
            },
            breakdown: {
                synchronized: analysis.synchronized,
                ahead: analysis.ahead,
                behind: analysis.behind
            },
            statistics: {
                average: analysis.averageDifference,
                median: analysis.medianDifference,
                range: analysis.maxDifference - analysis.minDifference,
                totalDrift: analysis.totalDrift
            },
            insights: this.generateInsights(analysis),
            recommendations: clocksData.length > 0 ? this.generateRecommendations(analysis) : []
        };
    }

    /**
     * Generates system-wide recommendations
     * @param {Object} analysis - Analysis results
     * @returns {Array<string>} Array of recommendations
     */
    static generateRecommendations(analysis) {
        const recommendations = [];

        if (analysis.synchronizationRate < 50) {
            recommendations.push("🚨 Priority: Schedule immediate maintenance for all unsynchronized clocks");
        }

        if (Math.abs(analysis.totalDrift) > 20) {
            recommendations.push("⚡ Consider implementing automatic synchronization system");
        }

        if (analysis.maxDifference > 30) {
            recommendations.push("🔍 Investigate potential hardware issues in severely misaligned clocks");
        }

        if (analysis.averageDifference > 10) {
            recommendations.push("📅 Increase frequency of synchronization checks");
        }

        return recommendations;
    }
}
