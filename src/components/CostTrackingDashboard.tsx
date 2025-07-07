
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  Database, 
  Zap, 
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useCostTracking } from '@/hooks/useCostTracking';
import { useState } from 'react';

const CostTrackingDashboard: React.FC = () => {
  const {
    currentCosts,
    usageMetrics,
    costAlerts,
    budgetLimit,
    updateBudgetLimit,
    resetUsageMetrics,
    getCostProjection,
    utilizationPercentage
  } = useCostTracking();

  const [newBudgetLimit, setNewBudgetLimit] = useState(budgetLimit.toString());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const getBudgetStatus = () => {
    if (utilizationPercentage >= 100) return { color: 'bg-red-500', status: 'Over Budget' };
    if (utilizationPercentage >= 80) return { color: 'bg-orange-500', status: 'Near Limit' };
    if (utilizationPercentage >= 60) return { color: 'bg-yellow-500', status: 'Moderate' };
    return { color: 'bg-green-500', status: 'Within Budget' };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {costAlerts.length > 0 && (
        <div className="space-y-2">
          {costAlerts.map((alert) => (
            <Alert key={alert.id} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(currentCosts.total)}
              </div>
              <div className="text-sm text-gray-600">Current Spend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(budgetLimit)}
              </div>
              <div className="text-sm text-gray-600">Budget Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(getCostProjection())}
              </div>
              <div className="text-sm text-gray-600">30-Day Projection</div>
            </div>
            <div className="text-center">
              <Badge className={`${budgetStatus.color} text-white`}>
                {budgetStatus.status}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Status</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Utilization</span>
              <span>{utilizationPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(utilizationPercentage, 100)} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Database className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">{formatCurrency(currentCosts.storage)}</div>
              <div className="text-sm text-gray-600">Storage</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Zap className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">{formatCurrency(currentCosts.compute)}</div>
              <div className="text-sm text-gray-600">Compute</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">{formatCurrency(currentCosts.apiCalls)}</div>
              <div className="text-sm text-gray-600">API Calls</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Settings className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="font-semibold">{formatCurrency(currentCosts.vectorOperations)}</div>
              <div className="text-sm text-gray-600">Vector Ops</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{usageMetrics.documentsProcessed}</div>
              <div className="text-sm text-gray-600">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{usageMetrics.queriesExecuted}</div>
              <div className="text-sm text-gray-600">Queries Executed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{usageMetrics.storageUsed.toFixed(2)} GB</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="budget-limit">Monthly Budget Limit</Label>
              <Input
                id="budget-limit"
                type="number"
                value={newBudgetLimit}
                onChange={(e) => setNewBudgetLimit(e.target.value)}
                placeholder="Enter budget limit"
              />
            </div>
            <Button onClick={() => updateBudgetLimit(parseFloat(newBudgetLimit))}>
              Update Budget
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={resetUsageMetrics}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostTrackingDashboard;
