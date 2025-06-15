
import React from 'react';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  sidebar,
  header
}) => {
  const { isMobile, getResponsiveConfig } = useMobileOptimization();
  const config = getResponsiveConfig();

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        {header && (
          <header className="sticky top-0 z-50 bg-background border-b px-4 py-2">
            <div className="flex items-center justify-between">
              {header}
              {sidebar && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    {sidebar}
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </header>
        )}
        
        <main className="flex-1 p-4 pb-safe">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {sidebar && config.showSidebar && (
        <aside className="w-64 border-r bg-muted/50">
          {sidebar}
        </aside>
      )}
      
      <div className="flex-1 flex flex-col">
        {header && (
          <header className="border-b px-6 py-4">
            {header}
          </header>
        )}
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;
