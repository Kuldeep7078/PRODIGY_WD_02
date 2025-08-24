class Stopwatch {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.laps = [];
        this.intervalId = null;
        
        // DOM elements
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.millisecondsEl = document.getElementById('milliseconds');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.clearLapsBtn = document.getElementById('clearLapsBtn');
        this.lapsList = document.getElementById('lapsList');
        this.yearEl = document.getElementById('year');
        
        this.initializeEventListeners();
        this.updateYear();
    }
    
    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        this.clearLapsBtn.addEventListener('click', () => this.clearLaps());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
            } else if (e.code === 'KeyL') {
                e.preventDefault();
                if (this.isRunning) {
                    this.recordLap();
                }
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                this.reset();
            }
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startTime = Date.now() - this.elapsedTime;
            this.intervalId = setInterval(() => this.updateDisplay(), 10);
            
            this.updateButtonStates();
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.elapsedTime = Date.now() - this.startTime;
            clearInterval(this.intervalId);
            
            this.updateButtonStates();
        }
    }
    
    reset() {
        this.pause();
        this.elapsedTime = 0;
        this.laps = [];
        this.updateDisplay();
        this.updateLapsDisplay();
        this.updateButtonStates();
    }
    
    recordLap() {
        if (this.isRunning) {
            const currentTime = Date.now() - this.startTime;
            const lapNumber = this.laps.length + 1;
            
            // Calculate lap duration (time since last lap or start)
            const previousLapTime = this.laps.length > 0 ? this.laps[this.laps.length - 1].totalTime : 0;
            const lapDuration = currentTime - previousLapTime;
            
            const lap = {
                number: lapNumber,
                totalTime: currentTime,
                duration: lapDuration
            };
            
            this.laps.push(lap);
            this.updateLapsDisplay();
            this.updateButtonStates();
        }
    }
    
    clearLaps() {
        this.laps = [];
        this.updateLapsDisplay();
        this.updateButtonStates();
    }
    
    updateDisplay() {
        const time = this.isRunning ? Date.now() - this.startTime : this.elapsedTime;
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = Math.floor((time % 1000) / 10);
        
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');
        this.millisecondsEl.textContent = milliseconds.toString().padStart(2, '0');
    }
    
    updateLapsDisplay() {
        if (this.laps.length === 0) {
            this.lapsList.innerHTML = `
                <div class="no-laps">
                    <svg class="no-laps-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p>No lap times recorded yet</p>
                    <p class="hint">Click "Lap" to record your first lap time</p>
                </div>
            `;
            return;
        }
        
        // Find fastest and slowest laps
        const lapDurations = this.laps.map(lap => lap.duration);
        const fastestLap = Math.min(...lapDurations);
        const slowestLap = Math.max(...lapDurations);
        
        const lapsHTML = this.laps.map(lap => {
            const totalTimeFormatted = this.formatTime(lap.totalTime);
            const durationFormatted = this.formatTime(lap.duration);
            
            let className = 'lap-item';
            if (lap.duration === fastestLap && this.laps.length > 1) {
                className += ' fastest';
            } else if (lap.duration === slowestLap && this.laps.length > 1) {
                className += ' slowest';
            }
            
            return `
                <div class="${className}">
                    <div class="lap-number">Lap ${lap.number}</div>
                    <div class="lap-time">${totalTimeFormatted}</div>
                    <div class="lap-duration">+${durationFormatted}</div>
                </div>
            `;
        }).join('');
        
        this.lapsList.innerHTML = lapsHTML;
    }
    
    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
        } else {
            return `${seconds}.${ms.toString().padStart(2, '0')}`;
        }
    }
    
    updateButtonStates() {
        // Start button
        this.startBtn.disabled = this.isRunning;
        
        // Pause button
        this.pauseBtn.disabled = !this.isRunning;
        
        // Reset button
        this.resetBtn.disabled = this.isRunning && this.elapsedTime === 0 && this.laps.length === 0;
        
        // Lap button
        this.lapBtn.disabled = !this.isRunning;
        
        // Clear laps button
        this.clearLapsBtn.disabled = this.laps.length === 0;
    }
    
    updateYear() {
        if (this.yearEl) {
            this.yearEl.textContent = new Date().getFullYear();
        }
    }
}

// Initialize the stopwatch when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Stopwatch();
});

// Add some helpful console messages
console.log('Stopwatch App Loaded!');
console.log('Keyboard shortcuts:');
console.log('- Space: Start/Pause');
console.log('- L: Record Lap');
console.log('- R: Reset'); 