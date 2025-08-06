import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  FATAL: 'fatal';
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
};

interface LogContext {
  userId?: string;
  tenantId?: string;
  projectId?: string;
  sessionId?: string;
  feature?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class ObservabilityService {
  private static instance: ObservabilityService;
  private logflareApiKey?: string;
  private logflareSourceId?: string;
  private sentryDsn?: string;
  private environment: string;
  private isInitialized: boolean = false;
  private logBuffer: any[] = [];
  private flushInterval?: NodeJS.Timeout;

  private constructor() {
    this.environment = import.meta.env.MODE || 'development';
  }

  static getInstance(): ObservabilityService {
    if (!ObservabilityService.instance) {
      ObservabilityService.instance = new ObservabilityService();
    }
    return ObservabilityService.instance;
  }

  /**
   * Initialize observability services
   */
  initialize(config: {
    sentryDsn?: string;
    logflareApiKey?: string;
    logflareSourceId?: string;
    environment?: string;
    userId?: string;
    tenantId?: string;
  }) {
    if (this.isInitialized) return;

    this.sentryDsn = config.sentryDsn || import.meta.env.VITE_SENTRY_DSN;
    this.logflareApiKey = config.logflareApiKey || import.meta.env.VITE_LOGFLARE_API_KEY;
    this.logflareSourceId = config.logflareSourceId || import.meta.env.VITE_LOGFLARE_SOURCE_ID;
    this.environment = config.environment || this.environment;

    // Initialize Sentry
    if (this.sentryDsn && this.environment !== 'development') {
      Sentry.init({
        dsn: this.sentryDsn,
        environment: this.environment,
        integrations: [
          new BrowserTracing(),
        ],
        tracesSampleRate: this.environment === 'production' ? 0.1 : 1.0,
        beforeSend(event, hint) {
          // Filter out sensitive data
          if (event.request?.cookies) {
            delete event.request.cookies;
          }
          if (event.extra) {
            delete event.extra.password;
            delete event.extra.token;
            delete event.extra.apiKey;
          }
          return event;
        },
      });

      // Set initial user context
      if (config.userId) {
        Sentry.setUser({
          id: config.userId,
          tenant_id: config.tenantId,
        });
      }
    }

    // Start log buffer flush interval
    if (this.logflareApiKey && this.logflareSourceId) {
      this.flushInterval = setInterval(() => {
        this.flushLogBuffer();
      }, 5000); // Flush every 5 seconds
    }

    this.isInitialized = true;
  }

  /**
   * Set user context for tracking
   */
  setUserContext(userId: string, tenantId?: string, email?: string) {
    if (this.sentryDsn) {
      Sentry.setUser({
        id: userId,
        email,
        tenant_id: tenantId,
      });
    }
  }

  /**
   * Clear user context (on logout)
   */
  clearUserContext() {
    if (this.sentryDsn) {
      Sentry.setUser(null);
    }
  }

  /**
   * Log message with context
   */
  log(level: keyof LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: LOG_LEVELS[level],
      message,
      environment: this.environment,
      ...context,
    };

    // Console log in development
    if (this.environment === 'development') {
      const consoleMethod = level === 'ERROR' || level === 'FATAL' ? 'error' :
                           level === 'WARN' ? 'warn' :
                           level === 'DEBUG' ? 'debug' : 'log';
      console[consoleMethod](`[${level}]`, message, context || '');
    }

    // Send to Sentry for errors
    if ((level === 'ERROR' || level === 'FATAL') && this.sentryDsn) {
      Sentry.captureException(new Error(message), {
        level: level === 'FATAL' ? 'fatal' : 'error',
        extra: context,
      });
    }

    // Buffer for Logflare
    if (this.logflareApiKey && this.logflareSourceId) {
      this.logBuffer.push(logEntry);
      
      // Flush immediately for errors
      if (level === 'ERROR' || level === 'FATAL') {
        this.flushLogBuffer();
      }
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    this.log('INFO', `Event: ${eventName}`, {
      feature: 'analytics',
      action: eventName,
      metadata: properties,
    });

    // Send to analytics service if configured
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName: string, value: number, unit: string = 'ms') {
    this.log('DEBUG', `Performance: ${metricName}`, {
      feature: 'performance',
      metadata: {
        metric: metricName,
        value,
        unit,
      },
    });

    // Report to Sentry
    if (this.sentryDsn) {
      const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
      if (transaction) {
        transaction.setMeasurement(metricName, value, unit);
      }
    }
  }

  /**
   * Start a transaction for performance monitoring
   */
  startTransaction(name: string, op: string = 'navigation') {
    if (this.sentryDsn) {
      return Sentry.startTransaction({
        name,
        op,
      });
    }
    return null;
  }

  /**
   * Capture exception with context
   */
  captureException(error: Error, context?: LogContext) {
    this.log('ERROR', error.message, {
      ...context,
      metadata: {
        ...context?.metadata,
        stack: error.stack,
        name: error.name,
      },
    });
  }

  /**
   * Flush log buffer to Logflare
   */
  private async flushLogBuffer() {
    if (this.logBuffer.length === 0) return;
    if (!this.logflareApiKey || !this.logflareSourceId) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const response = await fetch(`https://api.logflare.app/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.logflareApiKey,
        },
        body: JSON.stringify({
          source: this.logflareSourceId,
          batch: logs,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send logs to Logflare:', response.statusText);
        // Re-add logs to buffer for retry
        this.logBuffer.unshift(...logs);
      }
    } catch (error) {
      console.error('Error sending logs to Logflare:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logs);
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushLogBuffer();
  }
}

// Export singleton instance
export const observability = ObservabilityService.getInstance();

// Export convenience methods
export const logger = {
  debug: (message: string, context?: LogContext) => 
    observability.log('DEBUG', message, context),
  
  info: (message: string, context?: LogContext) => 
    observability.log('INFO', message, context),
  
  warn: (message: string, context?: LogContext) => 
    observability.log('WARN', message, context),
  
  error: (message: string, context?: LogContext) => 
    observability.log('ERROR', message, context),
  
  fatal: (message: string, context?: LogContext) => 
    observability.log('FATAL', message, context),
};

// React error boundary integration
export const ErrorBoundary = Sentry.ErrorBoundary;

// Performance monitoring HOC
export const withProfiler = Sentry.withProfiler;
