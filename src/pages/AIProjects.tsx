
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAIProjects } from "@/hooks/useAIProjects";
import { PlusCircle } from "lucide-react";
import ProjectCreationWizard from "@/components/ProjectCreationWizard";
import { useState } from "react";

const AIProjects = () => {
  const { projects, isLoading, error } = useAIProjects();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Projects</h1>
        <Button onClick={() => setIsWizardOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {isLoading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      
      {!isLoading && !error && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Domain: {project.domain}</p>
                <p>Status: <span className="capitalize">{project.status}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && projects && projects.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No projects yet.</p>
          <p className="text-gray-500">Click "New Project" to get started.</p>
        </div>
      )}

      <ProjectCreationWizard
        isOpen={isWizardOpen}
        onOpenChange={setIsWizardOpen}
      />
    </div>
  );
};

export default AIProjects;
