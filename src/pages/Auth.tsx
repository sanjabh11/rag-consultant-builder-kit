
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signInAsGuest } = useAuth();

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
  <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center hero-bg">
    {/* Glassmorphic overlay */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-0" />
    <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-12 md:py-24 fade-in-section">
      <div className="w-full max-w-md p-8 md:p-10 space-y-8 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 glass-card">
        <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-white text-center mb-6 tracking-tight drop-shadow-lg">Sign In to Your Account</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white font-serif">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="glass-input" />
          </div>
          <div>
            <Label htmlFor="password" className="text-white font-serif">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="glass-input" />
          </div>
        </div>
        <div className="flex space-x-4">
          <Button onClick={handleLogin} disabled={isSubmitting} className="w-full glass-btn">
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
          <Button onClick={handleSignUp} disabled={isSubmitting} variant="outline" className="w-full glass-btn-outline">
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </div>
        <Button
          onClick={async () => {
            setIsSubmitting(true);
            await signInAsGuest();
            setIsSubmitting(false);
            navigate('/ai-projects');
          }}
          disabled={isSubmitting}
          variant="outline"
          className="w-full mt-4 glass-btn-outline"
        >
          Continue as Guest
        </Button>
      </div>
    </div>
  </div>
);
};

export default Auth;
