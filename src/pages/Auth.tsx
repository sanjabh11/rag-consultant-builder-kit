
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Error signing in", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Signed in successfully!" });
      navigate('/ai-projects');
    }
    setIsSubmitting(false);
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/ai-projects`
      }
    });
    if (error) {
      toast({ title: "Error signing up", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email for the confirmation link!" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Welcome</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div className="flex space-x-4">
          <Button onClick={handleLogin} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
          <Button onClick={handleSignUp} disabled={isSubmitting} variant="outline" className="w-full">
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
