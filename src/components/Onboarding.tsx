import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  ArrowLeft, 
  SkipForward, 
  CheckCircle, 
  Play, 
  Github, 
  FileCode, 
  Brain, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Zap,
  Sparkles,
  Code2,
  Database,
  Shield,
  Users
} from 'lucide-react';
import { NeuroLintOrchestrator } from '@/lib/neurolint/orchestrator';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
}

export default function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [sampleCode, setSampleCode] = useState(`import React from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  return (
    <div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input 
              type="checkbox" 
              checked={todo.completed}
              onChange={() => {
                setTodos(todos.map(t => 
                  t.id === todo.id ? { ...t, completed: !t.completed } : t
                ));
              }}
            />
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}`);

  const [transformationResult, setTransformationResult] = useState<any>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const { toast } = useToast();

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const runSampleTransformation = useCallback(async () => {
    setIsTransforming(true);
    setTransformationResult(null);

    try {
      const result = await NeuroLintOrchestrator.transform(sampleCode, [3, 5, 6, 7], {
        verbose: true,
        dryRun: false,
      });

      setTransformationResult(result);
      toast({
        title: "Transformation Complete!",
        description: "See how NeuroLint improved your code with intelligent fixes.",
      });
    } catch (error) {
      toast({
        title: "Transformation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  }, [sampleCode, toast]);

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Transform",
      description: "Run code transformations with our powerful pipeline, including automatic fixes for Next.js and accessibility.",
      color: "text-blue-400"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Adaptive Learning (Layer 7)",
      description: "NeuroLint learns from your transformations, applying smarter fixes over time.",
      color: "text-purple-400"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Overview",
      description: "Track your transformation history and project metrics at a glance.",
      color: "text-green-400"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Billing & Usage",
      description: "Monitor your usage and upgrade to SuperGrok for higher quotas.",
      color: "text-yellow-400"
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Rule Management",
      description: "Review and customize learned transformation rules.",
      color: "text-orange-400"
    }
  ];

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to NeuroLint",
      description: "Transform Your Code with Confidence",
      component: (
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Code2 className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Welcome to NeuroLint
              </h1>
              <p className="text-xl text-zinc-300">
                Transform Your Code with Confidence
              </p>
            </div>
            
            <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              NeuroLint is an enterprise-grade code transformation tool that validates and optimizes your code using a layered pipeline, including adaptive pattern learning. Start improving your TypeScript, JavaScript, and Next.js code today!
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={handleNext} size="lg" className="bg-white hover:bg-gray-100 text-black">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={handleSkip} variant="outline" size="lg" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">
              <SkipForward className="mr-2 h-4 w-4" />
              Skip
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Discover Key Features",
      description: "Explore what NeuroLint can do for you",
      component: (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Discover Key Features</h2>
            <p className="text-zinc-400">Explore what NeuroLint can do for you</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`${feature.color}`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button onClick={handlePrevious} variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext} className="bg-white hover:bg-gray-100 text-black">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Try Your First Transformation",
      description: "Let's transform your first piece of code!",
      component: (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Try Your First Transformation</h2>
            <p className="text-zinc-400">Let's transform your first piece of code!</p>
          </div>

          <Tabs defaultValue="paste" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 border border-zinc-800">
              <TabsTrigger value="paste" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <FileCode className="mr-2 h-4 w-4" />
                Paste Code
              </TabsTrigger>
              <TabsTrigger value="github" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <Github className="mr-2 h-4 w-4" />
                GitHub Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Sample React Component</CardTitle>
                  <CardDescription className="text-zinc-400">
                    This component has several issues that NeuroLint can fix automatically
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sample-code" className="text-zinc-300">Code to Transform</Label>
                    <Textarea
                      id="sample-code"
                      value={sampleCode}
                      onChange={(e) => setSampleCode(e.target.value)}
                      className="min-h-[200px] font-mono text-sm bg-zinc-900/50 border-zinc-700 text-zinc-100"
                      placeholder="Paste your code here..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      Layer 3: Component Enhancement
                    </Badge>
                    <Badge variant="outline" className="border-purple-500 text-purple-400">
                      Layer 5: Next.js App Router
                    </Badge>
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      Layer 6: Testing & Validation
                    </Badge>
                    <Badge variant="outline" className="border-orange-500 text-orange-400">
                      Layer 7: Adaptive Learning
                    </Badge>
                  </div>

                  <Button 
                    onClick={runSampleTransformation}
                    disabled={isTransforming}
                    className="w-full bg-white hover:bg-gray-100 text-black"
                  >
                    {isTransforming ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Transforming...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Transformation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github" className="space-y-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Import from GitHub</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Connect your GitHub repository to transform entire projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="https://github.com/username/repository"
                      className="flex-1 bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    />
                    <Button className="bg-white hover:bg-gray-100 text-black">
                      <Github className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Import files from your GitHub repository to transform entire projects
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {transformationResult && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Transformation Results</span>
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  See how NeuroLint improved your code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-zinc-300">Original Code</Label>
                    <Textarea
                      value={sampleCode}
                      readOnly
                      className="min-h-[150px] font-mono text-sm bg-zinc-900/50 border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Transformed Code</Label>
                    <Textarea
                      value={transformationResult.finalCode}
                      readOnly
                      className="min-h-[150px] font-mono text-sm bg-zinc-900/50 border-zinc-700 text-zinc-100"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Key Improvements:</h4>
                  <div className="space-y-1">
                    {transformationResult.results?.map((result: any, index: number) => (
                      result.success && (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-zinc-300">
                            Layer {result.layerId}: {result.changeCount} improvements applied
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center">
            <Button onClick={handlePrevious} variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext} className="bg-white hover:bg-gray-100 text-black">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Your NeuroLint Plan",
      description: "Understand your usage and options",
      component: (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Your NeuroLint Plan</h2>
            <p className="text-zinc-400">Understand your usage and options</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Current Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Plan Type:</span>
                    <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                      Free Tier
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Transformations Remaining:</span>
                    <span className="text-white font-medium">50 / 100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Layer 7 Learning:</span>
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      Enabled
                    </Badge>
                  </div>
                </div>
                
                <Button 
                  onClick={() => window.open('https://x.ai/grok', '_blank')}
                  className="w-full bg-white hover:bg-gray-100 text-black"
                >
                  Upgrade to SuperGrok
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Data & Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-zinc-300 text-sm">Enterprise-grade security</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-zinc-300 text-sm">Control data retention in Settings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-zinc-300 text-sm">Opt out of pattern learning</span>
                  </div>
                </div>
                
                <p className="text-xs text-zinc-500">
                  Control how your transformation data is stored in Settings, including opting out of memory retention.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Multi-Platform Access</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">
                Run transformations on app.neurolint.dev, x.com, or our iOS/Android apps. Your progress and learned patterns sync across all platforms.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Button onClick={handlePrevious} variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={onComplete} className="bg-white hover:bg-gray-100 text-black">
              Finish & Enter Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-zinc-400">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2 bg-zinc-800" />
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStepData?.component}
        </div>
      </div>
    </div>
  );
}