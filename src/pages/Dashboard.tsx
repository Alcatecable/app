
import React, { useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Code2, 
  Github, 
  Zap, 
  FileText, 
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { NeuroLintOrchestrator, LayerExecutionResult } from '@/lib/neurolint';
import { useAuth } from '@/contexts/AuthContext';
import { paypalService } from '@/lib/paypal/paypal-service';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Main states
  const [code, setCode] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedLayers, setSelectedLayers] = useState<number[]>([1, 2, 3, 4]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<LayerExecutionResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // User subscription state
  const [userPlan, setUserPlan] = useState({
    plan_name: 'Free',
    transformation_limit: 25,
    current_usage: 5
  });

  // Handle code transformation
  const handleTransform = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "No code provided",
        description: "Please paste some code or upload a file first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check usage limits
      if (userPlan.current_usage >= userPlan.transformation_limit) {
        toast({
          title: "Usage limit reached",
          description: "You've reached your monthly transformation limit. Upgrade to continue.",
          variant: "destructive"
        });
        return;
      }

      const result = await NeuroLintOrchestrator.transform(code, selectedLayers, {
        verbose: true,
        dryRun: false
      });

      setResults(result);
      
      // Update usage count
      setUserPlan(prev => ({
        ...prev,
        current_usage: prev.current_usage + 1
      }));

      toast({
        title: "Transformation completed!",
        description: `Successfully processed ${result.successfulLayers} out of ${selectedLayers.length} layers.`,
      });

    } catch (error) {
      console.error('Transformation failed:', error);
      toast({
        title: "Transformation failed",
        description: "An error occurred while processing your code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [code, selectedLayers, userPlan, toast]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JavaScript, TypeScript, JSON, or Markdown file.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 1MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      toast({
        title: "File uploaded",
        description: `Successfully loaded ${file.name}`,
      });
    };
    reader.readAsText(file);
  }, [toast]);

  // Handle GitHub import
  const handleGithubImport = useCallback(async () => {
    if (!githubUrl.trim()) {
      toast({
        title: "No GitHub URL provided",
        description: "Please enter a GitHub repository URL.",
        variant: "destructive"
      });
      return;
    }

    // Basic GitHub URL validation
    const githubPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+(\/.*)?$/;
    if (!githubPattern.test(githubUrl)) {
      toast({
        title: "Invalid GitHub URL",
        description: "Please enter a valid GitHub repository URL.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Extract owner and repo from URL
      const urlParts = githubUrl.replace('https://github.com/', '').split('/');
      const owner = urlParts[0];
      const repo = urlParts[1];
      
      // For now, show a placeholder message since we need GitHub API integration
      toast({
        title: "GitHub integration coming soon",
        description: "Direct GitHub import will be available in the next update. Please copy and paste your code for now.",
      });
      
    } catch (error) {
      toast({
        title: "GitHub import failed",
        description: "Failed to import from GitHub. Please try again.",
        variant: "destructive"
      });
    }
  }, [githubUrl, toast]);

  // Calculate usage percentage
  const usagePercentage = (userPlan.current_usage / userPlan.transformation_limit) * 100;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/145ebbd8-c7fe-45ec-b822-b47d5b279d23.png" 
                alt="NeuroLint" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold">NeuroLint Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={userPlan.plan_name === 'Free' ? 'secondary' : 'default'}>
                {userPlan.plan_name} Plan
              </Badge>
              <Button variant="outline" asChild>
                <a href="/profile">Settings</a>
              </Button>
            </div>
          </div>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Transformations Used</span>
                  <span className="font-medium">
                    {userPlan.current_usage} / {userPlan.transformation_limit}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {userPlan.transformation_limit - userPlan.current_usage} transformations remaining
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Dashboard */}
          <Tabs defaultValue="transform" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transform">Transform Code</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="github">GitHub Import</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            {/* Code Transform Tab */}
            <TabsContent value="transform" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Code Input
                  </CardTitle>
                  <CardDescription>
                    Paste your code below and select which layers to apply
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code-input">Code</Label>
                    <Textarea
                      id="code-input"
                      placeholder="Paste your JavaScript, TypeScript, or React code here..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <div className="text-xs text-muted-foreground">
                      Characters: {code.length} | {uploadedFile ? `Loaded from: ${uploadedFile.name}` : 'No file loaded'}
                    </div>
                  </div>

                  {/* Layer Selection */}
                  <div className="space-y-3">
                    <Label>Transformation Layers</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 1, name: 'Configuration', desc: 'TypeScript & build config fixes' },
                        { id: 2, name: 'Entity Cleanup', desc: 'HTML entities & patterns' },
                        { id: 3, name: 'Components', desc: 'React component improvements' },
                        { id: 4, name: 'Hydration', desc: 'SSR safety guards' }
                      ].map((layer) => (
                        <div key={layer.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`layer-${layer.id}`}
                            checked={selectedLayers.includes(layer.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLayers(prev => [...prev, layer.id].sort());
                              } else {
                                setSelectedLayers(prev => prev.filter(id => id !== layer.id));
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <label htmlFor={`layer-${layer.id}`} className="text-sm font-medium cursor-pointer">
                              Layer {layer.id}: {layer.name}
                            </label>
                            <p className="text-xs text-muted-foreground">{layer.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleTransform} 
                    disabled={!code.trim() || isProcessing || usagePercentage >= 100}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Transform Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* File Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Code File
                  </CardTitle>
                  <CardDescription>
                    Upload JavaScript, TypeScript, JSON, or Markdown files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Drop your file here</p>
                      <p className="text-sm text-muted-foreground">
                        Supports .js, .jsx, .ts, .tsx, .json, .md files (max 1MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".js,.jsx,.ts,.tsx,.json,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                  </div>
                  
                  {uploadedFile && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* GitHub Import Tab */}
            <TabsContent value="github" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub Repository Import
                  </CardTitle>
                  <CardDescription>
                    Import code directly from public GitHub repositories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-url">Repository URL</Label>
                    <Input
                      id="github-url"
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={handleGithubImport} className="w-full">
                    <Github className="w-4 h-4 mr-2" />
                    Import from GitHub
                  </Button>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Coming Soon</p>
                        <p className="text-xs text-muted-foreground">
                          Direct GitHub integration is in development. For now, please copy and paste your code manually.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transformation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results ? (
                    <div className="space-y-6">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {results.successfulLayers}
                          </div>
                          <div className="text-sm text-muted-foreground">Successful</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {results.results.length - results.successfulLayers}
                          </div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">
                            {Math.round(results.totalExecutionTime)}ms
                          </div>
                          <div className="text-sm text-muted-foreground">Total Time</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">
                            {results.results.reduce((sum, r) => sum + r.changeCount, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Changes</div>
                        </div>
                      </div>

                      {/* Layer Results */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Layer Results</h3>
                        {results.results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {result.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                              )}
                              <div>
                                <div className="font-medium">Layer {result.layerId}</div>
                                {result.error && (
                                  <div className="text-sm text-red-600">{result.error}</div>
                                )}
                                {result.improvements && result.improvements.length > 0 && (
                                  <div className="text-sm text-green-600">
                                    {result.improvements.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div>{Math.round(result.executionTime)}ms</div>
                              <div>{result.changeCount} changes</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Transformed Code */}
                      {results.finalCode !== code && (
                        <div className="space-y-2">
                          <Label>Transformed Code</Label>
                          <Textarea
                            value={results.finalCode}
                            readOnly
                            rows={10}
                            className="font-mono text-sm"
                          />
                          <Button 
                            onClick={() => {
                              navigator.clipboard.writeText(results.finalCode);
                              toast({
                                title: "Copied to clipboard",
                                description: "Transformed code has been copied to your clipboard.",
                              });
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Copy to Clipboard
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No results yet</p>
                      <p className="text-muted-foreground">
                        Run a transformation to see results here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
