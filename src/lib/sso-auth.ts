import { supabase } from '@/integrations/supabase/client';

export interface SSOProvider {
  id: string;
  provider_type: 'google' | 'github' | 'okta' | 'azure_ad';
  provider_name: string;
  client_id: string;
  authorization_url: string;
  token_url: string;
  scopes: string[];
  is_active: boolean;
}

export class SSOAuthHandler {
  /**
   * Get available SSO providers for a tenant
   */
  static async getProviders(tenantId: string): Promise<SSOProvider[]> {
    const { data, error } = await supabase
      .from('sso_providers')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching SSO providers:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Initiate SSO login flow
   */
  static async initiateSSO(providerId: string): Promise<void> {
    // Get provider details
    const { data: provider, error } = await supabase
      .from('sso_providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (error || !provider) {
      throw new Error('Provider not found');
    }

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: provider.client_id,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'code',
      scope: provider.scopes.join(' '),
      state: providerId, // Pass provider ID in state for callback
    });

    // Provider-specific parameters
    if (provider.provider_type === 'google') {
      params.append('access_type', 'offline');
      params.append('prompt', 'consent');
    } else if (provider.provider_type === 'github') {
      params.append('allow_signup', 'true');
    }

    // Redirect to OAuth provider
    window.location.href = `${provider.authorization_url}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  static async handleCallback(code: string, state: string): Promise<{ user: any; error: any }> {
    try {
      // Exchange code for token using edge function
      const response = await fetch('/api/auth/sso-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          provider_id: state,
          redirect_uri: `${window.location.origin}/auth/callback`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'SSO authentication failed');
      }

      // Sign in to Supabase with the returned token
      const { data, error } = await supabase.auth.signInWithPassword({
        email: result.email,
        password: result.temp_password, // Edge function creates a temp session
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      console.error('SSO callback error:', error);
      return { user: null, error };
    }
  }

  /**
   * Link existing account with SSO provider
   */
  static async linkProvider(userId: string, providerId: string): Promise<void> {
    const { error } = await supabase
      .from('user_sso_links')
      .insert({
        user_id: userId,
        provider_id: providerId,
        linked_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error('Failed to link SSO provider');
    }
  }

  /**
   * Unlink SSO provider from account
   */
  static async unlinkProvider(userId: string, providerId: string): Promise<void> {
    const { error } = await supabase
      .from('user_sso_links')
      .delete()
      .eq('user_id', userId)
      .eq('provider_id', providerId);

    if (error) {
      throw new Error('Failed to unlink SSO provider');
    }
  }

  /**
   * Get linked SSO providers for a user
   */
  static async getLinkedProviders(userId: string): Promise<SSOProvider[]> {
    const { data, error } = await supabase
      .from('user_sso_links')
      .select(`
        provider:sso_providers (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching linked providers:', error);
      return [];
    }

    return data?.map(item => item.provider).filter(Boolean) || [];
  }
}
