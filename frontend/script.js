class SignLanguageApp {
    constructor() {
        this.backendUrl = window.location.hostname === 'localhost'
                 ? 'http://localhost:5000'
                 : 'https://58b1f27b11a9.ngrok-free.app';
        this.isDetectionActive = false;
        this.predictionHistory = [];
        this.stats = {
            totalPredictions: 0,
            totalConfidence: 0,
            startTime: Date.now()
        };
        this.predictionUpdateInterval = null;  // FIX: Store interval ID
        
        this.initializeElements();
        this.bindEvents();
        this.startStatusUpdates();
        this.loadAvailableCameras();
        this.testConnection();  // FIX: Test connection on start
    }

    initializeElements() {
        // Video elements
        this.videoFeed = document.getElementById('video-feed');
        this.videoOverlay = document.getElementById('video-overlay');
        
        // Status elements
        this.cameraStatusDot = document.getElementById('camera-dot');
        this.modelStatusDot = document.getElementById('model-dot');
        
        // Prediction elements
        this.currentLetterDisplay = document.getElementById('current-letter');
        this.confidenceFill = document.getElementById('confidence-fill');
        this.confidenceText = document.getElementById('confidence-text');
        this.fpsValue = document.getElementById('fps-value');
        
        // Control elements
        this.cameraSelect = document.getElementById('camera-select');
        this.startButton = document.getElementById('start-detection');
        this.stopButton = document.getElementById('stop-detection');
        this.reloadModelButton = document.getElementById('reload-model');
        this.refreshCameraButton = document.getElementById('refresh-camera');
        
        // Stats elements
        this.totalPredictionsElement = document.getElementById('total-predictions');
        this.avgConfidenceElement = document.getElementById('avg-confidence');
        this.uptimeElement = document.getElementById('uptime');
        this.historyList = document.getElementById('history-list');
    }

    bindEvents() {
        // Camera controls
        this.cameraSelect.addEventListener('change', (e) => {
            this.setCameraIndex(parseInt(e.target.value));
        });

        this.refreshCameraButton.addEventListener('click', () => {
            this.refreshCamera();
        });

        // Detection controls
        this.startButton.addEventListener('click', () => {
            this.startDetection();
        });

        this.stopButton.addEventListener('click', () => {
            this.stopDetection();
        });

        this.reloadModelButton.addEventListener('click', () => {
            this.reloadModel();
        });

        // Video feed error handling
        this.videoFeed.addEventListener('error', () => {
            this.handleVideoError();
        });

        this.videoFeed.addEventListener('load', () => {
            this.handleVideoLoad();
        });
    }

    // FIX: Add connection test
    async testConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/api/test`);
            const data = await response.json();
            console.log('Backend connection test:', data);
            
            if (data.status === 'ok') {
                this.showToast('Terhubung ke backend', 'success');
            }
        } catch (error) {
            console.error('Backend connection failed:', error);
            this.showToast('Gagal terhubung ke backend. Pastikan server berjalan di port 5000', 'error');
        }
    }

    async loadAvailableCameras() {
        try {
            const response = await fetch(`${this.backendUrl}/api/cameras/list`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Update camera select options
            this.cameraSelect.innerHTML = '';
            data.cameras.forEach(index => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `Kamera ${index}`;
                this.cameraSelect.appendChild(option);
            });
            
            if (data.cameras.length === 0) {
                this.showToast('Tidak ada kamera yang terdeteksi', 'warning');
            } else {
                console.log('Available cameras:', data.cameras);
            }
        } catch (error) {
            console.error('Error loading cameras:', error);
            this.showToast('Gagal memuat daftar kamera: ' + error.message, 'error');
        }
    }

    async setCameraIndex(index) {
        try {
            const response = await fetch(`${this.backendUrl}/api/camera/set_index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ index: index })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(`Kamera ${index} berhasil diatur`, 'success');
                this.refreshVideoFeed();
            } else {
                this.showToast(`Gagal mengatur kamera ${index}: ${data.message}`, 'error');
            }
        } catch (error) {
            console.error('Error setting camera:', error);
            this.showToast('Gagal mengatur kamera: ' + error.message, 'error');
        }
    }

    async refreshCamera() {
        this.showToast('Merefresh kamera...', 'info');
        this.refreshVideoFeed();
        await this.loadAvailableCameras();
    }

    refreshVideoFeed() {
        // Add timestamp to prevent caching
        this.videoFeed.src = `${this.backendUrl}/video_feed?t=${Date.now()}`;
        this.videoOverlay.classList.remove('hidden');
    }

    handleVideoLoad() {
        this.videoOverlay.classList.add('hidden');
        console.log('Video feed loaded successfully');
    }

    handleVideoError() {
        this.videoOverlay.classList.remove('hidden');
        console.error('Video feed error');
        this.showToast('Gagal memuat video feed', 'error');
    }

    async startDetection() {
        this.isDetectionActive = true;
        this.startButton.disabled = true;
        this.stopButton.disabled = false;
        
        this.showToast('Deteksi dimulai', 'success');
        this.startPredictionUpdates();
    }

    async stopDetection() {
        this.isDetectionActive = false;
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        
        // FIX: Clear interval if exists
        if (this.predictionUpdateInterval) {
            clearTimeout(this.predictionUpdateInterval);
            this.predictionUpdateInterval = null;
        }
        
        this.showToast('Deteksi dihentikan', 'info');
    }

    async reloadModel() {
        try {
            this.showToast('Memuat ulang model...', 'info');
            
            const response = await fetch(`${this.backendUrl}/api/model/reload`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Model berhasil dimuat ulang', 'success');
                console.log('Model classes:', data.classes);
            } else {
                this.showToast('Gagal memuat ulang model: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error reloading model:', error);
            this.showToast('Gagal memuat ulang model: ' + error.message, 'error');
        }
    }

    startStatusUpdates() {
        // Update status every 2 seconds
        setInterval(() => {
            this.updateStatus();
        }, 2000);
        
        // Update uptime every second
        setInterval(() => {
            this.updateUptime();
        }, 1000);
        
        // FIX: Initial status update
        this.updateStatus();
    }

    async updateStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/api/camera/status`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update camera status
            if (data.connected) {
                this.cameraStatusDot.classList.remove('disconnected');
                this.cameraStatusDot.classList.add('connected');
            } else {
                this.cameraStatusDot.classList.remove('connected');
                this.cameraStatusDot.classList.add('disconnected');
            }
            
            // Update model status
            if (data.model_loaded) {
                this.modelStatusDot.classList.remove('disconnected');
                this.modelStatusDot.classList.add('connected');
            } else {
                this.modelStatusDot.classList.remove('connected');
                this.modelStatusDot.classList.add('disconnected');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            // Set both to disconnected on error
            this.cameraStatusDot.classList.remove('connected');
            this.cameraStatusDot.classList.add('disconnected');
            this.modelStatusDot.classList.remove('connected');
            this.modelStatusDot.classList.add('disconnected');
        }
    }

    startPredictionUpdates() {
        if (!this.isDetectionActive) return;
        
        // FIX: Use proper async/await pattern
        this.predictionUpdateInterval = setTimeout(async () => {
            if (this.isDetectionActive) {
                await this.updatePrediction();
                this.startPredictionUpdates();
            }
        }, 100);
    }

    async updatePrediction() {
        try {
            const response = await fetch(`${this.backendUrl}/api/prediction`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Prediction data:', data);  // FIX: Debug log
            
            // Update UI with prediction data
            this.updatePredictionDisplay(data);
            
            // Add to history if there's a valid prediction
            if (data.letter && data.letter !== 'No Model' && data.letter !== 'Error' && data.letter !== '') {
                this.addToHistory(data);
            }
            
            // Update stats
            this.updateStats(data);
        } catch (error) {
            console.error('Error updating prediction:', error);
            // FIX: Show error in UI
            this.currentLetterDisplay.textContent = 'Error';
            this.confidenceFill.style.width = '0%';
            this.confidenceText.textContent = '0%';
        }
    }

    updatePredictionDisplay(data) {
        // FIX: Handle empty or invalid predictions
        const displayLetter = data.letter || '?';
        
        // Update current letter with animation
        if (this.currentLetterDisplay.textContent !== displayLetter) {
            this.currentLetterDisplay.textContent = displayLetter;
            this.currentLetterDisplay.classList.add('pulse');
            setTimeout(() => {
                this.currentLetterDisplay.classList.remove('pulse');
            }, 300);
        }
        
        // Update confidence bar
        const confidencePercent = Math.round((data.confidence || 0) * 100);
        this.confidenceFill.style.width = `${confidencePercent}%`;
        this.confidenceText.textContent = `${confidencePercent}%`;
        
        // Update FPS
        this.fpsValue.textContent = Math.round(data.fps || 0);
    }

    addToHistory(data) {
        const historyItem = {
            letter: data.letter,
            confidence: data.confidence,
            timestamp: new Date()
        };
        
        this.predictionHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (this.predictionHistory.length > 10) {
            this.predictionHistory = this.predictionHistory.slice(0, 10);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        
        this.predictionHistory.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item slide-in';
            
            const timeString = item.timestamp.toLocaleTimeString('id-ID', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            historyElement.innerHTML = `
                <span class="history-letter">${item.letter}</span>
                <div>
                    <span class="history-confidence">${Math.round(item.confidence * 100)}%</span>
                    <span class="history-time">${timeString}</span>
                </div>
            `;
            
            this.historyList.appendChild(historyElement);
        });
    }

    updateStats(data) {
        if (data.letter && data.letter !== 'No Model' && data.letter !== 'Error' && data.letter !== '') {
            this.stats.totalPredictions++;
            this.stats.totalConfidence += (data.confidence || 0);
        }
        
        // Update total predictions
        this.totalPredictionsElement.textContent = this.stats.totalPredictions;
        
        // Update average confidence
        const avgConfidence = this.stats.totalPredictions > 0 
            ? Math.round((this.stats.totalConfidence / this.stats.totalPredictions) * 100)
            : 0;
        this.avgConfidenceElement.textContent = `${avgConfidence}%`;
    }

    updateUptime() {
        const uptime = Date.now() - this.stats.startTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.uptimeElement.textContent = timeString;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toast-container');
        if (!container) {
            console.error('Toast container not found');
            return;
        }
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.signLanguageApp = new SignLanguageApp();
});

// Handle page visibility changes to optimize performance
document.addEventListener('visibilitychange', () => {
    if (window.signLanguageApp) {
        if (document.hidden) {
            // Page is hidden, reduce update frequency
            console.log('Page hidden, reducing updates');
        } else {
            // Page is visible, resume normal updates
            console.log('Page visible, resuming updates');
        }
    }
});
