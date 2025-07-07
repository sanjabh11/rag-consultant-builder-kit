
import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { useAuth } from '@/hooks/useAuth';

interface CostBreakdown {
  storage: number;
  compute: number;
  apiCalls: number;
  vectorOperations: number;
  total: number;
}

interface UsageMetrics {
  documentsProcessed: number;
  queriesExecuted: number;
  storageUsed: number; // in GB
  computeTime: number; // in seconds
  apiCallsCount: number;
  vectorOperationsCount: number;
}

interface CostAlert {
  id: string;
  type: 'budget_exceeded' | 'usage_spike' | 'monthly_limit';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
}

export const useCostTracking = () => {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  
  const [currentCosts, setCurrentCosts] = useState<CostBreakdown>({
    storage: 0,
    compute: 0,
    apiCalls: 0,
    vectorOperations: 0,
    total: 0
  });
  
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    documentsProcessed: 0,
    queriesExecuted: 0,
    storageUsed: 0,
    computeTime: 0,
    apiCallsCount: 0,
    vectorOperationsCount: 0
  });
  
  const [costAlerts, setCostAlerts] = useState<CostAlert[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(100); // Default $100
  const [isTracking, setIsTracking] = useState(false);

  // Pricing structure (in USD)
  const PRICING = {
    storage: 0.023, // per GB per month
    compute: 0.00001, // per second
    apiCalls: 0.001, // per call
    vectorOperations: 0.0001, // per operation
  };

  useEffect(() => {
    if (currentTenant) {
      loadCostData();
      startTracking();
    }
    
    return () => {
      setIsTracking(false);
    };
  }, [currentTenant]);

  const loadCostData = async () => {
    try {
      // Load from localStorage for local mode
      const storedMetrics = localStorage.getItem(`usage_metrics_${currentTenant?.id}`);
      if (storedMetrics) {
        const metrics = JSON.parse(storedMetrics);
        setUsageMetrics(metrics);
        calculateCosts(metrics);
      }
      
      const storedBudget = localStorage.getItem(`budget_limit_${currentTenant?.id}`);
      if (storedBudget) {
        setBudgetLimit(parseFloat(storedBudget));
      }
    } catch (error) {
      console.error('Failed to load cost data:', error);
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    
    // Set up periodic cost calculation
    const interval = setInterval(() => {
      calculateCosts(usageMetrics);
      checkBudgetAlerts();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  };

  const calculateCosts = (metrics: UsageMetrics) => {
    const costs: CostBreakdown = {
      storage: metrics.storageUsed * PRICING.storage,
      compute: metrics.computeTime * PRICING.compute,
      apiCalls: metrics.apiCallsCount * PRICING.apiCalls,
      vectorOperations: metrics.vectorOperationsCount * PRICING.vectorOperations,
      total: 0
    };
    
    costs.total = costs.storage + costs.compute + costs.apiCalls + costs.vectorOperations;
    
    setCurrentCosts(costs);
    
    // Store in localStorage
    localStorage.setItem(`cost_breakdown_${currentTenant?.id}`, JSON.stringify(costs));
  };

  const trackDocumentProcessing = (fileSize: number) => {
    const newMetrics = {
      ...usageMetrics,
      documentsProcessed: usageMetrics.documentsProcessed + 1,
      storageUsed: usageMetrics.storageUsed + (fileSize / (1024 * 1024 * 1024)), // Convert to GB
      computeTime: usageMetrics.computeTime + 2, // Estimated 2 seconds per document
      vectorOperationsCount: usageMetrics.vectorOperationsCount + Math.ceil(fileSize / 1000) // Estimated chunks
    };
    
    setUsageMetrics(newMetrics);
    localStorage.setItem(`usage_metrics_${currentTenant?.id}`, JSON.stringify(newMetrics));
    calculateCosts(newMetrics);
  };

  const trackQuery = (queryComplexity: 'simple' | 'complex' = 'simple') => {
    const computeTime = queryComplexity === 'simple' ? 0.5 : 2;
    const vectorOps = queryComplexity === 'simple' ? 1 : 5;
    
    const newMetrics = {
      ...usageMetrics,
      queriesExecuted: usageMetrics.queriesExecuted + 1,
      computeTime: usageMetrics.computeTime + computeTime,
      apiCallsCount: usageMetrics.apiCallsCount + 1,
      vectorOperationsCount: usageMetrics.vectorOperationsCount + vectorOps
    };
    
    setUsageMetrics(newMetrics);
    localStorage.setItem(`usage_metrics_${currentTenant?.id}`, JSON.stringify(newMetrics));
    calculateCosts(newMetrics);
  };

  const checkBudgetAlerts = () => {
    const alerts: CostAlert[] = [];
    
    // Check if budget exceeded
    if (currentCosts.total > budgetLimit) {
      alerts.push({
        id: 'budget_exceeded',
        type: 'budget_exceeded',
        message: `Budget exceeded! Current costs: $${currentCosts.total.toFixed(2)} (Limit: $${budgetLimit})`,
        threshold: budgetLimit,
        currentValue: currentCosts.total,
        timestamp: new Date()
      });
    }
    
    // Check if approaching budget (80% threshold)
    else if (currentCosts.total > budgetLimit * 0.8) {
      alerts.push({
        id: 'approaching_budget',
        type: 'usage_spike',
        message: `Approaching budget limit: $${currentCosts.total.toFixed(2)} of $${budgetLimit}`,
        threshold: budgetLimit * 0.8,
        currentValue: currentCosts.total,
        timestamp: new Date()
      });
    }
    
    setCostAlerts(alerts);
  };

  const updateBudgetLimit = (newLimit: number) => {
    setBudgetLimit(newLimit);
    localStorage.setItem(`budget_limit_${currentTenant?.id}`, newLimit.toString());
    checkBudgetAlerts();
  };

  const resetUsageMetrics = () => {
    const resetMetrics: UsageMetrics = {
      documentsProcessed: 0,
      queriesExecuted: 0,
      storageUsed: 0,
      computeTime: 0,
      apiCallsCount: 0,
      vectorOperationsCount: 0
    };
    
    setUsageMetrics(resetMetrics);
    localStorage.setItem(`usage_metrics_${currentTenant?.id}`, JSON.stringify(resetMetrics));
    calculateCosts(resetMetrics);
    setCostAlerts([]);
  };

  const getCostProjection = (days: number = 30): number => {
    // Simple projection based on current daily usage
    const dailyCost = currentCosts.total; // Assuming current total is daily
    return dailyCost * days;
  };

  return {
    currentCosts,
    usageMetrics,
    costAlerts,
    budgetLimit,
    isTracking,
    trackDocumentProcessing,
    trackQuery,
    updateBudgetLimit,
    resetUsageMetrics,
    getCostProjection,
    utilizationPercentage: budgetLimit > 0 ? (currentCosts.total / budgetLimit) * 100 : 0
  };
};
