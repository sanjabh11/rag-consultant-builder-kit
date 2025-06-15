
import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Layout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">AI Platform</Link>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/ai-projects">
                  <Button variant="ghost">My Projects</Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="ghost">Analytics</Button>
                </Link>
                <Link to="/subscription">
                  <Button variant="ghost">Subscription</Button>
                </Link>
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
