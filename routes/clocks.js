// routes/clocks.js
// REST API handlers for clock operations

import { parseClockId, validateClockFields } from '../utils/validation.js';
import { ClockSynchronizer } from '../app.js';

const clockSync = new ClockSynchronizer();

/**
 * Get analysis of all clocks
 */
export function getClocks(req, res) {
    const analysis = clockSync.analyzeClocks();
    res.json(analysis);
}

/**
 * Add a new clock
 */
export function addClock(req, res) {
    const error = validateClockFields(req.body);
    if (error) return res.status(400).json({ error });
    const { name, time } = req.body;
    const newId = clockSync.clocks.length > 0 ? Math.max(...clockSync.clocks.map(c => c.id)) + 1 : 1;
    try {
        clockSync.addClock({
            id: newId,
            name: name.includes('Clock') ? name : name + ' Clock',
            time: time
        });
        const analysis = clockSync.analyzeClocks();
        res.json({ success: true, analysis });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

/**
 * Update a clock
 */
export function updateClock(req, res) {
    let clockId;
    try {
        clockId = parseClockId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
    const error = validateClockFields(req.body);
    if (error) return res.status(400).json({ error });
    const { name, time } = req.body;
    const clock = clockSync.clocks.find(c => c.id === clockId);
    if (!clock) {
        return res.status(404).json({ error: 'Clock not found' });
    }
    clock.name = name.includes('Clock') ? name : name + ' Clock';
    clock.time = time;
    const analysis = clockSync.analyzeClocks();
    res.json({ success: true, analysis });
}

/**
 * Delete a clock
 */
export function deleteClock(req, res) {
    let clockId;
    try {
        clockId = parseClockId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
    const result = clockSync.deleteClock ? clockSync.deleteClock(clockId) : (function() {
        const idx = clockSync.clocks.findIndex(c => c.id === clockId);
        if (idx !== -1) {
            clockSync.clocks.splice(idx, 1);
            return { success: true, id: clockId };
        } else {
            return { success: false, error: 'Clock not found', id: clockId };
        }
    })();
    if (!result.success) {
        return res.status(404).json({ error: 'Clock not found', id: clockId });
    }
    const analysis = clockSync.analyzeClocks();
    res.json({ success: true, analysis });
}

/**
 * Sync Grand Clock Tower to current time
 */
export function syncToCurrentTime(req, res) {
    clockSync.syncToCurrentTime();
    const analysis = clockSync.analyzeClocks();
    res.json({ success: true, analysis });
}

export { clockSync }; // for use in server.js and sockets
