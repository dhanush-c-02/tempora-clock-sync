import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { logInfo, logWarn, logError } from './utils/logger.js';
import {
  getClocks,
  addClock,
  updateClock,
  deleteClock,
  syncToCurrentTime,
  clockSync
} from './routes/clocks.js';
import { registerClockSocketHandlers } from './sockets/clocks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// clockSync is imported from routes/clocks.js

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// API Routes (modularized)
app.get('/api/clocks', (req, res) => {
  getClocks(req, res);
});
app.post('/api/clocks', (req, res) => {
  addClock(req, res);
  // Broadcast update to all connected clients
  const analysis = clockSync.analyzeClocks();
  io.emit('clockData', analysis);
});
app.put('/api/clocks/:id', (req, res) => {
  updateClock(req, res);
  const analysis = clockSync.analyzeClocks();
  io.emit('clockData', analysis);
});
app.delete('/api/clocks/:id', (req, res) => {
  deleteClock(req, res);
  const analysis = clockSync.analyzeClocks();
  io.emit('clockData', analysis);
});
app.post('/api/sync', (req, res) => {
  syncToCurrentTime(req, res);
  const analysis = clockSync.analyzeClocks();
  io.emit('clockData', analysis);
});


// Register modularized Socket.IO handlers
registerClockSocketHandlers(io);

// Start the server
server.listen(PORT, () => {
    logInfo(`🕰️  Tempora Server running on http://localhost:${PORT}`);
    logInfo(`📍 Grand Clock Tower Time: ${clockSync.grandClockTower} IST`);
    logInfo(`🌐 Open your browser and navigate to the URL above to see the interactive UI`);
});

// Periodically sync the Grand Clock Tower to current IST time
setInterval(() => {
    const oldTime = clockSync.grandClockTower;
    clockSync.syncToCurrentTime();
    // Only emit if time changed
    if (oldTime !== clockSync.grandClockTower) {
        const analysis = clockSync.analyzeClocks();
        io.emit('clockData', analysis);
        logInfo('Grand Clock Tower auto-synced to current IST:', clockSync.grandClockTower);
    }
}, 60000); // Update every minute
// Express error-handling middleware (last in the stack)
app.use((err, req, res, next) => {
  logError('Express error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export { app, server, io };
