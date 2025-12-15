/**
 * Structured Logging Utility
 * Cung cấp logging có cấu trúc với timestamp và metadata
 */

const logger = {
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {object} meta - Optional metadata
   */
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'INFO',
      timestamp,
      message,
      ...meta
    };
    console.log(`[INFO] ${timestamp} ${message}`, Object.keys(meta).length > 0 ? meta : '');
    return logEntry;
  },

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {object} meta - Optional metadata
   */
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'WARN',
      timestamp,
      message,
      ...meta
    };
    console.warn(`[WARN] ${timestamp} ${message}`, Object.keys(meta).length > 0 ? meta : '');
    return logEntry;
  },

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error|object} error - Error object or metadata
   */
  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    const errorDetails = error instanceof Error 
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...(error.response && {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url
          })
        }
      : error;
    
    const logEntry = {
      level: 'ERROR',
      timestamp,
      message,
      error: errorDetails
    };
    console.error(`[ERROR] ${timestamp} ${message}`, errorDetails);
    return logEntry;
  },

  /**
   * Log debug message (chỉ trong development)
   * @param {string} message - Debug message
   * @param {object} meta - Optional metadata
   */
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      const logEntry = {
        level: 'DEBUG',
        timestamp,
        message,
        ...meta
      };
      console.debug(`[DEBUG] ${timestamp} ${message}`, Object.keys(meta).length > 0 ? meta : '');
      return logEntry;
    }
  }
};

module.exports = logger;

