# 🎯 How to Provide Inputs to Tempora Clock Synchronization System

This guide shows you all the different ways to provide custom inputs to the clock synchronization system.

## 📝 **Method 1: Direct Code Editing**

Edit the `app.js` file directly to change default values:

```javascript
// In the constructor, change these values:
this.grandClockTower = "16:30"; // Your desired reference time
this.townClocks = [
    { id: 1, time: "16:25", name: "Your Custom Clock 1" },
    { id: 2, time: "16:35", name: "Your Custom Clock 2" },
    // Add more clocks as needed
];
```

## 🔧 **Method 2: Constructor Parameters**

Use the updated constructor with parameters:

```javascript
const { ClockSynchronizer } = require('./app.js');

// Custom Grand Clock time and town clocks
const clockSync = new ClockSynchronizer("16:30", [
    { id: 1, time: "16:25", name: "Library Clock" },
    { id: 2, time: "16:35", name: "Café Clock" },
    { id: 3, time: "16:30", name: "Office Clock" }
]);

clockSync.displayResults();
```

## ⚡ **Method 3: Dynamic Updates**

Update inputs after creating the object:

```javascript
const clockSync = new ClockSynchronizer();

// Change Grand Clock Tower time
clockSync.setGrandClockTime("17:00");

// Update individual clock times
clockSync.updateClockTime(1, "16:55"); // Update clock with ID 1

// Add new clocks
clockSync.addClock({ id: 5, time: "17:05", name: "New Clock" });

// Replace all town clocks
clockSync.setTownClocks([
    { id: 1, time: "17:00", name: "Clock A" },
    { id: 2, time: "17:10", name: "Clock B" }
]);

clockSync.displayResults();
```

## 📁 **Method 4: JSON Configuration File**

Create a `config.json` file with your data:

```json
{
  "grandClockTower": "16:15",
  "townClocks": [
    { "id": 1, "time": "16:10", "name": "Central Library Clock" },
    { "id": 2, "time": "16:20", "name": "Train Station Clock" },
    { "id": 3, "time": "16:15", "name": "City Hall Clock" }
  ]
}
```

Then run:
```bash
npm run config
```

## 💻 **Method 5: Command Line Arguments**

Pass arguments when running the script:

```bash
# Set Grand Clock time
node interactive-input.js --grand-clock 18:00

# Add custom clocks
node interactive-input.js --grand-clock 18:00 --add-clock 17:55 "Custom Clock 1" --add-clock 18:05 "Custom Clock 2"
```

## 🎮 **Method 6: Interactive Mode**

Enable interactive mode by editing `interactive-input.js` and uncommenting the last line:

```javascript
// Uncomment this line in interactive-input.js:
startInteractiveMode();
```

Then run and use commands:
```bash
node interactive-input.js

# Commands available:
> set-grand 16:30
> add-clock 16:25 "Library Clock"
> update-clock 1 16:30
> analyze
> show
> exit
```

## 🚀 **Quick Examples**

### Example 1: Simple Custom Time
```javascript
const { ClockSynchronizer } = require('./app.js');
const sync = new ClockSynchronizer("14:30");
sync.displayResults();
```

### Example 2: Completely Custom Setup
```javascript
const { ClockSynchronizer } = require('./app.js');

const sync = new ClockSynchronizer("12:00", [
    { id: 1, time: "11:55", name: "Morning Clock" },
    { id: 2, time: "12:05", name: "Noon Clock" },
    { id: 3, time: "12:00", name: "Perfect Clock" }
]);

sync.displayResults();
```

### Example 3: Dynamic Scenario
```javascript
const { ClockSynchronizer } = require('./app.js');

const sync = new ClockSynchronizer();
sync.setGrandClockTime("20:00");
sync.addClock({ id: 5, time: "19:58", name: "Evening Clock" });
sync.addClock({ id: 6, time: "20:02", name: "Night Clock" });
sync.displayResults();
```

## 📊 **Available Commands**

```bash
# Run with default values
node app.js

# Run interactive examples
npm run interactive

# Run with JSON config
npm run config

# Run command line version
node interactive-input.js --grand-clock 15:30 --add-clock 15:25 "Custom"

# Start web interface
npm start  # Then visit http://localhost:3000
```

## 📋 **Input Format Rules**

- **Time Format**: Always use 24-hour format "HH:MM" (e.g., "15:30", "09:00")
- **Clock ID**: Must be a positive integer (1, 2, 3, etc.)
- **Clock Name**: Any string, use quotes if it contains spaces
- **Valid Time Range**: 00:00 to 23:59

## ❗ **Common Issues & Solutions**

### Issue: "Invalid time format"
**Solution**: Make sure you use HH:MM format with leading zeros
```javascript
✅ Correct: "09:30", "15:00", "23:59"
❌ Wrong: "9:30", "15", "25:00"
```

### Issue: Clock not updating
**Solution**: Use the correct clock ID
```javascript
// Check existing clock IDs first
console.log(clockSync.townClocks.map(c => c.id));
// Then update with correct ID
clockSync.updateClockTime(1, "16:30");
```

### Issue: Adding duplicate IDs
**Solution**: Use unique IDs for each clock
```javascript
// Get next available ID
const nextId = Math.max(...clockSync.townClocks.map(c => c.id)) + 1;
clockSync.addClock({ id: nextId, time: "16:30", name: "New Clock" });
```

---

Choose the method that works best for your needs! 🕰️✨
