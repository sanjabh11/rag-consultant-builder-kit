
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Loader2, Info } from 'lucide-react';
import { CostBreakdown as CostBreakdownType } from '@/services/costEstimator';

interface CostBreakdownProps {
  breakdown: CostBreakdownType | null;
  isCalculating?: boolean;
  showDetails?: boolean;
  className?: string;
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({
  breakdown,
  isCalculating = false,
  showDetails = true,
  className = ''
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCostLevel = (total: number) => {
    if (total === 0) return { level: 'free', color: 'bg-green-100 text-green-800' };
    if (total < 100) return { level: 'low', color: 'bg-blue-100 text-blue-800' };
    if (total < 500) return { level: 'medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'high', color: 'bg-red-100 text-red-800' };
  };

  if (isCalculating) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Calculating Costs...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Estimation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete the project configuration to see cost estimates.
          </p>
        </CardContent>
      </Card>
    );
  }

  const costLevel = getCostLevel(breakdown.total);

  const costItems = [
    { label: 'GPU Infrastructure', value: breakdown.gpu_cost, tooltip: 'GPU compute costs (A100/H100 per hour)' },
    { label: 'Vector Database', value: breakdown.vector_db_cost, tooltip: 'ChromaDB, Weaviate, or Qdrant hosting' },
    { label: 'LLM Tokens', value: breakdown.llm_cost, tooltip: 'Cost per token for external LLM providers' },
    { label: 'Infrastructure', value: breakdown.infrastructure_cost, tooltip: 'Supabase, VMs, and K8s control plane' },
    { label: 'Storage', value: breakdown.storage_cost, tooltip: 'Document storage (S3/GCS)' },
    { label: 'Workflows', value: breakdown.workflow_cost, tooltip: 'Temporal.io orchestration costs' },
    { label: 'Bandwidth', value: breakdown.bandwidth_cost, tooltip: 'Data transfer and egress costs' },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monthly Cost Estimate
          </div>
          <Badge className={costLevel.color}>
            {costLevel.level === 'free' ? 'Free Tier' : 
             costLevel.level === 'low' ? 'Low Cost' :
             costLevel.level === 'medium' ? 'Medium Cost' : 'High Cost'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(breakdown.total)}
          </div>
          <p className="text-sm text-muted-foreground">per month</p>
        </div>

        {showDetails && (
          <>
            <Separator />
            <div className="space-y-3">
              {costItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.label}</span>
                    <div className="group relative">
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black text-white rounded whitespace-nowrap z-10">
                        {item.tooltip}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>

            {breakdown.total === 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  🎉 This configuration uses only free tier resources!
                </p>
              </div>
            )}

            {breakdown.total > 0 && breakdown.total < 50 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  💡 Great for pilots and small-scale deployments
                </p>
              </div>
            )}

            {breakdown.total >= 500 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800">
                  ⚡ Production-scale deployment with dedicated resources
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;
