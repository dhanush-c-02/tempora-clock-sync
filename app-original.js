/**
 * Tempora - Clock Synchronization System
 * 
 * This application analyzes and synchronizes various clocks around town
 * with the Grand Clock Tower's time. It calculates time differences and
 * provides visual representations of clock synchronization status.
 */

class ClockSynchronizer {
    constructor() {
        this.grandClockTower = "15:00"; // Grand Clock Tower time
        this.townClocks = [
            { id: 1, time: "14:45", name: "Town Square Clock" },
            { id: 2, time: "15:05", name: "Railway Station Clock" },
            { id: 3, time: "15:00", name: "Church Bell Tower" },
            { id: 4, time: "14:40", name: "Market Clock" }
        ];
    }

    /**
     * Converts time string (HH:MM) to minutes since midnight
     * @param {string} timeString - Time in HH:MM format
     * @returns {number} Minutes since midnight
     */
    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Converts minutes to HH:MM format
     * @param {number} minutes - Minutes since midnight
     * @returns {string} Time in HH:MM format
     */
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    /**
     * Calculates time differences between town clocks and Grand Clock Tower
     * @returns {Array} Array of time differences in minutes
     */
    calculateTimeDifferences() {
        const grandClockMinutes = this.timeToMinutes(this.grandClockTower);
        
        return this.townClocks.map(clock => {
            const clockMinutes = this.timeToMinutes(clock.time);
            return clockMinutes - grandClockMinutes;
        });
    }

    /**
     * Analyzes clock synchronization status
     * @returns {Object} Analysis results with detailed information
     */
    analyzeClocks() {
        const differences = this.calculateTimeDifferences();
        const analysis = {
            grandClockTower: this.grandClockTower,
            clocks: this.townClocks.map((clock, index) => ({
                ...clock,
                difference: differences[index],
                status: differences[index] === 0 ? 'synchronized' : 
                        differences[index] > 0 ? 'ahead' : 'behind',
                absoluteDifference: Math.abs(differences[index])
            })),
            summary: {
                totalClocks: this.townClocks.length,
                synchronized: differences.filter(diff => diff === 0).length,
                ahead: differences.filter(diff => diff > 0).length,
                behind: differences.filter(diff => diff < 0).length,
                maxDifference: Math.max(...differences.map(Math.abs)),
                averageDifference: differences.reduce((sum, diff) => sum + Math.abs(diff), 0) / differences.length
            }
        };

        return analysis;
    }

    /**
     * Generates synchronization recommendations
     * @returns {Array} Array of recommendations for each clock
     */
    generateRecommendations() {
        const analysis = this.analyzeClocks();
        
        return analysis.clocks.map(clock => {
            if (clock.difference === 0) {
                return `✅ ${clock.name}: Perfect synchronization - no adjustment needed`;
            } else if (clock.difference > 0) {
                return `⏰ ${clock.name}: Move backward by ${clock.absoluteDifference} minute${clock.absoluteDifference !== 1 ? 's' : ''}`;
            } else {
                return `⏰ ${clock.name}: Move forward by ${clock.absoluteDifference} minute${clock.absoluteDifference !== 1 ? 's' : ''}`;
            }
        });
    }

    /**
     * Displays analysis results in a formatted way
     */
    displayResults() {
        const analysis = this.analyzeClocks();
        const recommendations = this.generateRecommendations();

        console.log('🕰️  TEMPORA - CLOCK SYNCHRONIZATION SYSTEM');
        console.log('=' .repeat(50));
        console.log(`📍 Grand Clock Tower Time: ${analysis.grandClockTower}`);
        console.log('');

        console.log('📊 CLOCK ANALYSIS:');
        console.log('-'.repeat(30));
        analysis.clocks.forEach(clock => {
            const statusIcon = clock.status === 'synchronized' ? '✅' : 
                              clock.status === 'ahead' ? '⏩' : '⏪';
            const diffText = clock.difference === 0 ? 'synchronized' :
                           clock.difference > 0 ? `+${clock.difference} min` : `${clock.difference} min`;
            
            console.log(`${statusIcon} ${clock.name}: ${clock.time} (${diffText})`);
        });

        console.log('');
        console.log('📈 SUMMARY STATISTICS:');
        console.log('-'.repeat(30));
        console.log(`Total Clocks: ${analysis.summary.totalClocks}`);
        console.log(`Synchronized: ${analysis.summary.synchronized}`);
        console.log(`Running Ahead: ${analysis.summary.ahead}`);
        console.log(`Running Behind: ${analysis.summary.behind}`);
        console.log(`Max Difference: ${analysis.summary.maxDifference} minutes`);
        console.log(`Average Difference: ${analysis.summary.averageDifference.toFixed(1)} minutes`);

        console.log('');
        console.log('🔧 SYNCHRONIZATION RECOMMENDATIONS:');
        console.log('-'.repeat(30));
        recommendations.forEach(rec => console.log(rec));

        console.log('');
        console.log('📋 TIME DIFFERENCES ARRAY:');
        console.log('-'.repeat(30));
        console.log(JSON.stringify(this.calculateTimeDifferences()));

        return analysis;
    }
}

// Create and run the clock synchronization system
const clockSync = new ClockSynchronizer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClockSynchronizer };
}

// Run analysis if this file is executed directly
if (require.main === module) {
    console.log('Starting Tempora Clock Synchronization System...\n');
    clockSync.displayResults();
}
