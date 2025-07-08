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
  Code2,
  Github,
  Zap,
  FileText,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Copy,
  Lightbulb,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  FileCode,
  FolderOpen,
  GitBranch,
  Star,
  Users,
} from "lucide-react";
import { NeuroLintOrchestrator, LayerExecutionResult } from "@/lib/neurolint";
import { useAuth } from "@/contexts/AuthContext";
import { paypalService } from "@/lib/paypal/paypal-service";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Main states
  const [code, setCode] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedLayers, setSelectedLayers] = useState<number[]>([1, 2, 3, 4]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<LayerExecutionResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Enhanced states
  const [isDragOver, setIsDragOver] = useState(false);
  const [layerSuggestions, setLayerSuggestions] = useState<{
    recommendedLayers: number[];
    reasons: string[];
    confidence: number;
  } | null>(null);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [selectedGithubFile, setSelectedGithubFile] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const [showLayerDetails, setShowLayerDetails] = useState(false);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User subscription state
  const [userPlan, setUserPlan] = useState({
    plan_name: "Free",
    transformation_limit: 25,
    current_usage: 0,
    remaining_transformations: 25,
    can_transform: true,
  });

  // Load user subscription data on mount
  useEffect(() => {
    if (user) {
      loadUserSubscription();
    }
  }, [user]);

  // Real-time code analysis
  useEffect(() => {
    if (code.trim() && realTimeAnalysis) {
      const debounceTimer = setTimeout(async () => {
        try {
          const analysis = await NeuroLintOrchestrator.analyze(code);
          setLayerSuggestions({
            recommendedLayers: analysis.recommendedLayers,
            reasons: analysis.reasoning,
            confidence: analysis.confidence,
          });
        } catch (error) {
          console.warn("Real-time analysis failed:", error);
        }
      }, 1000);

      return () => clearTimeout(debounceTimer);
    } else {
      setLayerSuggestions(null);
    }
  }, [code, realTimeAnalysis]);

  const loadUserSubscription = async () => {
    try {
      const subscription = await paypalService.getUserSubscription();
      setUserPlan({
        plan_name: subscription.plan_name,
        transformation_limit: subscription.transformation_limit,
        current_usage: subscription.current_usage,
        remaining_transformations: subscription.remaining_transformations,
        can_transform: subscription.can_transform,
      });
    } catch (error) {
      console.warn(
        "Failed to load user subscription:",
        error instanceof Error ? error.message : "Unknown error",
      );
      toast({
        title: "Subscription info unavailable",
        description:
          "Using default free plan settings. Your usage data may not be accurate.",
        variant: "default",
      });
    }
  };

  // Handle code transformation
  const handleTransform = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "No code provided",
        description: "Please paste some code or upload a file first.",
        variant: "destructive",
      });
      return;
    }

    if (!userPlan.can_transform) {
      toast({
        title: "Usage limit reached",
        description:
          "You've reached your monthly transformation limit. Upgrade to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await NeuroLintOrchestrator.transform(
        code,
        selectedLayers,
        {
          verbose: true,
          dryRun: false,
        },
      );

      setResults(result);

      // Track transformation in database
      if (user) {
        await supabase.from("transformations").insert({
          user_id: user.id,
          original_code_length: code.length,
          transformed_code_length: result.finalCode.length,
          layers_used: selectedLayers,
          changes_count: result.results.reduce(
            (sum, r) => sum + r.changeCount,
            0,
          ),
          execution_time_ms: result.totalExecutionTime,
          success: result.successfulLayers > 0,
          file_name: uploadedFile?.name || null,
        });

        // Refresh user subscription data
        await loadUserSubscription();
      }

      toast({
        title: "Transformation completed!",
        description: `Successfully processed ${result.successfulLayers} out of ${selectedLayers.length} layers.`,
      });
    } catch (error) {
      console.error("Transformation failed:", error);
      toast({
        title: "Transformation failed",
        description:
          "An error occurred while processing your code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [code, selectedLayers, userPlan, user, uploadedFile, toast]);

  // Enhanced file upload with drag and drop
  const handleFileUpload = useCallback(
    (file: File) => {
      // Check file type
      const validTypes = [
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".json",
        ".md",
        ".vue",
        ".svelte",
      ];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      if (!validTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description:
            "Please upload a JavaScript, TypeScript, Vue, Svelte, JSON, or Markdown file.",
          variant: "destructive",
        });
        return;
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 2MB.",
          variant: "destructive",
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
          title: "File uploaded successfully",
          description: `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        });
      };
      reader.readAsText(file);
    },
    [toast],
  );

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload],
  );

  // Enhanced GitHub integration
  const handleGithubImport = useCallback(async () => {
    if (!githubUrl.trim()) {
      toast({
        title: "No GitHub URL provided",
        description: "Please enter a GitHub repository URL.",
        variant: "destructive",
      });
      return;
    }

    // Enhanced GitHub URL validation
    const githubPattern =
      /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)(\/.*)?$/;
    const match = githubUrl.match(githubPattern);

    if (!match) {
      toast({
        title: "Invalid GitHub URL",
        description:
          "Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo).",
        variant: "destructive",
      });
      return;
    }

    const [, owner, repo] = match;
    setIsLoadingGithub(true);

    try {
      // Fetch repository contents from GitHub API
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Repository not found or is private");
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const contents = await response.json();

      // Filter for code files
      const codeFiles = contents.filter(
        (item: any) =>
          item.type === "file" &&
          /\.(js|jsx|ts|tsx|vue|svelte|json|md)$/i.test(item.name),
      );

      if (codeFiles.length === 0) {
        toast({
          title: "No code files found",
          description:
            "This repository doesn't contain any supported code files.",
          variant: "destructive",
        });
        return;
      }

      setGithubRepos(codeFiles);
      toast({
        title: "Repository loaded",
        description: `Found ${codeFiles.length} code files in ${owner}/${repo}`,
      });
    } catch (error) {
      console.error("GitHub import failed:", error);
      toast({
        title: "GitHub import failed",
        description:
          error instanceof Error ? error.message : "Failed to load repository",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGithub(false);
    }
  }, [githubUrl, toast]);

  // Load GitHub file content
  const handleGithubFileSelect = useCallback(
    async (file: any) => {
      try {
        const response = await fetch(file.download_url);
        const content = await response.text();

        if (content.length > 2 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Selected file is too large (max 2MB).",
            variant: "destructive",
          });
          return;
        }

        setSelectedGithubFile({ path: file.path, content });
        setCode(content);
        setUploadedFile(null); // Clear any uploaded file

        toast({
          title: "File loaded from GitHub",
          description: `Loaded ${file.name} from repository`,
        });
      } catch (error) {
        toast({
          title: "Failed to load file",
          description: "Could not load the selected file from GitHub.",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  // Calculate usage percentage
  const usagePercentage =
    userPlan.transformation_limit > 0
      ? (userPlan.current_usage / userPlan.transformation_limit) * 100
      : 0;

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
                <p className="text-muted-foreground">
                  Welcome back, {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant={
                  userPlan.plan_name === "Free" ? "secondary" : "default"
                }
              >
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
                  {userPlan.remaining_transformations} transformations remaining
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
                      Characters: {code.length} |{" "}
                      {uploadedFile
                        ? `Loaded from: ${uploadedFile.name}`
                        : "No file loaded"}
                    </div>
                  </div>

                  {/* Layer Selection */}
                  <div className="space-y-3">
                    <Label>Transformation Layers</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          id: 1,
                          name: "Configuration",
                          desc: "TypeScript & build config fixes",
                        },
                        {
                          id: 2,
                          name: "Entity Cleanup",
                          desc: "HTML entities & patterns",
                        },
                        {
                          id: 3,
                          name: "Components",
                          desc: "React component improvements",
                        },
                        { id: 4, name: "Hydration", desc: "SSR safety guards" },
                      ].map((layer) => (
                        <div
                          key={layer.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`layer-${layer.id}`}
                            checked={selectedLayers.includes(layer.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLayers((prev) =>
                                  [...prev, layer.id].sort(),
                                );
                              } else {
                                setSelectedLayers((prev) =>
                                  prev.filter((id) => id !== layer.id),
                                );
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <label
                              htmlFor={`layer-${layer.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              Layer {layer.id}: {layer.name}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {layer.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleTransform}
                    disabled={
                      !code.trim() || isProcessing || !userPlan.can_transform
                    }
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
                        Transform Code ({
                          userPlan.remaining_transformations
                        }{" "}
                        remaining)
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
                        Supports .js, .jsx, .ts, .tsx, .json, .md files (max
                        1MB)
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
                          Direct GitHub integration is in development. For now,
                          please copy and paste your code manually.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                          <div className="text-sm text-muted-foreground">
                            Successful
                          </div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {results.results.length - results.successfulLayers}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Failed
                          </div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">
                            {Math.round(results.totalExecutionTime)}ms
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Time
                          </div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">
                            {results.results.reduce(
                              (sum, r) => sum + r.changeCount,
                              0,
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Changes
                          </div>
                        </div>
                      </div>

                      {/* Layer Results */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Layer Results</h3>
                        {results.results.map((result, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {result.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                              )}
                              <div>
                                <div className="font-medium">
                                  Layer {result.layerId}
                                </div>
                                {result.error && (
                                  <div className="text-sm text-red-600">
                                    {result.error}
                                  </div>
                                )}
                                {result.improvements &&
                                  result.improvements.length > 0 && (
                                    <div className="text-sm text-green-600">
                                      {result.improvements.join(", ")}
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
                                description:
                                  "Transformed code has been copied to your clipboard.",
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
