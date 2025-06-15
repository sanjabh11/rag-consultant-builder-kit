
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

interface RateLimitState {
  requests: number[];
  blocked: boolean;
  resetTime?: number;
}

export const useRateLimiting = (config: RateLimitConfig) => {
  const { maxRequests, windowMs, identifier = 'default' } = config;
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({ requests: [], blocked: false });
  const { toast } = useToast();

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    // Get existing state from localStorage
    const stored = localStorage.getItem(key);
    const currentState: RateLimitState = stored ? JSON.parse(stored) : { requests: [], blocked: false };
    
    // Remove expired requests
    const validRequests = currentState.requests.filter(requestTime => 
      now - requestTime < windowMs
    );

    // Check if we're still blocked
    if (currentState.blocked && currentState.resetTime && now < currentState.resetTime) {
      return false;
    }

    // Check if we would exceed the limit
    if (validRequests.length >= maxRequests) {
      const resetTime = now + windowMs;
      const newState: RateLimitState = {
        requests: validRequests,
        blocked: true,
        resetTime
      };
      
      localStorage.setItem(key, JSON.stringify(newState));
      setRateLimitState(newState);
      
      toast({
        title: "Rate limit exceeded",
        description: `Too many requests. Please wait ${Math.ceil(windowMs / 1000)} seconds before trying again.`,
        variant: "destructive",
      });
      
      return false;
    }

    // Add current request and update state
    const newRequests = [...validRequests, now];
    const newState: RateLimitState = {
      requests: newRequests,
      blocked: false
    };
    
    localStorage.setItem(key, JSON.stringify(newState));
    setRateLimitState(newState);
    
    return true;
  }, [maxRequests, windowMs, identifier, toast]);

  const getRemainingRequests = useCallback((): number => {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    const stored = localStorage.getItem(key);
    const currentState: RateLimitState = stored ? JSON.parse(stored) : { requests: [], blocked: false };
    
    const validRequests = currentState.requests.filter(requestTime => 
      now - requestTime < windowMs
    );
    
    return Math.max(0, maxRequests - validRequests.length);
  }, [maxRequests, windowMs, identifier]);

  const resetRateLimit = useCallback(() => {
    const key = `rate_limit_${identifier}`;
    localStorage.removeItem(key);
    setRateLimitState({ requests: [], blocked: false });
  }, [identifier]);

  return {
    checkRateLimit,
    getRemainingRequests,
    resetRateLimit,
    isBlocked: rateLimitState.blocked,
    remainingRequests: getRemainingRequests(),
  };
};

// Predefined rate limit configs
export const RATE_LIMITS = {
  API_CALLS: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
  DOCUMENT_UPLOAD: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  CHAT_MESSAGES: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 per minute
  LOGIN_ATTEMPTS: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
};
