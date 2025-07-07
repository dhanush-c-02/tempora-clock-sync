// utils/validation.js
// Helper functions for input validation and error responses

/**
 * Parse and validate a clock ID from a string or number
 * @param {string|number} id
 * @returns {number}
 * @throws {Error} if invalid
 */
import { ERRORS } from '../constants.js';

export function parseClockId(id) {
    const num = Number(id);
    if (isNaN(num) || !Number.isInteger(num) || num < 1) {
        throw new Error(ERRORS.INVALID_CLOCK_ID);
    }
    return num;
}

/**
 * Validate required fields for a clock
 * @param {object} body
 * @returns {string|null} error message or null
 */
export function validateClockFields(body) {
    if (!body.name || !body.time) {
        return ERRORS.NAME_TIME_REQUIRED;
    }
    return null;
}
