import React, { useState, useCallback, useEffect, useRef } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  Github,
  Settings,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  FileCode,
  GitBranch,
  Database,
  Activity,
  Terminal,
  Code2,
  Zap
} from "lucide-react";
import { NeuroLintOrchestrator } from "@/lib/neurolint/orchestrator";
import { TransformationResult } from "@/lib/neurolint/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Core states
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<TransformationResult | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  
  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // GitHub integration states
  const [githubUrl, setGithubUrl] = useState("");
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [githubFiles, setGithubFiles] = useState<any[]>([]);

  // Layer definitions with terminal-inspired descriptions
  const layerDefinitions = [
    { id: 1, name: "Configuration", description: "TypeScript and Next.js configuration optimization", color: "text-blue-400" },
    { id: 2, name: "Pattern Recognition", description: "HTML entities, imports, and code patterns", color: "text-green-400" },
    { id: 3, name: "Component Enhancement", description: "React components and Button variants", color: "text-purple-400" },
    { id: 4, name: "Hydration & SSR", description: "Client-side guards and theme providers", color: "text-orange-400" },
    { id: 5, name: "Next.js App Router", description: "Use client placement and import cleanup", color: "text-pink-400" },
    { id: 6, name: "Testing & Validation", description: "Error boundaries and accessibility", color: "text-cyan-400" },
    { id: 7, name: "Adaptive Learning", description: "Apply learned patterns from previous transformations", color: "text-yellow-400" },
  ];

  // Transform code using the real orchestrator
  const handleTransform = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "No Code Provided",
        description: "Please provide code to transform.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      const result = await NeuroLintOrchestrator.transform(code, selectedLayers, {
        verbose: true,
        dryRun: false,
      });

      setResults(result);
      
      toast({
        title: "Transformation Complete",
        description: `Processed ${result.successfulLayers} of ${selectedLayers.length} layers successfully.`,
      });
    } catch (error) {
      console.error("Transformation failed:", error);
      toast({
        title: "Transformation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [code, selectedLayers, toast]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    const validTypes = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.vue', '.svelte'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JavaScript, TypeScript, Vue, Svelte, JSON, or Markdown file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      toast({
        title: "File Uploaded",
        description: `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      });
    };
    reader.readAsText(file);
  }, [toast]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // GitHub repository integration
  const handleGithubImport = useCallback(async () => {
    if (!githubUrl.trim()) {
      toast({
        title: "No URL Provided",
        description: "Please enter a GitHub repository URL.",
        variant: "destructive",
      });
      return;
    }

    const githubPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/;
    const match = githubUrl.trim().match(githubPattern);

    if (!match) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL.",
        variant: "destructive",
      });
      return;
    }

    const [, owner, repo] = match;
    setIsLoadingGithub(true);

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NeuroLint-App',
        },
      });

      if (!response.ok) {
        throw new Error(`Repository not found or inaccessible: ${response.status}`);
      }

      const contents = await response.json();
      const codeFiles = Array.isArray(contents) 
        ? contents.filter((item: any) => 
            item.type === 'file' && 
            /\.(js|jsx|ts|tsx|vue|svelte|json|md)$/i.test(item.name) &&
            item.size < 1024 * 1024
          )
        : [];

      setGithubFiles(codeFiles);
      toast({
        title: "Repository Loaded",
        description: `Found ${codeFiles.length} code files in ${owner}/${repo}.`,
      });
    } catch (error) {
      toast({
        title: "GitHub Import Failed",
        description: error instanceof Error ? error.message : "Failed to load repository.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGithub(false);
    }
  }, [githubUrl, toast]);

  // Load file from GitHub
  const handleGithubFileSelect = useCallback(async (file: any) => {
    try {
      const response = await fetch(file.download_url);
      if (!response.ok) throw new Error('Failed to download file');
      
      const content = await response.text();
      setCode(content);
      toast({
        title: "File Loaded",
        description: `Loaded ${file.name} from GitHub.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to load file from GitHub.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Layer selection handlers
  const toggleLayer = (layerId: number) => {
    setSelectedLayers(prev => 
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId].sort()
    );
  };

  const selectAllLayers = () => {
    setSelectedLayers([1, 2, 3, 4, 5, 6, 7]);
  };

  const clearAllLayers = () => {
    setSelectedLayers([]);
  };

  // Download transformed code
  const downloadTransformedCode = () => {
    if (!results) return;
    
    const blob = new Blob([results.finalCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = uploadedFile?.name.replace(/\.[^/.]+$/, '_transformed.js') || 'transformed_code.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        {/* Terminal-styled header */}
        <div className="border-b border-zinc-800/50 bg-black/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src="/Bee logo.png"
                  alt="NeuroLint"
                  className="h-8 w-8 rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-bold text-white">NeuroLint</h1>
                  <p className="text-sm text-zinc-400">Advanced Code Transformation Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <Tabs defaultValue="transform" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 border border-zinc-800">
              <TabsTrigger value="transform" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Code2 className="mr-2 h-4 w-4" />
                Transform Code
              </TabsTrigger>
              <TabsTrigger value="github" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Github className="mr-2 h-4 w-4" />
                GitHub Integration
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Settings className="mr-2 h-4 w-4" />
                Layer Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transform" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Section */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <FileCode className="h-5 w-5" />
                      <span>Code Input</span>
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Paste your code, upload a file, or import from GitHub
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Terminal-styled File Upload Area */}
                    <div
                      className={`rounded-lg border-2 border-dashed p-6 text-center transition-all duration-300 ${
                        isDragOver
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="mx-auto h-8 w-8 text-zinc-400" />
                      <p className="mt-2 text-sm text-zinc-300">
                        Drag and drop a file here, or{' '}
                        <button
                          type="button"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse
                        </button>
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Supports .js, .jsx, .ts, .tsx, .json, .md files (max 2MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".js,.jsx,.ts,.tsx,.json,.md,.vue,.svelte"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </div>

                    {uploadedFile && (
                      <div className="flex items-center space-x-2 rounded-md bg-green-500/10 border border-green-500/20 p-3">
                        <FileText className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-300">{uploadedFile.name}</span>
                        <Badge variant="secondary" className="ml-auto bg-zinc-800 text-zinc-300">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                    )}

                    {/* Terminal-styled Code Textarea */}
                    <div>
                      <Label htmlFor="code-input" className="text-zinc-300">Code</Label>
                      <Textarea
                        id="code-input"
                        placeholder="// Paste your JavaScript, TypeScript, or React code here..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="min-h-[300px] font-mono text-sm bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                      />
                    </div>

                    {/* Transform Button */}
                    <Button
                      onClick={handleTransform}
                      disabled={!code.trim() || isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Transform Code
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Results Section */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Database className="h-5 w-5" />
                      <span>Transformation Results</span>
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      View the transformed code and layer execution details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isProcessing ? (
                      <div className="flex flex-col items-center space-y-4 py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="text-sm text-zinc-400">Processing your code...</p>
                        <Progress value={33} className="w-full bg-zinc-800" />
                      </div>
                    ) : results ? (
                      <div className="space-y-4">
                        {/* Summary */}
                        <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {results.successfulLayers} of {selectedLayers.length} layers completed
                              </p>
                              <p className="text-xs text-zinc-400">
                                Execution time: {results.totalExecutionTime.toFixed(2)}ms
                              </p>
                            </div>
                            <Button 
                              onClick={downloadTransformedCode} 
                              variant="outline" 
                              size="sm"
                              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>

                        {/* Layer Results */}
                        <div className="space-y-2">
                          {results.results.map((result) => (
                            <div
                              key={result.layerId}
                              className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-800/30 p-3"
                            >
                              <div className="flex items-center space-x-3">
                                {result.success ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-400" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    Layer {result.layerId}: {result.layerName || `Layer ${result.layerId}`}
                                  </p>
                                  <p className="text-xs text-zinc-400">
                                    {result.success 
                                      ? `${result.changeCount} changes in ${result.executionTime.toFixed(2)}ms`
                                      : result.error
                                    }
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                variant={result.success ? "default" : "destructive"}
                                className={result.success ? "bg-green-600 hover:bg-green-700" : ""}
                              >
                                {result.success ? "Success" : "Failed"}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        {/* Transformed Code */}
                        <div>
                          <Label htmlFor="transformed-code" className="text-zinc-300">Transformed Code</Label>
                          <Textarea
                            id="transformed-code"
                            value={results.finalCode}
                            readOnly
                            className="min-h-[200px] font-mono text-sm bg-zinc-900/50 border-zinc-700 text-zinc-100"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4 py-8 text-center">
                        <Clock className="h-8 w-8 text-zinc-500" />
                        <p className="text-sm text-zinc-400">
                          Transformation results will appear here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="github" className="space-y-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Github className="h-5 w-5" />
                    <span>GitHub Repository Integration</span>
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Import code directly from public GitHub repositories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="flex-1 bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    />
                    <Button 
                      onClick={handleGithubImport} 
                      disabled={isLoadingGithub}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white"
                    >
                      {isLoadingGithub ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <GitBranch className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {githubFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Available Files</Label>
                      <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900/30 p-2">
                        {githubFiles.map((file) => (
                          <button
                            key={file.sha}
                            onClick={() => handleGithubFileSelect(file)}
                            className="flex w-full items-center space-x-2 rounded-md p-2 text-left hover:bg-zinc-700/50 transition-colors"
                          >
                            <FileText className="h-4 w-4 text-zinc-400" />
                            <span className="text-sm text-zinc-300">{file.name}</span>
                            <Badge variant="outline" className="ml-auto border-zinc-600 text-zinc-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Settings className="h-5 w-5" />
                    <span>Layer Configuration</span>
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Select which transformation layers to apply to your code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button onClick={selectAllLayers} variant="outline" size="sm" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
                      Select All
                    </Button>
                    <Button onClick={clearAllLayers} variant="outline" size="sm" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
                      Clear All
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {layerDefinitions.map((layer) => (
                      <div
                        key={layer.id}
                        className={`rounded-lg border p-4 transition-all duration-300 cursor-pointer ${
                          selectedLayers.includes(layer.id)
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                            : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
                        }`}
                        onClick={() => toggleLayer(layer.id)}
                      >
                        <label className="flex cursor-pointer items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedLayers.includes(layer.id)}
                            onChange={() => toggleLayer(layer.id)}
                            className="mt-1 rounded border-zinc-600 bg-zinc-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                          />
                          <div className="flex-1">
                            <h3 className={`text-sm font-medium ${layer.color}`}>
                              Layer {layer.id}: {layer.name}
                            </h3>
                            <p className="mt-1 text-xs text-zinc-400">
                              {layer.description}
                            </p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                    <p className="text-sm text-blue-300">
                      <strong className="text-blue-200">{selectedLayers.length}</strong> layers selected for transformation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
