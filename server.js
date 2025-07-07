import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClockSynchronizer } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Create a global clock synchronizer instance
let clockSync = new ClockSynchronizer();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/clocks', (req, res) => {
    const analysis = clockSync.analyzeClocks();
    res.json(analysis);
});

app.post('/api/sync', (req, res) => {
    clockSync.syncToCurrentTime();
    const analysis = clockSync.analyzeClocks();
    
    // Broadcast update to all connected clients
    io.emit('clockData', analysis);
    
    res.json({ success: true, analysis });
});

app.post('/api/clocks', (req, res) => {
    const { name, time } = req.body;
    
    if (!name || !time) {
        return res.status(400).json({ error: 'Name and time are required' });
    }
    
    // Generate new ID
    const newId = clockSync.clocks.length > 0 ? Math.max(...clockSync.clocks.map(c => c.id)) + 1 : 1;
    
    clockSync.addClock({
        id: newId,
        name: name.includes('Clock') ? name : name + ' Clock',
        time: time
    });
    
    const analysis = clockSync.analyzeClocks();
    
    // Broadcast update to all connected clients
    io.emit('clockData', analysis);
    
    res.json({ success: true, analysis });
});

app.put('/api/clocks/:id', (req, res) => {
    const clockId = parseInt(req.params.id);
    const { name, time } = req.body;
    
    if (!name || !time) {
        return res.status(400).json({ error: 'Name and time are required' });
    }
    
    const clock = clockSync.clocks.find(c => c.id === clockId);
    if (!clock) {
        return res.status(404).json({ error: 'Clock not found' });
    }
    
    clock.name = name.includes('Clock') ? name : name + ' Clock';
    clock.time = time;
    
    const analysis = clockSync.analyzeClocks();
    
    // Broadcast update to all connected clients
    io.emit('clockData', analysis);
    
    res.json({ success: true, analysis });
});

app.delete('/api/clocks/:id', (req, res) => {
    const clockId = Number(req.params.id);
    if (isNaN(clockId)) {
        return res.status(400).json({ error: 'Invalid clock ID' });
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
    io.emit('clockData', analysis);
    res.json({ success: true, analysis });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Send initial data to the newly connected client
    const analysis = clockSync.analyzeClocks();
    socket.emit('clockData', analysis);
    
    // Handle real-time events
    socket.on('getClockData', () => {
        const analysis = clockSync.analyzeClocks();
        socket.emit('clockData', analysis);
    });
    
    socket.on('syncToIST', () => {
        clockSync.syncToCurrentTime();
        const analysis = clockSync.analyzeClocks();
        io.emit('clockData', analysis);
    });
    
    socket.on('addClock', (data) => {
        const { name, time } = data;
        if (!name || !time) {
            socket.emit('addClockResult', { success: false, error: 'Name and time are required.' });
            return;
        }
        // Generate new ID
        let newId = 1;
        if (clockSync.clocks.length > 0) {
            // Avoid duplicate IDs
            const ids = clockSync.clocks.map(c => c.id);
            newId = Math.max(...ids) + 1;
        }
        try {
            const newClock = clockSync.addClock({
                id: newId,
                name: name.includes('Clock') ? name : name + ' Clock',
                time: time
            });
            const analysis = clockSync.analyzeClocks();
            io.emit('clockData', analysis);
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
            
            const analysis = clockSync.analyzeClocks();
            io.emit('clockData', analysis);
        }
    });
    
    socket.on('deleteClock', (clockId) => {
        // Ensure clockId is a number for comparison
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
            const analysis = clockSync.analyzeClocks();
            io.emit('clockData', analysis);
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
            formatted: istTime.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata'
            })
        });
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`🕰️  Tempora Server running on http://localhost:${PORT}`);
    console.log(`📍 Grand Clock Tower Time: ${clockSync.grandClockTower} IST`);
    console.log(`🌐 Open your browser and navigate to the URL above to see the interactive UI`);
});

// Periodically sync the Grand Clock Tower to current IST time
setInterval(() => {
    const oldTime = clockSync.grandClockTower;
    clockSync.syncToCurrentTime();
    
    // Only emit if time changed
    if (oldTime !== clockSync.grandClockTower) {
        const analysis = clockSync.analyzeClocks();
        io.emit('clockData', analysis);
    }
}, 60000); // Update every minute

export { app, server, io };
