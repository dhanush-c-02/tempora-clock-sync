/**
 * Clock model representing individual clocks in the town
 */

import { CLOCK_STATUS, VALIDATION_RULES } from '../config/constants.js';
import { timeToMinutes, validateTimeFormat } from '../utils/timeUtils.js';

export class Clock {
    /**
     * Creates a new Clock instance
     * @param {Object} clockData - Clock configuration
     * @param {number} clockData.id - Unique identifier
     * @param {string} clockData.time - Current time (HH:MM)
     * @param {string} clockData.name - Display name
     * @param {string} [clockData.location] - Physical location
     * @param {string} [clockData.color] - Display color for UI
     */
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

    /**
     * Validates clock data
     * @param {Object} clockData - Data to validate
     * @throws {Error} If validation fails
     */
    validateClockData({ id, time, name }) {
        if (!Number.isInteger(id) || id < VALIDATION_RULES.MIN_CLOCK_ID) {
            throw new Error(`Invalid clock ID: ${id}. Must be a positive integer`);
        }

        validateTimeFormat(time);

        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Clock name must be a non-empty string');
        }

        if (name.length > VALIDATION_RULES.MAX_CLOCK_NAME_LENGTH) {
            throw new Error(`Clock name too long: ${name.length} characters. Maximum: ${VALIDATION_RULES.MAX_CLOCK_NAME_LENGTH}`);
        }
    }

    /**
     * Updates the clock's time
     * @param {string} newTime - New time (HH:MM)
     */
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

    /**
     * Calculates difference from reference time
     * @param {string} referenceTime - Reference time to compare against
     * @returns {number} Difference in minutes (positive = ahead, negative = behind)
     */
    getDifferenceFrom(referenceTime) {
        validateTimeFormat(referenceTime);
        
        const clockMinutes = timeToMinutes(this.time);
        const referenceMinutes = timeToMinutes(referenceTime);
        
        return clockMinutes - referenceMinutes;
    }

    /**
     * Determines synchronization status relative to reference time
     * @param {string} referenceTime - Reference time
     * @returns {string} Status: 'synchronized', 'ahead', or 'behind'
     */
    getStatus(referenceTime) {
        const difference = this.getDifferenceFrom(referenceTime);
        
        if (difference === 0) return CLOCK_STATUS.SYNCHRONIZED;
        if (difference > 0) return CLOCK_STATUS.AHEAD;
        return CLOCK_STATUS.BEHIND;
    }

    /**
     * Gets detailed clock information
     * @param {string} referenceTime - Reference time for comparison
     * @returns {Object} Detailed clock information
     */
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

    /**
     * Generates synchronization recommendation
     * @param {string} referenceTime - Reference time
     * @returns {string} Human-readable recommendation
     */
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

    /**
     * Returns a JSON representation of the clock
     * @returns {Object} Clock data as plain object
     */
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

    /**
     * Creates a Clock instance from JSON data
     * @param {Object} data - Clock data
     * @returns {Clock} New Clock instance
     */
    static fromJSON(data) {
        const clock = new Clock(data);
        clock.lastSyncTime = data.lastSyncTime;
        clock.syncHistory = data.syncHistory || [];
        return clock;
    }
}
