import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PricingPlanType = 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';
export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime';
export type PricingModel = 'flat_rate' | 'per_user' | 'usage_based' | 'tiered' | 'hybrid';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  plan_type: PricingPlanType;
  pricing_model: PricingModel;
  base_price: number;
  currency: string;
  billing_period: BillingPeriod;
  is_active: boolean;
  is_public: boolean;
  features: {
    max_projects?: number;
    max_documents?: number;
    max_api_calls?: number;
    max_storage_gb?: number;
    support_level?: string;
    [key: string]: any;
  };
  metadata?: any;
}

export interface ResourcePricing {
  id: string;
  plan_id: string;
  resource_type: string;
  unit_name: string;
  price_per_unit: number;
  included_units: number;
  overage_price: number;
  max_units?: number;
}

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  plan?: PricingPlan;
  status: 'active' | 'cancelled' | 'expired' | 'suspended' | 'trialing';
  start_date: string;
  end_date?: string;
  trial_end_date?: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

export interface UsageData {
  resource_type: string;
  usage_count: number;
  usage_amount: number;
  usage_date: string;
}

interface PricingContextType {
  plans: PricingPlan[];
  currentSubscription: TenantSubscription | null;
  usage: UsageData[];
  loading: boolean;
  subscribeToPlan: (planId: string, options?: SubscribeOptions) => Promise<void>;
  cancelSubscription: (immediately?: boolean) => Promise<void>;
  getUsageCost: (startDate: string, endDate: string) => Promise<UsageCost[]>;
  trackUsage: (resourceType: string, count: number) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

interface SubscribeOptions {
  trialDays?: number;
  discountCode?: string;
}

interface UsageCost {
  resource_type: string;
  total_usage: number;
  included_units: number;
  overage_units: number;
  base_cost: number;
  overage_cost: number;
  total_cost: number;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider: React.FC<{ children: React.ReactNode; tenantId?: string }> = ({ 
  children, 
  tenantId 
}) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<TenantSubscription | null>(null);
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load pricing plans
  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('base_price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading pricing plans:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing plans",
        variant: "destructive",
      });
    }
  };

  // Load current subscription
  const loadSubscription = async () => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('tenant_subscriptions')
        .select(`
          *,
          plan:pricing_plans(*)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  // Load usage data
  const loadUsage = async () => {
    if (!tenantId) return;

    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('usage_date', startOfMonth.toISOString().split('T')[0])
        .order('usage_date', { ascending: false });

      if (error) throw error;
      setUsage(data || []);
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        loadPlans(),
        loadSubscription(),
        loadUsage(),
      ]);
      setLoading(false);
    };

    loadAll();
  }, [tenantId]);

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string, options?: SubscribeOptions) => {
    if (!tenantId) {
      toast({
        title: "Error",
        description: "No tenant selected",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate trial end date if applicable
      const trialEndDate = options?.trialDays
        ? new Date(Date.now() + options.trialDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Cancel existing subscription if any
      if (currentSubscription) {
        await cancelSubscription(true);
      }

      // Create new subscription
      const { error } = await supabase
        .from('tenant_subscriptions')
        .insert({
          tenant_id: tenantId,
          plan_id: planId,
          status: trialEndDate ? 'trialing' : 'active',
          trial_end_date: trialEndDate,
        });

      if (error) throw error;

      // Apply discount code if provided
      if (options?.discountCode) {
        await applyDiscountCode(options.discountCode);
      }

      toast({
        title: "Success",
        description: "Successfully subscribed to plan",
      });

      await loadSubscription();
    } catch (error: any) {
      console.error('Error subscribing to plan:', error);
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to subscribe to plan",
        variant: "destructive",
      });
    }
  };

  // Cancel subscription
  const cancelSubscription = async (immediately = false) => {
    if (!currentSubscription) return;

    try {
      if (immediately) {
        // Cancel immediately
        const { error } = await supabase
          .from('tenant_subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('id', currentSubscription.id);

        if (error) throw error;
      } else {
        // Cancel at period end
        const { error } = await supabase
          .from('tenant_subscriptions')
          .update({
            cancel_at_period_end: true,
          })
          .eq('id', currentSubscription.id);

        if (error) throw error;
      }

      toast({
        title: "Subscription Cancelled",
        description: immediately 
          ? "Your subscription has been cancelled"
          : "Your subscription will be cancelled at the end of the billing period",
      });

      await loadSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  // Apply discount code
  const applyDiscountCode = async (code: string) => {
    if (!tenantId || !currentSubscription) return;

    try {
      // Verify discount code
      const { data: discount, error: discountError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (discountError) throw new Error('Invalid discount code');

      // Check if discount is valid
      const now = new Date();
      const validFrom = new Date(discount.valid_from);
      const validUntil = discount.valid_until ? new Date(discount.valid_until) : null;

      if (now < validFrom || (validUntil && now > validUntil)) {
        throw new Error('Discount code has expired');
      }

      if (discount.max_uses && discount.used_count >= discount.max_uses) {
        throw new Error('Discount code usage limit reached');
      }

      // Apply discount
      const { error } = await supabase
        .from('applied_discounts')
        .insert({
          tenant_id: tenantId,
          subscription_id: currentSubscription.id,
          discount_code_id: discount.id,
        });

      if (error) throw error;

      // Increment usage count
      await supabase
        .from('discount_codes')
        .update({ used_count: discount.used_count + 1 })
        .eq('id', discount.id);

      toast({
        title: "Discount Applied",
        description: `${discount.description} has been applied to your subscription`,
      });
    } catch (error: any) {
      console.error('Error applying discount:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply discount code",
        variant: "destructive",
      });
    }
  };

  // Get usage cost calculation
  const getUsageCost = async (startDate: string, endDate: string): Promise<UsageCost[]> => {
    if (!tenantId) return [];

    try {
      const { data, error } = await supabase
        .rpc('calculate_usage_cost', {
          p_tenant_id: tenantId,
          p_billing_period_start: startDate,
          p_billing_period_end: endDate,
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error calculating usage cost:', error);
      return [];
    }
  };

  // Track usage
  const trackUsage = async (resourceType: string, count: number) => {
    if (!tenantId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('usage_tracking')
        .upsert({
          tenant_id: tenantId,
          subscription_id: currentSubscription?.id,
          resource_type: resourceType,
          usage_date: today,
          usage_count: count,
        }, {
          onConflict: 'tenant_id,resource_type,usage_date',
        });

      if (error) throw error;
      
      // Reload usage data
      await loadUsage();
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  const value = {
    plans,
    currentSubscription,
    usage,
    loading,
    subscribeToPlan,
    cancelSubscription,
    getUsageCost,
    trackUsage,
    refreshSubscription: loadSubscription,
  };

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};
