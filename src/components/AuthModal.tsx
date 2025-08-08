
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password);
      } else if (mode === 'reset') {
        await resetPassword(email);
      }
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Sign Up'}
            {mode === 'reset' && 'Reset Password'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' && 'Welcome back! Please sign in to your account.'}
            {mode === 'signup' && 'Create a new account to get started.'}
            {mode === 'reset' && 'Enter your email to reset your password.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Sign Up'}
            {mode === 'reset' && 'Send Reset Email'}
          </Button>
        </form>

        <div className="space-y-2 text-center">
          {mode === 'signin' && (
            <>
              <Button
                variant="link"
                onClick={() => setMode('signup')}
                className="text-sm"
              >
                Don't have an account? Sign up
              </Button>
              <Button
                variant="link"
                onClick={() => setMode('reset')}
                className="text-sm"
              >
                Forgot password?
              </Button>
            </>
          )}
          
          {mode === 'signup' && (
            <Button
              variant="link"
              onClick={() => setMode('signin')}
              className="text-sm"
            >
              Already have an account? Sign in
            </Button>
          )}
          
          {mode === 'reset' && (
            <Button
              variant="link"
              onClick={() => setMode('signin')}
              className="text-sm"
            >
              Back to sign in
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
