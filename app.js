/**
 * Tempora - Clock Synchronization System
 *
 * === USAGE EXAMPLES FOR ADVANCED FEATURES ===
 *
 * // 1. Custom tolerance (3 minutes)
 * const sync = new ClockSynchronizer(null, null, 3);
 *
 * // 2. Simulate drift (clock 1 +2 min, clock 2 -1 min)
 * sync.simulateDrift({1: 2, 2: -1});
 *
 * // 3. View history of all actions (drift, add, bulk, etc)
 * console.log(sync.getHistory());
 *
 * // 4. Bulk add clocks (with optional timeZone)
 * sync.addClocksBulk([
 *   {id: 10, time: '12:00', name: 'Bulk Clock 1'},
 *   {id: 11, time: '13:00', name: 'Bulk Clock 2', timeZone: 'Europe/London'}
 * ]);
 *
 * // 5. Add a clock with a custom time zone
 * sync.addClock({id: 12, time: '09:00', name: 'Tokyo Clock', timeZone: 'Asia/Tokyo'});
 *
 * // 6. Get local time for a clock (with timeZone)
 * const local = sync.getClockLocalTime(sync.townClocks[0]);
 *
 * // 7. Authenticate admin (returns true/false)
 * sync.authenticate('tempora123');
 *
 * // 8. Console notification for out-of-sync clocks (tolerance 5 min)
 * sync.notifyIfOutOfSync(5);
 *
 * // 9. Analyze and print results
 * sync.displayResults();
 *
 * ============================================
 */

class ClockSynchronizer {
    /**
     * @param {string|null} grandClockTime - Grand Clock Tower time (HH:MM) or null for current IST
     * @param {Array|null} townClocks - Array of clock objects or null for default
     * @param {number} syncTolerance - Allowed minute difference for 'synchronized' status (default: 1)
     */
    constructor(grandClockTime = null, townClocks = null, syncTolerance = 1) {
        // Use real IST time if no specific time is provided
        this.grandClockTower = grandClockTime || this.getCurrentISTTime();
        this.townClocks = townClocks || [
            { id: 1, time: "14:45", name: "Town Square Clock" },
            { id: 2, time: "15:05", name: "Railway Station Clock" },
            { id: 3, time: "15:00", name: "Church Bell Tower" },
            { id: 4, time: "14:40", name: "Market Clock" }
        ];
        this.syncTolerance = syncTolerance;
        this.history = [];
    }

    /**
     * Gets current time in IST (Indian Standard Time)
     * @returns {string} Current IST time in HH:MM format
     */
    getCurrentISTTime() {
        const now = new Date();
        
        // Get IST time using proper timezone handling
        const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
        
        // Format as HH:MM
        const hours = istTime.getHours().toString().padStart(2, '0');
        const minutes = istTime.getMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes}`;
    }

    /**
     * Gets current date and time in IST for display
     * @returns {string} Formatted date and time string
     */
    getCurrentISTDateTime() {
        const now = new Date();
        
        const options = {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        return now.toLocaleString('en-IN', options);
    }

    /**
     * Updates Grand Clock Tower to current IST time
     */
    syncToCurrentTime() {
        this.grandClockTower = this.getCurrentISTTime();
        return this.grandClockTower;
    }

    /**
     * Converts time string (HH:MM) to minutes since midnight
     * @param {string} timeString - Time in HH:MM format
     * @returns {number} Minutes since midnight
     */
    timeToMinutes(timeString) {
        if (!/^\d{2}:\d{2}$/.test(timeString)) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;
        return hours * 60 + minutes;
    }

    /**
     * Converts minutes to HH:MM format
     * @param {number} minutes - Minutes since midnight
     * @returns {string} Time in HH:MM format
     */
    minutesToTime(minutes) {
        // Wrap around 24 hours
        minutes = ((minutes % 1440) + 1440) % 1440;
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
        const SYNC_TOLERANCE = this.syncTolerance; // minutes
        const totalClocks = this.townClocks.length;
        const absDiffs = differences.map(Math.abs);
        const maxDifference = absDiffs.length ? Math.max(...absDiffs) : 0;
        const averageDifference = absDiffs.length ? absDiffs.reduce((sum, diff) => sum + diff, 0) / absDiffs.length : 0;
        const analysis = {
            grandClockTower: this.grandClockTower,
            clocks: this.townClocks.map((clock, index) => ({
                ...clock,
                difference: differences[index],
                status: Math.abs(differences[index]) <= SYNC_TOLERANCE ? 'synchronized' : 
                        differences[index] > 0 ? 'ahead' : 'behind',
                absoluteDifference: Math.abs(differences[index])
            })),
            summary: {
                totalClocks,
                synchronized: differences.filter(diff => Math.abs(diff) <= SYNC_TOLERANCE).length,
                ahead: differences.filter(diff => diff > SYNC_TOLERANCE).length,
                behind: differences.filter(diff => diff < -SYNC_TOLERANCE).length,
                maxDifference,
                averageDifference
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
        try {
            const analysis = this.analyzeClocks();
            const recommendations = this.generateRecommendations();
            const currentDateTime = this.getCurrentISTDateTime();

            console.log('🕰️  TEMPORA - CLOCK SYNCHRONIZATION SYSTEM');
            console.log('=' .repeat(50));
            console.log(`🌍 Current IST Date & Time: ${currentDateTime}`);
            console.log(`📍 Grand Clock Tower Time: ${analysis.grandClockTower} IST`);
            console.log('');

            console.log('📊 CLOCK ANALYSIS:');
            console.log('-'.repeat(30));
            analysis.clocks.forEach(clock => {
                try {
                    const statusIcon = clock.status === 'synchronized' ? '✅' : 
                                      clock.status === 'ahead' ? '⏩' : '⏪';
                    const diffText = clock.difference === 0 ? 'synchronized' :
                                   clock.difference > 0 ? `+${clock.difference} min` : `${clock.difference} min`;
                    console.log(`${statusIcon} ${clock.name}: ${clock.time} (${diffText})`);
                } catch (e) {
                    console.log('⚠️ Error displaying clock:', clock, e);
                }
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
        } catch (e) {
            console.log('❌ Error displaying results:', e);
        }
        return this.analyzeClocks();
    }

    /**
     * Updates the Grand Clock Tower reference time
     * @param {string} newTime - New reference time in HH:MM format
     */
    setGrandClockTime(newTime) {
        this.grandClockTower = newTime;
    }

    /**
     * Updates a specific clock's time
     * @param {number} clockId - ID of the clock to update
     * @param {string} newTime - New time in HH:MM format
     */
    updateClockTime(clockId, newTime) {
        const clock = this.townClocks.find(c => c.id === clockId);
        if (clock) {
            clock.time = newTime;
            return true;
        }
        return false;
    }

    /**
     * Simulates drift for all clocks (in minutes)
     * @param {Object} driftMap - {clockId: driftMinutes}
     */
    simulateDrift(driftMap) {
        this.townClocks.forEach(clock => {
            if (driftMap[clock.id]) {
                const mins = this.timeToMinutes(clock.time) + driftMap[clock.id];
                clock.time = this.minutesToTime(mins);
            }
        });
        this._addHistory('drift', { driftMap });
    }

    /**
     * Adds a history entry
     * @param {string} type - Event type
     * @param {Object} data - Event data
     */
    _addHistory(type, data) {
        if (!this.history) this.history = [];
        this.history.push({
            timestamp: new Date().toISOString(),
            type,
            data
        });
    }

    /**
     * Returns the history array
     */
    getHistory() {
        return this.history || [];
    }

    /**
     * Adds clocks in bulk (array of objects)
     */
    addClocksBulk(clocksArray) {
        clocksArray.forEach(clock => this.addClock(clock));
        this._addHistory('bulkAdd', { clocks: clocksArray });
    }

    /**
     * Adds a new clock with time zone support
     * @param {Object} clockData - {id, time, name, timeZone}
     */
    addClock(clockData) {
        // Default to IST if no timeZone
        if (!clockData.timeZone) clockData.timeZone = 'Asia/Kolkata';
        this.townClocks.push(clockData);
        this._addHistory('add', { clock: clockData });
    }

    /**
     * Get local time for a clock (with timeZone)
     * @param {Object} clock
     */
    getClockLocalTime(clock) {
        if (!clock.timeZone) return clock.time;
        // Parse clock.time as HH:MM in its timeZone, return IST equivalent
        const [h, m] = clock.time.split(':').map(Number);
        const now = new Date();
        now.setHours(h, m, 0, 0);
        const local = now.toLocaleString('en-US', { timeZone: clock.timeZone });
        const localDate = new Date(local);
        return `${localDate.getHours().toString().padStart(2, '0')}:${localDate.getMinutes().toString().padStart(2, '0')}`;
    }

    /**
     * Simple admin authentication (console password)
     */
    authenticate(password) {
        const ADMIN_PASS = process.env.ADMIN_PASS || 'tempora123';
        return password === ADMIN_PASS;
    }

    /**
     * Console notification if any clock is out of sync by more than alertTolerance
     */
    notifyIfOutOfSync(alertTolerance = 5) {
        const analysis = this.analyzeClocks();
        analysis.clocks.forEach(clock => {
            if (clock.absoluteDifference > alertTolerance) {
                console.log(`⚠️ ALERT: ${clock.name} is out of sync by ${clock.absoluteDifference} minutes!`);
            }
        });
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
