
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Sparkles, Shield, Zap, Brain, ChevronDown } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation on mount
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-width gradient background with SVG pattern */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Enhanced glassmorphic overlay with multiple blur layers */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-0" />

      {/* Main hero content with premium animations */}
      <div className={`relative z-10 flex flex-col items-center justify-center w-full px-4 py-20 md:py-32 lg:py-40 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } fade-in-section`}>

        {/* Premium serif typography with gradient effects */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-extrabold text-white drop-shadow-2xl mb-6 tracking-tight leading-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
              AI-Powered
            </span>
            <span className="block text-white">
              Enterprise Platform
            </span>
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-8 rounded-full"></div>

          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-12 max-w-4xl text-center font-light leading-relaxed px-4">
            Build, deploy, and manage sophisticated AI applications with enterprise-grade security,
            compliance, and performance monitoring.
          </p>
        </div>

        {/* Enhanced CTA buttons with hover effects */}
        <div className="flex flex-col sm:flex-row gap-6 mb-16">
          {user ? (
            <Link to="/ai-projects">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border-0"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Access Your Projects
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border-0"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Start Building Today
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Button>
            </Link>
          )}

          <Link to="/enterprise">
            <Button
              size="lg"
              variant="outline"
              className="group border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg rounded-full backdrop-blur-sm hover:border-white/50 transform hover:scale-105 transition-all duration-300"
            >
              <Shield className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              Enterprise Solutions
            </Button>
          </Link>
        </div>

        {/* Premium feature highlights with glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mb-16">
          <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <div className="text-blue-300 mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-blue-200 transition-colors duration-300">
              Rapid Deployment
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Deploy AI models in minutes with our automated pipelines and infrastructure. No complex setup required.
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <div className="text-purple-300 mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-purple-200 transition-colors duration-300">
              Enterprise Security
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Bank-grade encryption, compliance frameworks, and multi-tenant isolation. SOC 2 and HIPAA ready.
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <div className="text-green-300 mb-4 group-hover:scale-110 transition-transform duration-300">
              <Brain className="h-8 w-8" />
            </div>
            <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-green-200 transition-colors duration-300">
              Real-time Analytics
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Comprehensive monitoring, predictive insights, and performance optimization for enterprise scale.
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center mb-12">
          <p className="text-white/70 text-sm mb-4">Trusted by Enterprise Teams Worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Shield className="h-4 w-4" />
              SOC 2 Compliant
            </div>
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Brain className="h-4 w-4" />
              AI-Powered
            </div>
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Zap className="h-4 w-4" />
              Enterprise Scale
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center z-20 pb-6">
        <div className="hidden md:block bg-white/10 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-lg border border-white/20 text-white text-sm font-serif text-center hover:bg-white/15 transition-all duration-300">
          <span className="font-bold text-lg">✨</span> AI-powered. Secure. Multi-tenant. <span className="font-bold text-blue-300">Production Ready.</span>
        </div>
      </div>

      {/* Animated scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center hover:border-white/80 transition-colors duration-300">
          <ChevronDown className="w-4 h-4 text-white/70 mt-2 animate-pulse" />
        </div>
      </div>

      {/* Floating gradient orbs for premium feel */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
    </div>
  );
};

export default Index;
