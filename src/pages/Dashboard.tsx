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

  // Layer definitions
  const layerDefinitions = [
    { id: 1, name: "Configuration", description: "TypeScript and Next.js configuration optimization" },
    { id: 2, name: "Pattern Recognition", description: "HTML entities, imports, and code patterns" },
    { id: 3, name: "Component Enhancement", description: "React components and Button variants" },
    { id: 4, name: "Hydration & SSR", description: "Client-side guards and theme providers" },
    { id: 5, name: "Next.js App Router", description: "Use client placement and import cleanup" },
    { id: 6, name: "Testing & Validation", description: "Error boundaries and accessibility" },
    { id: 7, name: "Adaptive Learning", description: "Apply learned patterns from previous transformations" },
  ];

  // Transform code using the real orchestrator
  const handleTransform = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
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
        title: "Error",
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
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">NeuroLint</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Intelligent code analysis and transformation platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Welcome, {user?.email}</p>
                  <p className="text-xs text-gray-500">Free Plan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <Tabs defaultValue="transform" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transform">Transform Code</TabsTrigger>
              <TabsTrigger value="github">GitHub Integration</TabsTrigger>
              <TabsTrigger value="settings">Layer Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="transform" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileCode className="h-5 w-5" />
                      <span>Code Input</span>
                    </CardTitle>
                    <CardDescription>
                      Paste your code, upload a file, or import from GitHub
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* File Upload Area */}
                    <div
                      className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                        isDragOver
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Drag and drop a file here, or{' '}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-500"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse
                        </button>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
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
                      <div className="flex items-center space-x-2 rounded-md bg-green-50 p-3">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{uploadedFile.name}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                    )}

                    {/* Code Textarea */}
                    <div>
                      <Label htmlFor="code-input">Code</Label>
                      <Textarea
                        id="code-input"
                        placeholder="Paste your JavaScript, TypeScript, or React code here..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </div>

                    {/* Transform Button */}
                    <Button
                      onClick={handleTransform}
                      disabled={!code.trim() || isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 h-4 w-4" />
                          Transform Code
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Results Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <span>Transformation Results</span>
                    </CardTitle>
                    <CardDescription>
                      View the transformed code and layer execution details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isProcessing ? (
                      <div className="flex flex-col items-center space-y-4 py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-600">Processing your code...</p>
                        <Progress value={33} className="w-full" />
                      </div>
                    ) : results ? (
                      <div className="space-y-4">
                        {/* Summary */}
                        <div className="rounded-lg bg-gray-50 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {results.successfulLayers} of {selectedLayers.length} layers completed
                              </p>
                              <p className="text-xs text-gray-500">
                                Execution time: {results.totalExecutionTime.toFixed(2)}ms
                              </p>
                            </div>
                            <Button onClick={downloadTransformedCode} variant="outline" size="sm">
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
                              className="flex items-center justify-between rounded-md border p-3"
                            >
                              <div className="flex items-center space-x-3">
                                {result.success ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                                                                 <div>
                                   <p className="text-sm font-medium text-gray-900">
                                     Layer {result.layerId}: {result.layerName || `Layer ${result.layerId}`}
                                   </p>
                                   <p className="text-xs text-gray-500">
                                     {result.success 
                                       ? `${result.changeCount} changes in ${result.executionTime.toFixed(2)}ms`
                                       : result.error
                                     }
                                   </p>
                                 </div>
                              </div>
                              <Badge variant={result.success ? "default" : "destructive"}>
                                {result.success ? "Success" : "Failed"}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        {/* Transformed Code */}
                        <div>
                          <Label htmlFor="transformed-code">Transformed Code</Label>
                          <Textarea
                            id="transformed-code"
                            value={results.finalCode}
                            readOnly
                            className="min-h-[200px] font-mono text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4 py-8 text-center">
                        <Clock className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Transformation results will appear here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="github" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Github className="h-5 w-5" />
                    <span>GitHub Repository Integration</span>
                  </CardTitle>
                  <CardDescription>
                    Import code directly from public GitHub repositories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleGithubImport} 
                      disabled={isLoadingGithub}
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
                      <Label>Available Files</Label>
                      <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border p-2">
                        {githubFiles.map((file) => (
                          <button
                            key={file.sha}
                            onClick={() => handleGithubFileSelect(file)}
                            className="flex w-full items-center space-x-2 rounded-md p-2 text-left hover:bg-gray-100"
                          >
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="outline" className="ml-auto">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Layer Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Select which transformation layers to apply to your code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button onClick={selectAllLayers} variant="outline" size="sm">
                      Select All
                    </Button>
                    <Button onClick={clearAllLayers} variant="outline" size="sm">
                      Clear All
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {layerDefinitions.map((layer) => (
                      <div
                        key={layer.id}
                        className={`rounded-lg border p-4 transition-colors ${
                          selectedLayers.includes(layer.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <label className="flex cursor-pointer items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedLayers.includes(layer.id)}
                            onChange={() => toggleLayer(layer.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              Layer {layer.id}: {layer.name}
                            </h3>
                            <p className="mt-1 text-xs text-gray-600">
                              {layer.description}
                            </p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedLayers.length}</strong> layers selected for transformation
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
