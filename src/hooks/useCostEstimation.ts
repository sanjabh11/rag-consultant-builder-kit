
import { useState, useEffect } from 'react';
import { costEstimator, CostBreakdown, CostEstimationInputs } from '@/services/costEstimator';

export const useCostEstimation = (inputs: CostEstimationInputs) => {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const calculateCost = () => {
      setIsCalculating(true);
      try {
        const breakdown = costEstimator.estimateTotal(inputs);
        setCostBreakdown(breakdown);
      } catch (error) {
        console.error('Cost estimation error:', error);
        setCostBreakdown(null);
      } finally {
        setIsCalculating(false);
      }
    };

    // Debounce calculation to avoid excessive updates
    const timeoutId = setTimeout(calculateCost, 300);
    return () => clearTimeout(timeoutId);
  }, [inputs]);

  return { costBreakdown, isCalculating };
};
