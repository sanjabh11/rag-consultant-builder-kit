import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MetricData {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  memoryUsage: number;
  errorRate: number;
  responseTime: number;
}

export const useMonitoring = () => {
  const [metrics, setMetrics] = useState<Record<string, MetricData[]>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 0,
    memoryUsage: 0,
    errorRate: 0,
    responseTime: 0
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize monitoring
    const startTime = Date.now();
    const interval = setInterval(() => {
      collectSystemMetrics(startTime);
    }, 30000); // Collect metrics every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const trackMetric = (name: string, value: number, metadata?: Record<string, any>) => {
    const metric: MetricData = {
      timestamp: new Date().toISOString(),
      value,
      metadata
    };

    setMetrics(prev => ({
      ...prev,
      [name]: [...(prev[name] || []).slice(-99), metric] // Keep last 100 data points
    }));

    // Check for threshold alerts
    checkThresholds(name, value, metadata);
  };

  const trackEvent = (event: string, properties?: Record<string, any>) => {
    console.log(`Event: ${event}`, properties);
    
    // Store in localStorage for persistence
    const events = JSON.parse(localStorage.getItem('monitoring_events') || '[]');
    events.push({
      event,
      properties,
      timestamp: new Date().toISOString(),
      userId: user?.id
    });
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem('monitoring_events', JSON.stringify(events));
  };

  const trackPerformance = (operation: string, duration: number) => {
    trackMetric(`performance.${operation}`, duration, { operation });
    
    // Alert if operation is too slow
    if (duration > 5000) { // 5 seconds
      createAlert('warning', `Slow operation detected: ${operation} took ${duration}ms`);
    }
  };

  const trackError = (error: Error, context?: string) => {
    trackMetric('errors.count', 1, { 
      message: error.message, 
      stack: error.stack, 
      context 
    });
    
    createAlert('error', `Error in ${context || 'application'}: ${error.message}`);
  };

  const createAlert = (type: Alert['type'], message: string) => {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts

    // Show toast for critical alerts
    if (type === 'error') {
      toast({
        title: "System Alert",
        description: message,
        variant: "destructive",
      });
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  const collectSystemMetrics = (startTime: number) => {
    const now = Date.now();
    
    // Calculate uptime
    const uptime = now - startTime;
    
    // Estimate memory usage (rough approximation)
    const memoryUsage = performance.memory ? 
      (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100 : 0;
    
    // Calculate error rate from recent metrics
    const recentErrors = metrics['errors.count']?.slice(-10) || [];
    const errorRate = recentErrors.length > 0 ? 
      recentErrors.reduce((sum, m) => sum + m.value, 0) / recentErrors.length : 0;
    
    // Calculate average response time
    const performanceMetrics = Object.entries(metrics)
      .filter(([key]) => key.startsWith('performance.'))
      .flatMap(([, values]) => values.slice(-10))
      .map(m => m.value);
    
    const responseTime = performanceMetrics.length > 0 ?
      performanceMetrics.reduce((sum, val) => sum + val, 0) / performanceMetrics.length : 0;

    // Determine system status
    let status: SystemHealth['status'] = 'healthy';
    if (errorRate > 10 || memoryUsage > 90 || responseTime > 3000) {
      status = 'critical';
    } else if (errorRate > 5 || memoryUsage > 70 || responseTime > 1000) {
      status = 'degraded';
    }

    const health: SystemHealth = {
      status,
      uptime,
      memoryUsage,
      errorRate,
      responseTime
    };

    setSystemHealth(health);
    
    // Track system metrics
    trackMetric('system.uptime', uptime);
    trackMetric('system.memory', memoryUsage);
    trackMetric('system.errors', errorRate);
    trackMetric('system.response_time', responseTime);
  };

  const checkThresholds = (name: string, value: number, metadata?: Record<string, any>) => {
    const thresholds: Record<string, number> = {
      'system.memory': 80,
      'system.response_time': 2000,
      'errors.count': 5
    };

    if (thresholds[name] && value > thresholds[name]) {
      createAlert('warning', `Threshold exceeded for ${name}: ${value}`);
    }
  };

  const getMetricHistory = (name: string, hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return metrics[name]?.filter(m => m.timestamp > cutoff) || [];
  };

  const exportMetrics = () => {
    const data = {
      metrics,
      alerts,
      systemHealth,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    metrics,
    alerts,
    systemHealth,
    trackMetric,
    trackEvent,
    trackPerformance,
    trackError,
    createAlert,
    resolveAlert,
    getMetricHistory,
    exportMetrics
  };
};
