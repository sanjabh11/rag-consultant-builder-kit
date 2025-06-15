
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface ErrorLog {
  id: string;
  timestamp: string;
  error: string;
  stack?: string;
  userAgent: string;
  url: string;
  userId?: string;
}

export const useErrorLogging = () => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      logError(event.error || new Error(event.message), 'global-error');
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(new Error(String(event.reason)), 'unhandled-rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const logError = (error: Error, context?: string) => {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Store in localStorage for persistence
    const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    const updatedLogs = [errorLog, ...existingLogs.slice(0, 49)]; // Keep last 50 errors
    localStorage.setItem('error_logs', JSON.stringify(updatedLogs));
    
    setErrorLogs(updatedLogs);

    // Log to console for development
    console.error('Error logged:', error, { context });

    // Show user-friendly error message
    if (context !== 'silent') {
      toast({
        title: "Something went wrong",
        description: "An error occurred. Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  };

  const clearErrorLogs = () => {
    localStorage.removeItem('error_logs');
    setErrorLogs([]);
  };

  const getErrorStats = () => {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    return {
      total: logs.length,
      lastHour: logs.filter((log: ErrorLog) => 
        new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
      ).length,
      lastDay: logs.filter((log: ErrorLog) => 
        new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
    };
  };

  return {
    errorLogs,
    logError,
    clearErrorLogs,
    getErrorStats,
  };
};
