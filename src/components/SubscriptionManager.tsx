
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

interface SubscriptionData {
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  usage: {
    apiCalls: number;
    storage: number;
    documents: number;
  };
  limits: {
    apiCalls: number;
    storage: number;
    documents: number;
  };
}

const TIER_FEATURES = {
  free: { apiCalls: 100, storage: 100, documents: 10, price: 0 },
  basic: { apiCalls: 1000, storage: 1000, documents: 100, price: 9.99 },
  pro: { apiCalls: 10000, storage: 10000, documents: 1000, price: 29.99 },
  enterprise: { apiCalls: 100000, storage: 100000, documents: 10000, price: 99.99 },
};

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-subscription-details');
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { tier },
      });
      if (error) throw error;
      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const handleManageBilling = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session');
      if (error) throw error;
      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading subscription details...</div>;
  }

  if (!subscription) {
    return <div>No subscription data available</div>;
  }

  const usagePercentage = (used: number, limit: number) => (used / limit) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                {subscription.tier.toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {subscription.status === 'active' 
                  ? `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : 'Subscription inactive'
                }
              </p>
            </div>
            <Button onClick={handleManageBilling} variant="outline">
              Manage Billing
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>API Calls</span>
                <span>{subscription.usage.apiCalls} / {subscription.limits.apiCalls}</span>
              </div>
              <Progress value={usagePercentage(subscription.usage.apiCalls, subscription.limits.apiCalls)} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Storage (MB)</span>
                <span>{subscription.usage.storage} / {subscription.limits.storage}</span>
              </div>
              <Progress value={usagePercentage(subscription.usage.storage, subscription.limits.storage)} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Documents</span>
                <span>{subscription.usage.documents} / {subscription.limits.documents}</span>
              </div>
              <Progress value={usagePercentage(subscription.usage.documents, subscription.limits.documents)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(TIER_FEATURES).map(([tier, features]) => (
          <Card key={tier} className={subscription.tier === tier ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">{tier.toUpperCase()}</CardTitle>
              <div className="text-2xl font-bold">${features.price}/month</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>{features.apiCalls.toLocaleString()} API calls</li>
                <li>{features.storage} MB storage</li>
                <li>{features.documents} documents</li>
              </ul>
              {subscription.tier !== tier && (
                <Button 
                  className="w-full mt-4" 
                  onClick={() => handleUpgrade(tier)}
                  variant={tier === 'pro' ? 'default' : 'outline'}
                >
                  {features.price > TIER_FEATURES[subscription.tier].price ? 'Upgrade' : 'Downgrade'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionManager;
