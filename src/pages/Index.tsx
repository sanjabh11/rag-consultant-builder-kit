
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to the AI Platform</h1>
      <p className="text-lg text-gray-600 mb-8">
        Build, manage, and deploy your AI projects with ease.
      </p>
      {user ? (
        <Link to="/ai-projects">
          <Button size="lg">Go to Your Projects</Button>
        </Link>
      ) : (
        <Link to="/auth">
          <Button size="lg">Get Started</Button>
        </Link>
      )}
    </div>
  );
};

export default Index;
