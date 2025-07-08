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
              <Button variant="outline" asChild>
                <a href="/admin">Admin</a>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="code-input">Code</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRealTimeAnalysis(!realTimeAnalysis)}
                        >
                          {realTimeAnalysis ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                          Real-time Analysis
                        </Button>
                        {code && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCode("")}
                          >
                            <X className="h-4 w-4" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <Textarea
                      id="code-input"
                      placeholder="Paste your JavaScript, TypeScript, Vue, Svelte, or React code here..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {code.length.toLocaleString()} characters |{" "}
                        {code.split("\n").length} lines
                      </span>
                      <span>
                        {uploadedFile
                          ? `📁 ${uploadedFile.name}`
                          : selectedGithubFile
                            ? `🔗 ${selectedGithubFile.path}`
                            : "No file loaded"}
                      </span>
                    </div>
                  </div>

                  {/* Real-time Layer Suggestions */}
                  {layerSuggestions && layerSuggestions.confidence > 0.6 && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-blue-900">
                                Smart Layer Suggestions
                              </h4>
                              <Badge variant="secondary">
                                {Math.round(layerSuggestions.confidence * 100)}%
                                confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-800">
                              Based on your code analysis, we recommend layers:{" "}
                              {layerSuggestions.recommendedLayers.join(", ")}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setSelectedLayers(
                                    layerSuggestions.recommendedLayers,
                                  )
                                }
                              >
                                Apply Suggestions
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setShowLayerDetails(!showLayerDetails)
                                }
                              >
                                {showLayerDetails ? "Hide" : "Show"} Details
                              </Button>
                            </div>
                            {showLayerDetails && (
                              <div className="mt-2 space-y-1">
                                {layerSuggestions.reasons.map(
                                  (reason, index) => (
                                    <p
                                      key={index}
                                      className="text-xs text-blue-700"
                                    >
                                      • {reason}
                                    </p>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

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

            {/* Enhanced File Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Code File
                  </CardTitle>
                  <CardDescription>
                    Upload JavaScript, TypeScript, Vue, Svelte, JSON, or
                    Markdown files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center space-y-4 transition-colors ${
                      isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : "border-muted-foreground/25"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div
                      className={`transition-transform ${isDragOver ? "scale-110" : ""}`}
                    >
                      <Upload
                        className={`h-12 w-12 mx-auto ${isDragOver ? "text-blue-600" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {isDragOver
                          ? "Drop your file here"
                          : "Drag & drop your file here"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports .js, .jsx, .ts, .tsx, .vue, .svelte, .json, .md
                        files (max 2MB)
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".js,.jsx,.ts,.tsx,.vue,.svelte,.json,.md"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        asChild
                        variant={isDragOver ? "default" : "outline"}
                      >
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <FileCode className="w-4 h-4 mr-2" />
                          Choose File
                        </label>
                      </Button>
                      {uploadedFile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {uploadedFile && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-900">
                                {uploadedFile.name}
                              </p>
                              <p className="text-sm text-green-700">
                                {(uploadedFile.size / 1024).toFixed(1)} KB •
                                Last modified:{" "}
                                {new Date(
                                  uploadedFile.lastModified,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(code);
                                toast({
                                  title: "Copied to clipboard",
                                  description:
                                    "File content has been copied to your clipboard.",
                                });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced GitHub Integration Tab */}
            <TabsContent value="github" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub Repository Import
                  </CardTitle>
                  <CardDescription>
                    Import code directly from public GitHub repositories (live
                    integration)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-url">Repository URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="github-url"
                        type="url"
                        placeholder="https://github.com/username/repository"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleGithubImport}
                        disabled={isLoadingGithub || !githubUrl.trim()}
                      >
                        {isLoadingGithub ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Github className="w-4 h-4 mr-2" />
                        )}
                        Load Repo
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports public repositories • Examples: React, Vue,
                      Angular projects
                    </p>
                  </div>

                  {githubRepos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        <h4 className="font-medium">
                          Repository Files ({githubRepos.length})
                        </h4>
                      </div>
                      <div className="grid gap-2 max-h-64 overflow-y-auto">
                        {githubRepos.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleGithubFileSelect(file)}
                          >
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">
                                {file.name}
                              </span>
                              {file.size && (
                                <Badge variant="secondary" className="text-xs">
                                  {(file.size / 1024).toFixed(1)} KB
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Click to load
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedGithubFile && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-blue-600" />
                            <span className="font-mono text-sm text-blue-900">
                              {selectedGithubFile.path}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGithubFile(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          File loaded from GitHub •{" "}
                          {selectedGithubFile.content.length.toLocaleString()}{" "}
                          characters
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-900">
                          Live GitHub Integration Active
                        </p>
                        <p className="text-xs text-green-700">
                          Real GitHub API integration is now functional. Load
                          any public repository and select files to transform.
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

                      {/* Enhanced Transformed Code Display */}
                      {results.finalCode !== code && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">
                              Transformed Code
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    results.finalCode,
                                  );
                                  toast({
                                    title: "Copied to clipboard",
                                    description:
                                      "Transformed code has been copied to your clipboard.",
                                  });
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Copy Code
                              </Button>
                              <Button
                                onClick={() => {
                                  const blob = new Blob([results.finalCode], {
                                    type: "text/plain",
                                  });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download =
                                    uploadedFile?.name?.replace(
                                      /\.[^/.]+$/,
                                      "_transformed$&",
                                    ) || "transformed_code.txt";
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                  toast({
                                    title: "Download started",
                                    description:
                                      "Transformed code is being downloaded.",
                                  });
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Before */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">
                                Before (Original)
                              </Label>
                              <Textarea
                                value={code}
                                readOnly
                                rows={12}
                                className="font-mono text-xs bg-muted/50"
                              />
                            </div>

                            {/* After */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-green-700">
                                After (Transformed)
                              </Label>
                              <Textarea
                                value={results.finalCode}
                                readOnly
                                rows={12}
                                className="font-mono text-xs border-green-200 bg-green-50"
                              />
                            </div>
                          </div>

                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>
                                Transformation complete •
                                {Math.abs(
                                  results.finalCode.length - code.length,
                                )}{" "}
                                character difference •
                                {results.results.reduce(
                                  (sum, r) => sum + r.changeCount,
                                  0,
                                )}{" "}
                                total changes
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="p-4 bg-muted/50 rounded-full">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium">
                            No transformations yet
                          </p>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            Upload a file, paste code, or import from GitHub,
                            then run a transformation to see detailed results
                            and comparisons here.
                          </p>
                        </div>
                        {code && (
                          <Button
                            onClick={handleTransform}
                            disabled={!userPlan.can_transform}
                            className="mx-auto"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Transform Current Code
                          </Button>
                        )}
                      </div>
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
