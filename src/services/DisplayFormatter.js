/**
 * Display formatting service for console output
 */

import { DISPLAY_ICONS } from '../config/constants.js';

export class DisplayFormatter {
    /**
     * Formats the main header
     * @param {string} title - Title to display
     * @returns {string} Formatted header
     */
    static formatHeader(title = 'TEMPORA - CLOCK SYNCHRONIZATION SYSTEM') {
        const separator = '='.repeat(50);
        return `${DISPLAY_ICONS.CLOCK}  ${title}\n${separator}`;
    }

    /**
     * Formats a section header
     * @param {string} title - Section title
     * @param {string} icon - Icon to display
     * @returns {string} Formatted section header
     */
    static formatSectionHeader(title, icon = '') {
        const separator = '-'.repeat(30);
        return `\n${icon} ${title}:\n${separator}`;
    }

    /**
     * Formats clock analysis display
     * @param {Array<Object>} clocksData - Array of clock data
     * @returns {string} Formatted clock analysis
     */
    static formatClockAnalysis(clocksData) {
        let output = this.formatSectionHeader('CLOCK ANALYSIS', DISPLAY_ICONS.ANALYSIS);
        
        clocksData.forEach(clock => {
            const statusIcon = this.getStatusIcon(clock.status);
            const diffText = this.formatDifferenceText(clock.difference);
            const locationText = clock.location ? ` (${clock.location})` : '';
            
            output += `\n${statusIcon} ${clock.name}${locationText}: ${clock.time} (${diffText})`;
        });

        return output;
    }

    /**
     * Formats summary statistics
     * @param {Object} summary - Summary statistics object
     * @returns {string} Formatted statistics
     */
    static formatSummaryStatistics(summary) {
        let output = this.formatSectionHeader('SUMMARY STATISTICS', DISPLAY_ICONS.STATISTICS);
        
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

    /**
     * Formats recommendations list
     * @param {Array<string>} recommendations - Array of recommendation strings
     * @returns {string} Formatted recommendations
     */
    static formatRecommendations(recommendations) {
        let output = this.formatSectionHeader('SYNCHRONIZATION RECOMMENDATIONS', DISPLAY_ICONS.RECOMMENDATIONS);
        
        recommendations.forEach(rec => {
            output += `\n${rec}`;
        });

        return output;
    }

    /**
     * Formats insights section
     * @param {Array<string>} insights - Array of insight strings
     * @returns {string} Formatted insights
     */
    static formatInsights(insights) {
        if (!insights || insights.length === 0) return '';
        
        let output = this.formatSectionHeader('SYSTEM INSIGHTS', '💡');
        
        insights.forEach(insight => {
            output += `\n${insight}`;
        });

        return output;
    }

    /**
     * Formats time differences array
     * @param {Array<number>} differences - Array of time differences
     * @returns {string} Formatted differences array
     */
    static formatTimeDifferencesArray(differences) {
        let output = this.formatSectionHeader('TIME DIFFERENCES ARRAY', DISPLAY_ICONS.DATA);
        output += `\n${JSON.stringify(differences)}`;
        return output;
    }

    /**
     * Formats performance highlights
     * @param {Object} analysis - Analysis object with performance data
     * @returns {string} Formatted performance section
     */
    static formatPerformanceHighlights(analysis) {
        if (!analysis.worstPerformer && !analysis.bestPerformer) return '';
        
        let output = this.formatSectionHeader('PERFORMANCE HIGHLIGHTS', '🏆');
        
        if (analysis.worstPerformer) {
            output += `\n🚨 Most Misaligned: ${analysis.worstPerformer.name} (${analysis.worstPerformer.absoluteDifference} min off)`;
        }
        
        if (analysis.bestPerformer) {
            output += `\n⭐ Best Non-Synchronized: ${analysis.bestPerformer.name} (${analysis.bestPerformer.absoluteDifference} min off)`;
        }

        return output;
    }

    /**
     * Gets status icon for clock status
     * @param {string} status - Clock status
     * @returns {string} Status icon
     */
    static getStatusIcon(status) {
        switch (status) {
            case 'synchronized': return DISPLAY_ICONS.SYNCHRONIZED;
            case 'ahead': return DISPLAY_ICONS.AHEAD;
            case 'behind': return DISPLAY_ICONS.BEHIND;
            default: return '❓';
        }
    }

    /**
     * Formats time difference text
     * @param {number} difference - Time difference in minutes
     * @returns {string} Formatted difference text
     */
    static formatDifferenceText(difference) {
        if (difference === 0) {
            return 'synchronized';
        }
        
        const sign = difference > 0 ? '+' : '';
        return `${sign}${difference} min`;
    }

    /**
     * Creates a complete formatted report
     * @param {Object} analysisData - Complete analysis data
     * @returns {string} Full formatted report
     */
    static createCompleteReport(analysisData) {
        const {
            grandClockTower,
            clocks,
            summary,
            recommendations,
            timeDifferences,
            insights,
            analysis
        } = analysisData;

        let report = this.formatHeader();
        report += `\n${DISPLAY_ICONS.LOCATION} Grand Clock Tower Time: ${grandClockTower}`;
        
        report += this.formatClockAnalysis(clocks);
        report += this.formatSummaryStatistics(summary);
        
        if (insights && insights.length > 0) {
            report += this.formatInsights(insights);
        }
        
        if (analysis && (analysis.worstPerformer || analysis.bestPerformer)) {
            report += this.formatPerformanceHighlights(analysis);
        }
        
        report += this.formatRecommendations(recommendations);
        report += this.formatTimeDifferencesArray(timeDifferences);

        return report;
    }

    /**
     * Creates a compact summary
     * @param {Object} analysisData - Analysis data
     * @returns {string} Compact summary
     */
    static createCompactSummary(analysisData) {
        const { summary, timeDifferences } = analysisData;
        
        return `${DISPLAY_ICONS.CLOCK} Tempora Summary: ${summary.totalClocks} clocks, ` +
               `${summary.synchronized} synchronized (${summary.synchronizationRate || 0}%), ` +
               `avg drift: ${summary.averageDifference}min | Differences: [${timeDifferences.join(', ')}]`;
    }

    /**
     * Formats data for web display (JSON structure)
     * @param {Object} analysisData - Analysis data
     * @returns {Object} Web-formatted data
     */
    static formatForWeb(analysisData) {
        return {
            header: {
                title: 'Tempora Clock Synchronization System',
                grandClockTime: analysisData.grandClockTower,
                timestamp: new Date().toISOString()
            },
            clocks: analysisData.clocks.map(clock => ({
                ...clock,
                statusIcon: this.getStatusIcon(clock.status),
                differenceText: this.formatDifferenceText(clock.difference)
            })),
            summary: {
                ...analysisData.summary,
                synchronizationRatePercent: `${analysisData.summary.synchronizationRate || 0}%`
            },
            recommendations: analysisData.recommendations,
            insights: analysisData.insights || [],
            timeDifferences: analysisData.timeDifferences
        };
    }
}
