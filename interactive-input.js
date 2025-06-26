/**
 * Interactive Input Examples for Tempora Clock Synchronization System
 * 
 * This file demonstrates various ways to provide inputs to the system
 */

const { ClockSynchronizer } = require('./app.js');

console.log('🕰️ TEMPORA - INTERACTIVE INPUT EXAMPLES\n');

// Example 1: Create with custom inputs via constructor
console.log('📝 Example 1: Custom Constructor Inputs');
console.log('=' .repeat(50));

const customSync = new ClockSynchronizer("16:30", [
    { id: 1, time: "16:25", name: "Library Clock" },
    { id: 2, time: "16:35", name: "Café Clock" },
    { id: 3, time: "16:30", name: "Office Clock" }
]);

console.log('Custom configuration created:');
console.log(`Grand Clock Tower: ${customSync.grandClockTower}`);
console.log(`Town Clocks: ${customSync.townClocks.length} clocks`);
customSync.displayResults();

// Example 2: Update inputs dynamically
console.log('\n📝 Example 2: Dynamic Input Updates');
console.log('=' .repeat(50));

const dynamicSync = new ClockSynchronizer();

// Update Grand Clock Tower time
dynamicSync.setGrandClockTime("17:00");
console.log(`Updated Grand Clock Tower to: ${dynamicSync.grandClockTower}`);

// Update individual clock times
dynamicSync.updateClockTime(1, "16:50");
dynamicSync.updateClockTime(2, "17:10");
console.log('Updated individual clock times');

// Add a new clock
dynamicSync.addClock({ id: 5, time: "17:05", name: "New Shopping Mall Clock" });
console.log('Added new clock to the system');

dynamicSync.displayResults();

// Example 3: Command line arguments (if provided)
console.log('\n📝 Example 3: Command Line Arguments');
console.log('=' .repeat(50));

function parseCommandLineArgs() {
    const args = process.argv.slice(2);
    let grandClockTime = "15:00";
    let clockTimes = [];

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--grand-clock' && args[i + 1]) {
            grandClockTime = args[i + 1];
            i++; // skip next argument
        } else if (args[i] === '--add-clock' && args[i + 1] && args[i + 2]) {
            clockTimes.push({
                id: clockTimes.length + 1,
                time: args[i + 1],
                name: args[i + 2]
            });
            i += 2; // skip next two arguments
        }
    }

    return { grandClockTime, clockTimes };
}

const { grandClockTime, clockTimes } = parseCommandLineArgs();

if (process.argv.length > 2) {
    console.log('Using command line arguments:');
    console.log(`Grand Clock Time: ${grandClockTime}`);
    console.log(`Additional Clocks: ${clockTimes.length}`);
    
    const clSync = new ClockSynchronizer(grandClockTime);
    clockTimes.forEach(clock => clSync.addClock(clock));
    clSync.displayResults();
} else {
    console.log('No command line arguments provided.');
    console.log('Usage examples:');
    console.log('  node interactive-input.js --grand-clock 16:00');
    console.log('  node interactive-input.js --grand-clock 16:00 --add-clock 15:55 "Custom Clock"');
}

// Example 4: Interactive prompt (using readline)
console.log('\n📝 Example 4: Interactive Prompt Demo');
console.log('=' .repeat(50));

const readline = require('readline');

function startInteractiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const interactiveSync = new ClockSynchronizer();

    console.log('\n🎮 INTERACTIVE MODE STARTED');
    console.log('Commands:');
    console.log('  set-grand <time>     - Set Grand Clock Tower time (e.g., set-grand 16:30)');
    console.log('  add-clock <time> <name> - Add new clock (e.g., add-clock 16:25 "New Clock")');
    console.log('  update-clock <id> <time> - Update clock time (e.g., update-clock 1 16:30)');
    console.log('  analyze              - Run analysis and show results');
    console.log('  show                 - Show current configuration');
    console.log('  exit                 - Exit interactive mode');
    console.log('');

    function promptUser() {
        rl.question('> ', (input) => {
            const parts = input.trim().split(' ');
            const command = parts[0];

            try {
                switch (command) {
                    case 'set-grand':
                        if (parts[1]) {
                            interactiveSync.setGrandClockTime(parts[1]);
                            console.log(`✅ Grand Clock Tower time set to: ${parts[1]}`);
                        } else {
                            console.log('❌ Please provide a time (e.g., set-grand 16:30)');
                        }
                        break;

                    case 'add-clock':
                        if (parts[1] && parts[2]) {
                            const newId = interactiveSync.townClocks.length + 1;
                            const clockName = parts.slice(2).join(' ');
                            interactiveSync.addClock({ id: newId, time: parts[1], name: clockName });
                            console.log(`✅ Added clock: ${clockName} at ${parts[1]}`);
                        } else {
                            console.log('❌ Please provide time and name (e.g., add-clock 16:25 "New Clock")');
                        }
                        break;

                    case 'update-clock':
                        if (parts[1] && parts[2]) {
                            const updated = interactiveSync.updateClockTime(parseInt(parts[1]), parts[2]);
                            if (updated) {
                                console.log(`✅ Updated clock ${parts[1]} to ${parts[2]}`);
                            } else {
                                console.log(`❌ Clock with ID ${parts[1]} not found`);
                            }
                        } else {
                            console.log('❌ Please provide clock ID and new time (e.g., update-clock 1 16:30)');
                        }
                        break;

                    case 'analyze':
                        console.log('\n📊 ANALYSIS RESULTS:');
                        interactiveSync.displayResults();
                        break;

                    case 'show':
                        console.log('\n📋 CURRENT CONFIGURATION:');
                        console.log(`Grand Clock Tower: ${interactiveSync.grandClockTower}`);
                        console.log('Town Clocks:');
                        interactiveSync.townClocks.forEach(clock => {
                            console.log(`  ${clock.id}: ${clock.name} - ${clock.time}`);
                        });
                        break;

                    case 'exit':
                        console.log('👋 Goodbye!');
                        rl.close();
                        return;

                    default:
                        console.log('❓ Unknown command. Type one of: set-grand, add-clock, update-clock, analyze, show, exit');
                        break;
                }
            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }

            console.log('');
            promptUser();
        });
    }

    promptUser();
}

// Uncomment the line below to start interactive mode
// startInteractiveMode();

console.log('\n💡 To start interactive mode, uncomment the last line in this file and run it again.');
