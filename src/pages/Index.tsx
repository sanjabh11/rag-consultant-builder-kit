
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageSquare, Workflow, Settings, Database, Zap, Shield, BarChart3, Building, Scale, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Multi-LLM Support",
      description: "Deploy private LLaMA 3 70B or integrate with Gemini, Claude, and Mistral",
      status: "Ready"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "RAG Pipeline",
      description: "Vector search with ChromaDB, Weaviate, or Qdrant for enterprise documents",
      status: "Active"
    },
    {
      icon: <Workflow className="h-8 w-8" />,
      title: "Workflow Automation",
      description: "Custom n8n workflows for document ingestion and processing",
      status: "Beta"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "HIPAA, GDPR, SOX compliance with private deployment options",
      status: "Secure"
    }
  ];

  const verticals = [
    { name: "Human Resources", icon: "👥", count: 12 },
    { name: "Finance", icon: "💰", count: 8 },
    { name: "Legal", icon: "⚖️", count: 15 },
    { name: "Healthcare", icon: "🏥", count: 6 },
    { name: "Manufacturing", icon: "🏭", count: 9 },
    { name: "Sales", icon: "📈", count: 11 }
  ];

  const cookbookComparison = [
    {
      aspect: "Domain & Objective",
      lawFirm: "Build a private legal analyst: ingest case law, filings, contracts; answer Qs; summarize docs.",
      healthcare: "Build a private clinical assistant: ingest medical records, research papers; answer clinical Qs; summarize patient notes.",
      hrPolicies: "Build a private HR assistant: ingest company handbooks, policies; answer employee Qs; summarize benefits and procedures.",
      explanation: "Choosing a 'theme' for your helper—like deciding if you're cooking Italian (law), French (healthcare), or Mexican (HR) dishes."
    },
    {
      aspect: "Key Fields (Spec Inputs)",
      lawFirm: "domain=legal, data_sources=['case_law_DB','contracts_drive'], throughput=100, compliance_flags=['privilege_law']",
      healthcare: "domain=healthcare, data_sources=['EHR_api','research_PDFs'], throughput=50, compliance_flags=['HIPAA']",
      hrPolicies: "domain=hr, data_sources=['hr_handbooks','payroll_CSV'], throughput=200, compliance_flags=['GDPR']",
      explanation: "Recipe ingredients—you tell the app what you need, just like saying 'I need flour, sugar, and eggs.'"
    },
    {
      aspect: "Phase I Prompt (SpecBuilder)",
      lawFirm: "Asks: 'Which legal docs? Why?' Clarifies privilege concerns.",
      healthcare: "Asks: 'Which patient data sources? Any PHI fields?' Clarifies HIPAA needs.",
      hrPolicies: "Asks: 'Which HR policies? Any personal data?' Clarifies GDPR rules.",
      explanation: "Friendly quiz—the helper asks simple questions: 'Do you need pizza or pasta?'"
    },
    {
      aspect: "Generated Services",
      lawFirm: "Legal-LLM-API, ChromaDB-legal, n8n-legal-flows",
      healthcare: "Clinical-LLM-API, ChromaDB-health, n8n-health-flows",
      hrPolicies: "HR-LLM-API, ChromaDB-hr, n8n-hr-flows",
      explanation: "Kitchen layout plan—where you put the oven, table, and fridge."
    },
    {
      aspect: "Infrastructure",
      lawFirm: "Dual A100 GPU nodes on CoreWeave, private network, ChromaDB container, vLLM service",
      healthcare: "GPU nodes for model inference, VPC in private cloud region, ChromaDB with encrypted volumes",
      hrPolicies: "Standard CPU nodes, VPC or on-prem servers, ChromaDB container, smaller model footprint",
      explanation: "Shopping list + instructions—'Buy two big ovens, one fridge, and set timers.'"
    }
  ];

  const enterpriseUseCases = [
    {
      title: "Legal – Case/Contract Analysis",
      description: "Summarize contracts, precedents, filings; answer complex case-law queries. Maintains confidentiality of client/case data; on-prem ensures compliance with privilege laws.",
      icon: <Scale className="h-6 w-6" />,
      cost: "~$1,200/mo"
    },
    {
      title: "Healthcare – Clinical Assistant",
      description: "Summarizes clinical notes, trial data, medical literature. Strict HIPAA/Regulatory compliance; fully private deployment is essential.",
      icon: <Heart className="h-6 w-6" />,
      cost: "Higher GPU + compliance audit cost"
    },
    {
      title: "HR – Policy & Employee Q&A",
      description: "Internal HR assistant: answers benefits/policy questions, onboards staff with summarized manuals. Secures personal employee data.",
      icon: <Users className="h-6 w-6" />,
      cost: "Lower GPU cost (smaller model)"
    },
    {
      title: "Finance – Reports & Auditing",
      description: "Interpret earnings reports, audit logs, compliance rules. Provides decision support to CFO teams while keeping sensitive data in-house.",
      icon: <BarChart3 className="h-6 w-6" />,
      cost: "~$800/mo"
    },
    {
      title: "Customer Support – Private KB",
      description: "AI-powered knowledge base using company's internal docs. Responds to support tickets using private data without customer info leaks.",
      icon: <MessageSquare className="h-6 w-6" />,
      cost: "~$600/mo"
    },
    {
      title: "R&D/Engineering – Technical Docs",
      description: "Search and summarize patents, design docs, and technical specs. Protects IP by hosting all R&D knowledge internally.",
      icon: <Building className="h-6 w-6" />,
      cost: "~$1,000/mo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            ScoutAI Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Enterprise AI consultant platform with private LLM deployment, 
            multi-vertical RAG pipelines, and no-code workflow automation for every industry.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/ai-projects">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Brain className="h-5 w-5 mr-2" />
                Start Building
              </Button>
            </Link>
            <Link to="/workflows">
              <Button size="lg" variant="outline">
                <Workflow className="h-5 w-5 mr-2" />
                View Workflows
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-fit">
                  <div className="text-blue-600">{feature.icon}</div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">
                  {feature.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Information Tabs */}
        <div className="mb-16">
          <Tabs defaultValue="cookbook" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cookbook">Cookbook Approach</TabsTrigger>
              <TabsTrigger value="usecases">Enterprise Use Cases</TabsTrigger>
              <TabsTrigger value="verticals">Supported Verticals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cookbook" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Domain-Specific Implementation Cookbook</CardTitle>
                  <p className="text-muted-foreground">
                    See how our platform adapts to different industries with the same powerful framework
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Aspect</th>
                          <th className="text-left p-3 font-semibold text-blue-600">Law Firm</th>
                          <th className="text-left p-3 font-semibold text-green-600">Healthcare</th>
                          <th className="text-left p-3 font-semibold text-purple-600">HR Policies</th>
                          <th className="text-left p-3 font-semibold text-orange-600">Simple Explanation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cookbookComparison.map((row, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{row.aspect}</td>
                            <td className="p-3 text-sm">{row.lawFirm}</td>
                            <td className="p-3 text-sm">{row.healthcare}</td>
                            <td className="p-3 text-sm">{row.hrPolicies}</td>
                            <td className="p-3 text-sm italic text-gray-600">{row.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usecases" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enterpriseUseCases.map((useCase, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                          <div className="text-blue-600">{useCase.icon}</div>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{useCase.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">{useCase.cost}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{useCase.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="verticals" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {verticals.map((vertical, index) => (
                  <Card key={index} className="text-center hover:shadow-md transition-shadow border-0 bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="text-3xl mb-2">{vertical.icon}</div>
                      <div className="font-medium text-sm mb-1">{vertical.name}</div>
                      <Badge variant="outline" className="text-xs">
                        {vertical.count} templates
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link to="/ai-projects">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100">Create and manage AI consultant projects across verticals</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/workflows">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-100">Build custom automation workflows with drag-and-drop</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/llm-config">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  LLM Config
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-100">Configure LLM providers and RAG settings</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border-0 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">99.2%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">284ms</div>
              <div className="text-sm text-gray-600">Avg Latency</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">2.4M</div>
              <div className="text-sm text-gray-600">Tokens Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">15+</div>
              <div className="text-sm text-gray-600">Verticals</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
