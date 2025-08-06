
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center hero-bg">
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-32 md:py-48 fade-in-section">
        <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-white drop-shadow-lg mb-6 tracking-tight text-center hero-title">
          Welcome to the AI Platform
        </h1>
        <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl text-center font-light hero-desc">
          Build, manage, and deploy your AI projects with ease.
        </p>
        {user ? (
          <Link to="/ai-projects">
            <Button size="lg" className="hero-btn">Go to Your Projects</Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button size="lg" className="hero-btn">Get Started</Button>
          </Link>
        )}
      </div>
      {/* Decorative glassmorphic card at bottom for mobile */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center md:hidden z-20 pb-6">
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 shadow-lg border border-white/30 text-white text-sm font-serif text-center">
          AI-powered. Secure. Multi-tenant. <span className="font-bold">Production Ready.</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
