/**
 * Configuration file for SIBI Sign Language Detection Frontend
 * 
 * You can modify these settings to customize the application behavior
 */

const CONFIG = {
    // Backend server configuration
    BACKEND_URL: 'http://localhost:5000',
    
    // Update intervals (in milliseconds)
    UPDATE_INTERVALS: {
        STATUS: 2000,        // Status update interval
        PREDICTION: 100,     // Prediction update interval (when active)
        UPTIME: 1000         // Uptime update interval
    },
    
    // UI Configuration
    UI: {
        MAX_HISTORY_ITEMS: 10,        // Maximum items in prediction history
        TOAST_DURATION: 3000,         // Toast notification duration
        CONFIDENCE_THRESHOLD: 0.1,    // Minimum confidence to show prediction
        ANIMATION_DURATION: 300       // Animation duration in ms
    },
    
    // Camera configuration
    CAMERA: {
        DEFAULT_INDEX: 0,             // Default camera index
        MAX_INDEX_CHECK: 5,           // Maximum camera index to check
        RECONNECT_DELAY: 1000,        // Delay before reconnecting (ms)
        FRAME_TIMEOUT: 5000           // Timeout for frame loading (ms)
    },
    
    // Model configuration
    MODEL: {
        CONFIDENCE_THRESHOLD: 0.25,   // Model confidence threshold
        IMG_SIZE: 640,                // Input image size for model
        AUTO_RELOAD: true,            // Auto reload model on error
        RELOAD_DELAY: 5000            // Delay before reloading (ms)
    },
    
    // Colors and styling
    COLORS: {
        PRIMARY: '#667eea',
        SECONDARY: '#764ba2',
        SUCCESS: '#48bb78',
        ERROR: '#f56565',
        WARNING: '#ed8936',
        INFO: '#4299e1'
    }
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Utility functions for configuration
const ConfigUtils = {
    /**
     * Get backend URL with endpoint
     */
    getApiUrl: (endpoint) => {
        return `${CONFIG.BACKEND_URL}${endpoint}`;
    },
    
    /**
     * Get color by type
     */
    getColor: (type) => {
        return CONFIG.COLORS[type.toUpperCase()] || CONFIG.COLORS.PRIMARY;
    },
    
    /**
     * Format confidence percentage
     */
    formatConfidence: (confidence) => {
        return Math.round(confidence * 100);
    },
    
    /**
     * Format FPS value
     */
    formatFps: (fps) => {
        return Math.round(fps || 0);
    },
    
    /**
     * Check if prediction is valid
     */
    isValidPrediction: (prediction) => {
        return prediction && 
               prediction.letter && 
               prediction.letter !== 'No Model' && 
               prediction.letter !== 'Error' &&
               prediction.confidence >= CONFIG.MODEL.CONFIDENCE_THRESHOLD;
    }
};

// Make ConfigUtils globally available
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.ConfigUtils = ConfigUtils;
}