import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';
import ProjectSelector from './ProjectSelector';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header className="border-b bg-gradient-to-r from-indigo-100 to-blue-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-extrabold text-transparent text-3xl sm:text-4xl bg-gradient-to-tr from-indigo-800 to-sky-500 bg-clip-text drop-shadow">
              RAG Chat Platform
            </h1>
            {user && <ProjectSelector />}
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-white rounded-lg shadow px-3 py-1">
                  <User className="h-5 w-5 text-sky-700" />
                  <span className="text-sm text-gray-700 font-medium">{user.email}</span>
                  <Badge variant="outline" className="border-sky-400 text-sky-600">Free Plan</Badge>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="transition-all hover:bg-red-100 text-red-600 border-red-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-indigo-600 hover:to-sky-600 transition-all shadow text-white"
                size="lg"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
};

export default Header;
