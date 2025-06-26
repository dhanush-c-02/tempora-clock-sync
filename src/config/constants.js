/**
 * Configuration constants for the Tempora Clock Synchronization System
 */

// Clock Status Constants
export const CLOCK_STATUS = {
    SYNCHRONIZED: 'synchronized',
    AHEAD: 'ahead',
    BEHIND: 'behind'
};

// Display Icons and Symbols
export const DISPLAY_ICONS = {
    SYNCHRONIZED: '✅',
    AHEAD: '⏩',
    BEHIND: '⏪',
    CLOCK: '🕰️',
    LOCATION: '📍',
    ANALYSIS: '📊',
    STATISTICS: '📈',
    RECOMMENDATIONS: '🔧',
    DATA: '📋'
};

// Time Format Constants
export const TIME_FORMAT = {
    HOURS_PER_DAY: 24,
    MINUTES_PER_HOUR: 60,
    SECONDS_PER_MINUTE: 60
};

// Default Configuration
export const DEFAULT_CONFIG = {
    GRAND_CLOCK_TOWER_TIME: "15:00",
    TOWN_CLOCKS: [
        { id: 1, time: "14:45", name: "Town Square Clock", location: "Main Plaza" },
        { id: 2, time: "15:05", name: "Railway Station Clock", location: "Central Station" },
        { id: 3, time: "15:00", name: "Church Bell Tower", location: "St. Mary's Cathedral" },
        { id: 4, time: "14:40", name: "Market Clock", location: "Town Market Square" }
    ]
};

// Validation Rules
export const VALIDATION_RULES = {
    TIME_REGEX: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    MAX_CLOCK_NAME_LENGTH: 50,
    MIN_CLOCK_ID: 1,
    MAX_DIFFERENCE_MINUTES: 1440 // 24 hours
};
