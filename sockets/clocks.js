// sockets/clocks.js
// Socket.IO event handlers for clock operations
import { clockSync } from '../routes/clocks.js';
import { logInfo, logWarn, logError } from '../utils/logger.js';

/**
 * Register all clock-related socket events
 * @param {import('socket.io').Server} io
 */
export function registerClockSocketHandlers(io) {
  io.on('connection', (socket) => {
    logInfo('New client connected:', socket.id);
    // Send initial data
    socket.emit('clockData', clockSync.analyzeClocks());

    socket.on('getClockData', () => {
      socket.emit('clockData', clockSync.analyzeClocks());
    });

    socket.on('syncToIST', () => {
      clockSync.syncToCurrentTime();
      io.emit('clockData', clockSync.analyzeClocks());
    });

    socket.on('addClock', (data) => {
      const { name, time } = data;
      if (!name || !time) {
        socket.emit('addClockResult', { success: false, error: 'Name and time are required.' });
        return;
      }
      let newId = 1;
      if (clockSync.clocks.length > 0) {
        const ids = clockSync.clocks.map(c => c.id);
        newId = Math.max(...ids) + 1;
      }
      try {
        const newClock = clockSync.addClock({
          id: newId,
          name: name.includes('Clock') ? name : name + ' Clock',
          time: time
        });
        io.emit('clockData', clockSync.analyzeClocks());
        socket.emit('addClockResult', { success: true, clock: newClock });
      } catch (err) {
        socket.emit('addClockResult', { success: false, error: err.message });
      }
    });

    socket.on('updateClock', (data) => {
      const { id, name, time } = data;
      const clock = clockSync.clocks.find(c => c.id === id);
      if (clock && name && time) {
        clock.name = name.includes('Clock') ? name : name + ' Clock';
        clock.time = time;
        io.emit('clockData', clockSync.analyzeClocks());
      }
    });

    socket.on('deleteClock', (clockId) => {
      const id = Number(clockId);
      if (isNaN(id)) {
        socket.emit('deleteClockResult', { success: false, error: 'Invalid clock ID', id: clockId });
        return;
      }
      const result = clockSync.deleteClock ? clockSync.deleteClock(id) : (function() {
        const idx = clockSync.clocks.findIndex(c => c.id === id);
        if (idx !== -1) {
          clockSync.clocks.splice(idx, 1);
          return { success: true, id };
        } else {
          return { success: false, error: 'Clock not found', id };
        }
      })();
      if (result.success) {
        io.emit('clockData', clockSync.analyzeClocks());
        socket.emit('deleteClockResult', { success: true, id });
      } else {
        socket.emit('deleteClockResult', { success: false, error: result.error, id });
      }
    });

    socket.on('getCurrentTime', () => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      socket.emit('timeUpdate', {
        ist: istTime.toISOString(),
        formatted: istTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });
    });

    socket.on('disconnect', () => {
      logInfo('Client disconnected:', socket.id);
    });
  });
}
