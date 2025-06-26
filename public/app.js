class TemporaUI {
    constructor() {
        this.socket = io();
        this.clockSync = null;
        this.charts = {};
        this.currentEditingClock = null;
        
        this.initializeEventListeners();
        this.startRealTimeClock();
        
        // Wait for DOM and Chart.js to be ready
        this.initializeChartsWhenReady();
        this.loadInitialData();
    }

    async initializeChartsWhenReady() {
        // Wait for Chart.js to be available
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds
        
        while (typeof Chart === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof Chart === 'undefined') {
            console.error('Chart.js failed to load after 5 seconds');
            return;
        }
        
        // Wait a bit more for DOM to be fully ready
        setTimeout(() => this.initializeCharts(), 200);
    }

    initializeEventListeners() {
        // Socket events
        this.socket.on('clockData', (data) => {
            this.updateUI(data);
        });

        this.socket.on('timeUpdate', (data) => {
            this.updateCurrentTime(data);
        });

        // UI Events
        document.getElementById('syncButton').addEventListener('click', () => {
            this.syncToIST();
        });

        document.getElementById('addClockBtn').addEventListener('click', () => {
            this.showAddClockModal();
        });

        // Modal events
        this.setupModalEvents();
    }

    setupModalEvents() {
        // Add Clock Modal
        const addModal = document.getElementById('addClockModal');
        const editModal = document.getElementById('editClockModal');
        
        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });

        // Cancel buttons
        document.getElementById('cancelAdd').addEventListener('click', () => {
            this.hideModal(addModal);
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.hideModal(editModal);
        });

        // Confirm buttons
        document.getElementById('confirmAdd').addEventListener('click', () => {
            this.addNewClock();
        });

        document.getElementById('confirmEdit').addEventListener('click', () => {
            this.updateClock();
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });
    }

    startRealTimeClock() {
        this.updateCurrentTime();
        setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }

    updateCurrentTime() {
        const now = new Date();
        
        const timeString = now.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: false
        });
        
        const dateString = now.toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.getElementById('currentTime').textContent = timeString;
        document.getElementById('currentDate').textContent = dateString;

        // Emit current time to server
        this.socket.emit('getCurrentTime');
    }

    loadInitialData() {
        this.socket.emit('getClockData');
        
        // Also fetch data via HTTP as fallback
        fetch('/api/clocks')
            .then(response => response.json())
            .then(data => {
                this.updateUI(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    syncToIST() {
        const button = document.getElementById('syncButton');
        const icon = button.querySelector('i');
        
        button.disabled = true;
        icon.style.animation = 'spin 1s linear infinite';
        
        this.socket.emit('syncToIST');
        
        setTimeout(() => {
            button.disabled = false;
            icon.style.animation = 'rotate 20s linear infinite';
        }, 1000);
    }

    updateUI(data) {
        this.lastData = data; // Store for chart initialization
        this.updateGrandClock(data.grandClockTower);
        this.updateStatistics(data.summary);
        this.updateClocksGrid(data.clocks);
        this.updateCharts(data);
        this.updateSimpleDifferences(data.clocks);
    }

    updateGrandClock(time) {
        document.getElementById('grandClockTime').textContent = time;
        this.updateAnalogClock(time);
    }

    updateAnalogClock(time) {
        const [hours, minutes] = time.split(':').map(Number);
        
        const hourHand = document.querySelector('.hour-hand');
        const minuteHand = document.querySelector('.minute-hand');
        
        const hourAngle = ((hours % 12) * 30) + (minutes * 0.5);
        const minuteAngle = minutes * 6;
        
        hourHand.style.transform = `rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    }

    updateStatistics(summary) {
        const syncedElement = document.getElementById('syncedCount');
        const aheadElement = document.getElementById('aheadCount');
        const behindElement = document.getElementById('behindCount');
        const maxDiffElement = document.getElementById('maxDifference');
        
        if (syncedElement) syncedElement.textContent = summary.synchronized;
        if (aheadElement) aheadElement.textContent = summary.ahead;
        if (behindElement) behindElement.textContent = summary.behind;
        if (maxDiffElement) maxDiffElement.textContent = summary.maxDifference;
    }

    updateClocksGrid(clocks) {
        const grid = document.getElementById('clocksGrid');
        grid.innerHTML = '';

        clocks.forEach(clock => {
            const clockCard = this.createClockCard(clock);
            grid.appendChild(clockCard);
        });
    }

    createClockCard(clock) {
        const card = document.createElement('div');
        card.className = 'clock-card';
        card.innerHTML = `
            <div class="clock-header">
                <div class="clock-name">
                    <i class="fas fa-clock"></i>
                    ${clock.name}
                </div>
                <div class="clock-actions">
                    <button class="clock-btn edit-btn" data-id="${clock.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="clock-btn delete-btn" data-id="${clock.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="clock-content">
                <div class="clock-time">${clock.time}</div>
                <div class="clock-status status-${clock.status}">
                    <i class="fas ${this.getStatusIcon(clock.status)}"></i>
                    ${this.getStatusText(clock)}
                    ${clock.difference !== 0 ? `<span class="difference-badge">${clock.difference > 0 ? '+' : ''}${clock.difference}m</span>` : ''}
                </div>
            </div>
        `;

        // Add event listeners
        card.querySelector('.edit-btn').addEventListener('click', () => {
            this.editClock(clock);
        });

        card.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteClock(clock.id);
        });

        return card;
    }

    getStatusIcon(status) {
        switch (status) {
            case 'synchronized': return 'fa-check-circle';
            case 'ahead': return 'fa-fast-forward';
            case 'behind': return 'fa-backward';
            default: return 'fa-clock';
        }
    }

    getStatusText(clock) {
        switch (clock.status) {
            case 'synchronized': return 'Synchronized';
            case 'ahead': return `${clock.absoluteDifference}m ahead`;
            case 'behind': return `${clock.absoluteDifference}m behind`;
            default: return 'Unknown';
        }
    }

    initializeCharts() {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded!');
            document.getElementById('chartStatus').textContent = 'Chart.js not loaded';
            document.getElementById('statusChartStatus').textContent = 'Chart.js not loaded';
            return;
        }
        
        document.getElementById('chartStatus').textContent = 'Initializing...';
        document.getElementById('statusChartStatus').textContent = 'Initializing...';
        
        try {
            // Time Differences Chart
            const differencesCtx = document.getElementById('differencesChart');
            if (!differencesCtx) {
                console.error('differencesChart element not found!');
                document.getElementById('chartStatus').textContent = 'Canvas not found';
                return;
            }
            
            const ctx = differencesCtx.getContext('2d');
            this.charts.differences = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Time Difference (minutes)',
                    data: [],
                    backgroundColor: function(context) {
                        const value = context.parsed ? context.parsed.y : 0;
                        if (value === 0) return '#10b981';
                        if (value > 0) return '#f59e0b';
                        return '#ef4444';
                    },
                    borderColor: '#475569',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                if (value === 0) return 'Synchronized';
                                if (value > 0) return `${value} minutes ahead`;
                                return `${Math.abs(value)} minutes behind`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#94a3b8',
                            maxRotation: 45
                        },
                        grid: {
                            color: '#475569'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: '#475569'
                        },
                        title: {
                            display: true,
                            text: 'Time Difference (minutes)',
                            color: '#cbd5e1'
                        }
                    }
                }
            }
        });

        // Status Chart
        const statusCtx = document.getElementById('statusChart');
        if (!statusCtx) {
            console.error('statusChart element not found!');
            document.getElementById('statusChartStatus').textContent = 'Canvas not found';
            return;
        }
        
        const statusContext = statusCtx.getContext('2d');
        this.charts.status = new Chart(statusContext, {
            type: 'doughnut',
            data: {
                labels: ['Synchronized', 'Running Ahead', 'Running Behind'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    borderColor: '#1e293b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            padding: 20
                        }
                    }
                }
            }
        });
        
        console.log('Charts initialized successfully');
        document.getElementById('chartStatus').textContent = 'Ready - Switching to chart view';
        document.getElementById('statusChartStatus').textContent = 'Ready';
        
        // Show the chart and hide the simple display
        setTimeout(() => {
            document.getElementById('differencesChart').style.display = 'block';
            document.getElementById('simpleDifferencesDisplay').style.display = 'none';
        }, 1000);
        
        // Trigger an initial update if we have data
        if (this.lastData) {
            this.updateCharts(this.lastData);
        }
        
        } catch (error) {
            console.error('Error initializing charts:', error);
            document.getElementById('chartStatus').textContent = 'Error: ' + error.message;
            document.getElementById('statusChartStatus').textContent = 'Error: ' + error.message;
        }
    }

    updateCharts(data) {
        try {
            if (!this.charts.differences || !this.charts.status) {
                console.warn('Charts not ready yet, will update when initialized');
                document.getElementById('chartStatus').textContent = 'Charts not ready';
                document.getElementById('statusChartStatus').textContent = 'Charts not ready';
                return;
            }
            
            // Update differences chart
            const clockNames = data.clocks.map(clock => clock.name.replace(' Clock', ''));
            const differences = data.clocks.map(clock => clock.difference);
            
            this.charts.differences.data.labels = clockNames;
            this.charts.differences.data.datasets[0].data = differences;
            this.charts.differences.update('active');

            // Update status chart
            this.charts.status.data.datasets[0].data = [
                data.summary.synchronized,
                data.summary.ahead,
                data.summary.behind
            ];
            this.charts.status.update('active');
            
            console.log('Charts updated with data:', { clockNames, differences, summary: data.summary });
            
            document.getElementById('chartStatus').textContent = `Updated with ${differences.length} clocks`;
            document.getElementById('statusChartStatus').textContent = `Sync:${data.summary.synchronized} Ahead:${data.summary.ahead} Behind:${data.summary.behind}`;
        } catch (error) {
            console.error('Error updating charts:', error);
            document.getElementById('chartStatus').textContent = 'Update error: ' + error.message;
            document.getElementById('statusChartStatus').textContent = 'Update error: ' + error.message;
        }
    }

    updateSimpleDifferences(clocks) {
        const container = document.getElementById('simpleDifferencesDisplay');
        if (!container) return;
        
        container.innerHTML = '';
        
        clocks.forEach(clock => {
            const maxDiff = Math.max(...clocks.map(c => Math.abs(c.difference)));
            const progressWidth = maxDiff > 0 ? (Math.abs(clock.difference) / maxDiff) * 100 : 0;
            
            const bar = document.createElement('div');
            bar.className = `difference-bar ${clock.status}`;
            bar.innerHTML = `
                <div class="difference-bar-content">
                    <div class="difference-clock-name">${clock.name.replace(' Clock', '')}</div>
                    <div class="difference-value ${clock.difference > 0 ? 'positive' : clock.difference < 0 ? 'negative' : 'zero'}">
                        <i class="fas ${clock.difference > 0 ? 'fa-fast-forward' : clock.difference < 0 ? 'fa-backward' : 'fa-check-circle'}"></i>
                        ${clock.difference === 0 ? 'Synchronized' : 
                          clock.difference > 0 ? `+${clock.difference}m` : `${clock.difference}m`}
                    </div>
                    <div class="difference-visual">
                        <div class="difference-progress ${clock.status}" style="width: ${progressWidth}%"></div>
                    </div>
                </div>
            `;
            container.appendChild(bar);
        });
        
        document.getElementById('chartStatus').textContent = `Showing ${clocks.length} clocks`;
    }

    showAddClockModal() {
        const modal = document.getElementById('addClockModal');
        modal.style.display = 'block';
        document.getElementById('clockName').focus();
    }

    hideModal(modal) {
        modal.style.display = 'none';
        // Clear form
        modal.querySelectorAll('input').forEach(input => input.value = '');
    }

    addNewClock() {
        const name = document.getElementById('clockName').value.trim();
        const time = document.getElementById('clockTime').value;

        if (!name || !time) {
            alert('Please fill in all fields');
            return;
        }

        this.socket.emit('addClock', { name, time });
        this.hideModal(document.getElementById('addClockModal'));
    }

    editClock(clock) {
        this.currentEditingClock = clock;
        document.getElementById('editClockName').value = clock.name;
        document.getElementById('editClockTime').value = clock.time;
        
        const modal = document.getElementById('editClockModal');
        modal.style.display = 'block';
        document.getElementById('editClockName').focus();
    }

    updateClock() {
        if (!this.currentEditingClock) return;

        const name = document.getElementById('editClockName').value.trim();
        const time = document.getElementById('editClockTime').value;

        if (!name || !time) {
            alert('Please fill in all fields');
            return;
        }

        this.socket.emit('updateClock', {
            id: this.currentEditingClock.id,
            name,
            time
        });

        this.hideModal(document.getElementById('editClockModal'));
        this.currentEditingClock = null;
    }

    deleteClock(clockId) {
        if (confirm('Are you sure you want to delete this clock?')) {
            this.socket.emit('deleteClock', clockId);
        }
    }
}

// Initialize the application when everything is loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        new TemporaUI();
    }, 100);
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing TemporaUI...');
    // Removed duplicate initialization
});

// Add some smooth animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe elements for animations
    document.querySelectorAll('.card, .stat-card').forEach(el => {
        observer.observe(el);
    });
});

// Add CSS for fadeInUp animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
