/**
 * Time utility functions for clock operations
 */

import { TIME_FORMAT, VALIDATION_RULES } from '../config/constants.js';

/**
 * Custom error class for time-related errors
 */
export class TimeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeError';
    }
}

/**
 * Validates time string format (HH:MM)
 * @param {string} timeString - Time string to validate
 * @throws {TimeError} If time format is invalid
 */
export function validateTimeFormat(timeString) {
    if (typeof timeString !== 'string') {
        throw new TimeError('Time must be a string');
    }
    
    if (!VALIDATION_RULES.TIME_REGEX.test(timeString)) {
        throw new TimeError(`Invalid time format: ${timeString}. Expected format: HH:MM`);
    }
}

/**
 * Converts time string (HH:MM) to minutes since midnight
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} Minutes since midnight
 * @throws {TimeError} If time format is invalid
 */
export function timeToMinutes(timeString) {
    validateTimeFormat(timeString);
    
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (hours < 0 || hours >= TIME_FORMAT.HOURS_PER_DAY) {
        throw new TimeError(`Invalid hours: ${hours}. Must be 0-23`);
    }
    
    if (minutes < 0 || minutes >= TIME_FORMAT.MINUTES_PER_HOUR) {
        throw new TimeError(`Invalid minutes: ${minutes}. Must be 0-59`);
    }
    
    return hours * TIME_FORMAT.MINUTES_PER_HOUR + minutes;
}

/**
 * Converts minutes since midnight to HH:MM format
 * @param {number} totalMinutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 * @throws {TimeError} If minutes value is invalid
 */
export function minutesToTime(totalMinutes) {
    if (typeof totalMinutes !== 'number' || totalMinutes < 0) {
        throw new TimeError(`Invalid minutes value: ${totalMinutes}. Must be a non-negative number`);
    }
    
    // Handle values greater than 24 hours by wrapping around
    const normalizedMinutes = totalMinutes % (TIME_FORMAT.HOURS_PER_DAY * TIME_FORMAT.MINUTES_PER_HOUR);
    
    const hours = Math.floor(normalizedMinutes / TIME_FORMAT.MINUTES_PER_HOUR);
    const minutes = normalizedMinutes % TIME_FORMAT.MINUTES_PER_HOUR;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Calculates the absolute difference between two times in minutes
 * @param {string} time1 - First time (HH:MM)
 * @param {string} time2 - Second time (HH:MM)
 * @returns {number} Absolute difference in minutes
 */
export function getTimeDifference(time1, time2) {
    const minutes1 = timeToMinutes(time1);
    const minutes2 = timeToMinutes(time2);
    return Math.abs(minutes1 - minutes2);
}

/**
 * Formats a time difference for display
 * @param {number} difference - Time difference in minutes
 * @returns {string} Formatted difference string
 */
export function formatTimeDifference(difference) {
    if (difference === 0) {
        return 'synchronized';
    }
    
    const sign = difference > 0 ? '+' : '';
    const plural = Math.abs(difference) !== 1 ? 's' : '';
    
    return `${sign}${difference} min${plural === 's' ? 'ute' + plural : 'ute'}`;
}

/**
 * Adds minutes to a time string
 * @param {string} timeString - Original time (HH:MM)
 * @param {number} minutesToAdd - Minutes to add (can be negative)
 * @returns {string} New time (HH:MM)
 */
export function addMinutesToTime(timeString, minutesToAdd) {
    const totalMinutes = timeToMinutes(timeString) + minutesToAdd;
    return minutesToTime(totalMinutes);
}
