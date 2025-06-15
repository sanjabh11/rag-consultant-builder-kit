
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UsageData {
  apiCalls: {
    current: number;
    limit: number;
    resetDate: string;
  };
  storage: {
    current: number;
    limit: number;
  };
  documents: {
    current: number;
    limit: number;
  };
  tokens: {
    current: number;
    limit: number;
  };
}

export const useUsageTracking = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsage();
      // Set up real-time subscription for usage updates
      const subscription = supabase
        .channel('usage_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchUsage();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-usage-stats');
      if (error) throw error;
      setUsage(data);
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackUsage = async (type: 'api_call' | 'storage' | 'document' | 'tokens', amount: number) => {
    try {
      const { error } = await supabase.functions.invoke('track-usage', {
        body: { type, amount },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  const checkLimit = (type: keyof UsageData): boolean => {
    if (!usage) return false;
    return usage[type].current >= usage[type].limit;
  };

  const getUsagePercentage = (type: keyof UsageData): number => {
    if (!usage) return 0;
    return (usage[type].current / usage[type].limit) * 100;
  };

  return {
    usage,
    isLoading,
    trackUsage,
    checkLimit,
    getUsagePercentage,
    refreshUsage: fetchUsage,
  };
};
