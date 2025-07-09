import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileCode,
  Copy,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  value,
  onChange,
  placeholder = "// Enter your code here...",
  label = "Code Input",
  maxLength = 100000,
}) => {
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  const [showLineNumbers, setShowLineNumbers] = React.useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const lineCount = value.split("\n").length;
  const characterCount = value.length;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neurolint-test-code.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      // Could add toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const detectLanguage = (code: string): string => {
    if (code.includes("import ") || code.includes("export "))
      return "JavaScript/TypeScript";
    if (code.includes("const ") || code.includes("function "))
      return "JavaScript";
    if (code.includes("<")) return "JSX/TSX";
    if (code.includes("interface ") || code.includes("type "))
      return "TypeScript";
    return "Plain Text";
  };

  const getLanguageBadgeColor = (lang: string) => {
    switch (lang) {
      case "JavaScript":
        return "bg-yellow-100 text-yellow-800";
      case "TypeScript":
        return "bg-blue-100 text-blue-800";
      case "JavaScript/TypeScript":
        return "bg-purple-100 text-purple-800";
      case "JSX/TSX":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exampleSnippets = [
    {
      name: "React Component with Issues",
      code: `const UserList = ({ users }) => {
  return (
    <div>
      {users.map(user => (
        <div>{user.name}</div>
      ))}
    </div>
  );
};`,
    },
    {
      name: "TypeScript with Hydration Issue",
      code: `const ServerComponent = () => {
  const [isClient, setIsClient] = useState(false);
  
  return (
    <div>
      {new Date().toLocaleString()}
    </div>
  );
};`,
    },
    {
      name: "Next.js Component Missing Directive",
      code: `const InteractiveButton = () => {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
};`,
    },
  ];

  const renderLineNumbers = () => {
    if (!showLineNumbers) return null;

    return (
      <div className="text-xs text-muted-foreground font-mono pr-4 border-r border-border select-none">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="text-right">
            {i + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="code-input" className="text-base font-semibold">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <Badge className={getLanguageBadgeColor(detectLanguage(value))}>
            {detectLanguage(value)}
          </Badge>
          <Badge variant="outline">
            {lineCount} lines, {characterCount} chars
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              <span className="text-sm font-medium">Code Editor</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                title={
                  showLineNumbers ? "Hide line numbers" : "Show line numbers"
                }
              >
                {showLineNumbers ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                title={isPreviewMode ? "Edit mode" : "Preview mode"}
              >
                {isPreviewMode ? (
                  <FileCode className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                title="Download as file"
                disabled={!value}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                title="Upload file"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
                title="Clear all"
                disabled={!value}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isPreviewMode ? (
            <div className="p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                {value || placeholder}
              </pre>
            </div>
          ) : (
            <div className="flex">
              {renderLineNumbers()}
              <div className="flex-1">
                <Textarea
                  id="code-input"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="min-h-[400px] border-0 rounded-none font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  maxLength={maxLength}
                  style={{
                    lineHeight: "1.5",
                    tabSize: 2,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.jsx,.ts,.tsx,.json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {!value && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3">Quick Start Examples</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exampleSnippets.map((snippet, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 text-left justify-start"
                  onClick={() => onChange(snippet.code)}
                >
                  <div>
                    <div className="font-medium text-sm">{snippet.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Click to load example
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
