
import { useState, useEffect } from 'react';

interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: {
    width: number;
    height: number;
  };
  touchSupported: boolean;
}

export const useMobileOptimization = () => {
  const [mobileState, setMobileState] = useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    screenSize: { width: 0, height: 0 },
    touchSupported: false
  });

  useEffect(() => {
    const updateMobileState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;
      
      setMobileState({
        isMobile,
        isTablet,
        isDesktop,
        orientation: width > height ? 'landscape' : 'portrait',
        screenSize: { width, height },
        touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      });
    };

    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    window.addEventListener('orientationchange', updateMobileState);

    return () => {
      window.removeEventListener('resize', updateMobileState);
      window.removeEventListener('orientationchange', updateMobileState);
    };
  }, []);

  const getMobileClasses = (baseClasses: string) => {
    let classes = baseClasses;
    
    if (mobileState.isMobile) {
      classes += ' mobile-optimized';
    }
    
    if (mobileState.isTablet) {
      classes += ' tablet-optimized';
    }
    
    if (mobileState.touchSupported) {
      classes += ' touch-optimized';
    }
    
    return classes;
  };

  const getResponsiveConfig = () => ({
    itemsPerRow: mobileState.isMobile ? 1 : mobileState.isTablet ? 2 : 3,
    showSidebar: !mobileState.isMobile,
    compactMode: mobileState.isMobile,
    touchTargetSize: mobileState.touchSupported ? 44 : 32
  });

  return {
    ...mobileState,
    getMobileClasses,
    getResponsiveConfig
  };
};
