
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight, FileText, MessageSquare, Settings } from 'lucide-react';

interface OnboardingGuideProps {
  projectId: string;
  documentCount: number;
  hasCompletedChat: boolean;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  projectId,
  documentCount,
  hasCompletedChat
}) => {
  const [dismissed, setDismissed] = useState(false);

  const steps = [
    {
      id: 'create-project',
      title: 'Create your first project',
      description: 'Set up a project to organize your documents',
      completed: !!projectId,
      icon: Settings
    },
    {
      id: 'upload-documents',
      title: 'Upload documents',
      description: 'Add documents to build your knowledge base',
      completed: documentCount > 0,
      icon: FileText
    },
    {
      id: 'start-chatting',
      title: 'Ask your first question',
      description: 'Start chatting with your documents using AI',
      completed: hasCompletedChat,
      icon: MessageSquare
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const isComplete = completedSteps === steps.length;

  if (dismissed || isComplete) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            Getting Started Guide
            <Badge variant="secondary">{completedSteps}/{steps.length} completed</Badge>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDismissed(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            Dismiss
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  step.completed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <Icon className={`h-5 w-5 ${step.completed ? 'text-green-600' : 'text-gray-600'}`} />
                <div className="flex-1">
                  <h4 className={`font-medium ${step.completed ? 'text-green-900' : 'text-gray-900'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm ${step.completed ? 'text-green-700' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                </div>
                {!step.completed && index === completedSteps && (
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingGuide;
