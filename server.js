const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { ClockSynchronizer } = require('./app.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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
    const newId = Math.max(...clockSync.townClocks.map(c => c.id)) + 1;
    
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
    
    const clock = clockSync.townClocks.find(c => c.id === clockId);
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
    const clockId = parseInt(req.params.id);
    
    const clockIndex = clockSync.townClocks.findIndex(c => c.id === clockId);
    if (clockIndex === -1) {
        return res.status(404).json({ error: 'Clock not found' });
    }
    
    clockSync.townClocks.splice(clockIndex, 1);
    
    const analysis = clockSync.analyzeClocks();
    
    // Broadcast update to all connected clients
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
        
        if (name && time) {
            // Generate new ID
            const newId = clockSync.townClocks.length > 0 
                ? Math.max(...clockSync.townClocks.map(c => c.id)) + 1 
                : 1;
            
            clockSync.addClock({
                id: newId,
                name: name.includes('Clock') ? name : name + ' Clock',
                time: time
            });
            
            const analysis = clockSync.analyzeClocks();
            io.emit('clockData', analysis);
        }
    });
    
    socket.on('updateClock', (data) => {
        const { id, name, time } = data;
        
        const clock = clockSync.townClocks.find(c => c.id === id);
        if (clock && name && time) {
            clock.name = name.includes('Clock') ? name : name + ' Clock';
            clock.time = time;
            
            const analysis = clockSync.analyzeClocks();
            io.emit('clockData', analysis);
        }
    });
    
    socket.on('deleteClock', (clockId) => {
        const clockIndex = clockSync.townClocks.findIndex(c => c.id === clockId);
        if (clockIndex !== -1) {
            clockSync.townClocks.splice(clockIndex, 1);
            
            const analysis = clockSync.analyzeClocks();
            io.emit('clockData', analysis);
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

module.exports = { app, server, io };
