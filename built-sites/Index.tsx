import React, { useEffect, useState, useRef } from "react";
import { FAQSection } from "@/components/landing/FAQSection";
import { TechnologySection } from "@/components/landing/TechnologySection";
import { CLISection } from "@/components/landing/CLISection";

import {
  Target,
  Zap,
  Search,
  Puzzle,
  BarChart3,
  Atom,
  CheckCircle,
  Shield,
  Terminal,
  Code,
  Database,
  Users,
  Settings,
  Monitor,
  Cpu,
  GitBranch,
  Download,
  Play,
  Copy,
  ExternalLink,
} from "lucide-react";

// Lazy Loading Hook
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView] as const;
};

// TypewriterHeadline Component
const TypewriterHeadline: React.FC = () => {
  const [currentText, setCurrentText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);

  const words = [
    "Code Analysis",
    "Bug Detection",
    "Code Optimization",
    "Performance Tuning",
    "Code Transformation",
  ];

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenWords = 2000;

    if (currentIndex < words[currentWordIndex].length) {
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev + words[currentWordIndex][currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);
    } else {
      timeout = setTimeout(
        () => {
          if (currentText.length > 0) {
            setCurrentText((prev) => prev.slice(0, -1));
          } else {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
            setCurrentIndex(0);
          }
        },
        currentText.length === words[currentWordIndex].length
          ? delayBetweenWords
          : deletingSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, currentText, currentWordIndex, words]);

  return (
    <div className="mb-12">
      <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white min-h-[1.2em]">
        {currentText}
      </h1>
    </div>
  );
};

export default function Index() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".feature-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center px-4 py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-zinc-900/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-950/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-zinc-900/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto z-10 animate-fade-in-blur">
          <div className="mb-12 animate-slide-in-down animate-delay-200">
            <span className="px-6 py-3 bg-zinc-900/70 rounded-2xl text-base font-bold backdrop-blur-xl border-2 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-105 hover:-translate-y-1 cursor-default">
              Next Generation Code Analysis
            </span>
          </div>

          <TypewriterHeadline />

          <div className="relative mb-16 animate-slide-in-up animate-delay-500">
            <p className="text-xl md:text-2xl lg:text-3xl text-zinc-200 mb-16 max-w-4xl mx-auto leading-relaxed px-6 md:px-8 py-6 md:py-8 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-zinc-800/50 hover:border-zinc-700/70 font-medium transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) hover:bg-zinc-900/20">
              Experience advanced code analysis with our{" "}
              <span className="text-white font-black">
                transformation platform
              </span>
              . Detect bugs, optimize performance, and{" "}
              <span className="text-white font-black">
                maintain clean code automatically
              </span>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center animate-slide-in-up animate-delay-700">
            <a
              href="https://app.neurolint.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 md:px-10 py-4 md:py-5 bg-white text-black font-black rounded-xl md:rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex items-center justify-center gap-3 text-lg md:text-xl shadow-2xl hover:shadow-white/30 hover:scale-105 active:scale-95 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-4 focus:ring-offset-black touch-manipulation"
            >
              Start Analyzing
              <svg
                className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 group-focus:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>

            <a
              href="#features"
              className="group relative px-8 md:px-10 py-4 md:py-5 bg-black/60 text-white font-black rounded-xl md:rounded-2xl border-2 border-zinc-800 hover:bg-black/80 hover:border-zinc-600 active:bg-black/90 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex items-center justify-center gap-3 text-lg md:text-xl backdrop-blur-xl hover:scale-105 active:scale-95 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-zinc-500/30 focus:ring-offset-4 focus:ring-offset-black touch-manipulation"
            >
              See How It Works
              <svg
                className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-y-1 group-focus:translate-y-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Test Suite CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
            See NeuroLint in Action
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
            Try our interactive test suite to see how NeuroLint transforms your
            code
          </p>
          <a
            href="https://app.neurolint.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl"
          >
            <Play className="w-6 h-6" />
            Try Test Suite
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              Multi-Layer Analysis System
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
              Our six-layer analysis system catches issues other tools miss
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Syntax Analysis",
                description:
                  "Advanced parsing catches syntax errors and potential issues before they cause problems.",
                icon: Zap,
              },
              {
                title: "Pattern Detection",
                description:
                  "Identifies common anti-patterns and suggests modern alternatives.",
                icon: Search,
              },
              {
                title: "Component Analysis",
                description:
                  "Ensures React components follow best practices and performance guidelines.",
                icon: Puzzle,
              },
              {
                title: "Data Flow Check",
                description:
                  "Validates prop types, state management, and data flow through your application.",
                icon: BarChart3,
              },
              {
                title: "Framework Optimization",
                description:
                  "Specific checks for Next.js and other modern framework features.",
                icon: Atom,
              },
              {
                title: "Testing Coverage",
                description:
                  "Analyzes test coverage and suggests areas needing more testing.",
                icon: CheckCircle,
              },
            ].map((feature, index) => {
              const getGlowClass = () => {
                const colors = [
                  "blue",
                  "purple",
                  "green",
                  "pink",
                  "orange",
                  "cyan",
                ];
                const color = colors[index];

                if (index === 0)
                  return `glow-border glow-border-always glow-border-${color}`;
                if (index === 1)
                  return `glow-border glow-border-hover glow-border-${color}`;
                if (index === 2)
                  return `glow-border glow-border-delay-1 glow-border-${color}`;
                if (index === 3)
                  return `glow-border glow-border-hover glow-border-${color}`;
                if (index === 4)
                  return `glow-border glow-border-delay-2 glow-border-${color}`;
                if (index === 5)
                  return `glow-border glow-border-hover glow-border-${color}`;
                return "";
              };

              return (
                <div
                  key={index}
                  className={`feature-card bg-black/70 backdrop-blur-xl p-10 rounded-3xl relative border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group h-[280px] flex flex-col ${getGlowClass()}`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <feature.icon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-2xl font-black text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed font-medium flex-grow">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
              Three simple steps to better code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Upload Your Code",
                description:
                  "Simply drag and drop your files or connect your repository for continuous analysis.",
              },
              {
                step: "02",
                title: "Code Analysis",
                description:
                  "Our six-layer analysis system examines your code for issues and improvement opportunities using advanced AST parsing and pattern matching.",
              },
              {
                step: "03",
                title: "Get Results",
                description:
                  "Receive detailed reports with actionable fixes and improvements, prioritized by impact.",
              },
            ].map((item, index) => (
              <div key={index} className="group relative">
                <div className="relative p-6 md:p-8 lg:p-10 bg-[#111111] border-2 border-zinc-800 rounded-3xl hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-900/50 min-h-[320px] md:h-[360px] lg:h-[320px] flex flex-col">
                  <div className="text-4xl md:text-5xl font-black text-white mb-4 md:mb-6 lg:mb-8">
                    {item.step}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-zinc-300 leading-relaxed font-medium text-sm md:text-base lg:text-lg flex-grow overflow-hidden">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLI Tool Section */}
      <CLISection />

      {/* VS Code Extension Section */}
      <section id="vscode" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              VS Code Extension
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Get real-time code analysis and automated suggestions directly in
              your favorite editor. Never leave your development environment.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white">
                  Install from Marketplace
                </h3>
                <div className="flex gap-4">
                  <a
                    href="https://vs.neurolint.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Install Extension
                  </a>
                  <a
                    href="https://vs.neurolint.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-zinc-800 text-white px-6 py-3 rounded-lg font-medium hover:border-white transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Marketplace
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Monitor className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      Real-time Analysis
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Get instant feedback as you type
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">Quick Fixes</h4>
                    <p className="text-zinc-400 text-sm">
                      One-click solutions for common issues
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Database className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      Workspace Analysis
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Analyze entire projects with detailed reports
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 text-sm text-zinc-400">
                <Code className="w-4 h-4" />
                <span>VS Code</span>
                <div className="flex gap-1 ml-auto">
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                </div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-zinc-600 rounded-sm flex items-center justify-center">
                      <Code className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-zinc-300">Header.tsx</span>
                  </div>
                  <div className="font-mono text-sm space-y-1">
                    <div className="text-zinc-500">
                      1 import React from 'react';
                    </div>
                    <div className="text-zinc-500">2 </div>
                    <div className="text-zinc-500">
                      3 export function Header() {"{"}
                    </div>
                    <div className="text-zinc-500">4 return (</div>
                    <div className="flex">
                      <span className="text-zinc-500">5 </span>
                      <span className="text-white bg-zinc-700 px-1">
                        &lt;div className="header"&gt;
                      </span>
                      <div className="ml-2 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-300">
                        NeuroLint: Use semantic HTML5 elements
                      </div>
                    </div>
                    <div className="text-zinc-500">
                      6 &lt;h1&gt;Welcome&lt;/h1&gt;
                    </div>
                    <div className="text-zinc-500">7 &lt;/div&gt;</div>
                    <div className="text-zinc-500">8 );</div>
                    <div className="text-zinc-500">9 {"}"}</div>
                  </div>
                  <div className="mt-4 p-3 bg-zinc-800 border border-zinc-700 rounded text-sm">
                    <div className="flex items-center gap-2 text-zinc-300 mb-2">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">Quick Fix Available</span>
                    </div>
                    <div className="text-zinc-300 text-xs">
                      Replace with semantic &lt;header&gt; element for better
                      accessibility
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REST API Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              Enterprise REST API
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
              Production-ready API for code analysis and transformation with
              enterprise-grade security, compliance, and scalability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-black/70 backdrop-blur-xl p-10 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group h-[280px] flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <Shield className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-black text-white">
                  Enterprise Security
                </h3>
              </div>
              <ul className="space-y-3 text-gray-300 leading-relaxed font-medium flex-grow">
                <li>• SOC 2 Type II compliant</li>
                <li>• GDPR and ISO 27001 certified</li>
                <li>• SSO integration support</li>
                <li>• Role-based access control</li>
              </ul>
            </div>

            <div className="bg-black/70 backdrop-blur-xl p-10 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group h-[280px] flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <Zap className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-black text-white">
                  High Performance
                </h3>
              </div>
              <ul className="space-y-3 text-gray-300 leading-relaxed font-medium flex-grow">
                <li>• 99.9% uptime SLA</li>
                <li>• Sub-100ms response times</li>
                <li>• Auto-scaling infrastructure</li>
                <li>• Global CDN distribution</li>
              </ul>
            </div>

            <div className="bg-black/70 backdrop-blur-xl p-10 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group h-[280px] flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <Settings className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-black text-white">
                  Advanced Features
                </h3>
              </div>
              <ul className="space-y-3 text-gray-300 leading-relaxed font-medium flex-grow">
                <li>• 6-layer analysis engine</li>
                <li>• Real-time transformation</li>
                <li>• Audit logging and reporting</li>
                <li>• Custom rule configuration</li>
              </ul>
            </div>
          </div>
          <div className="bg-[#111111] border-2 border-zinc-800 rounded-3xl p-10 hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-900/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-black text-white mb-6 tracking-tight">
                  Core Endpoints
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl text-sm font-mono font-bold">
                      POST
                    </span>
                    <span className="text-white font-mono font-medium">
                      /api/analyze
                    </span>
                    <span className="text-gray-300">
                      Advanced code analysis
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-blue-900 text-blue-200 px-3 py-2 rounded-xl text-sm font-mono font-bold">
                      POST
                    </span>
                    <span className="text-white font-mono font-medium">
                      /api/transform
                    </span>
                    <span className="text-gray-300">Code transformation</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl text-sm font-mono font-bold">
                      GET
                    </span>
                    <span className="text-white font-mono font-medium">
                      /api/layers
                    </span>
                    <span className="text-gray-300">
                      Available analysis layers
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl text-sm font-bold">
                      ENTERPRISE
                    </span>
                    <span className="text-white font-mono font-medium">
                      /api/enterprise/*
                    </span>
                    <span className="text-gray-300">
                      Advanced enterprise features
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 rounded-2xl p-6">
                <h4 className="text-xl font-black text-white mb-4 tracking-tight">
                  Quick Start
                </h4>
                <pre className="text-sm text-gray-300 bg-black/50 p-4 rounded-xl font-mono overflow-x-auto">
                  {`curl -X POST \\
  https://api.neurolint.com/v1/analyze \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "const x = 1;",
    "layers": [1, 2, 3]
  }'`}
                </pre>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://docs.neurolint.dev/api"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <button className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl">
                  View Full Documentation
                </button>
              </a>
              <a
                href="https://app.neurolint.dev/contact"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="border-2 border-zinc-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:border-zinc-600 transition-all duration-300">
                  Request Enterprise Demo
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              Seamless Integrations
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Connect NeuroLint with your existing development tools and
              workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-white transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                GitHub Actions
              </h3>
              <p className="text-zinc-400 text-sm">
                Automated code analysis on every pull request
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-white transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Jenkins</h3>
              <p className="text-zinc-400 text-sm">
                Integrate with your CI/CD pipeline
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-white transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Slack</h3>
              <p className="text-zinc-400 text-sm">
                Get notifications in your team channels
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-white transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Webhooks
              </h3>
              <p className="text-zinc-400 text-sm">
                Custom integrations with any platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <TechnologySection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto relative">
          <div className="relative bg-zinc-900/70 border-2 border-zinc-800 rounded-3xl p-16 md:p-24 text-center backdrop-blur-xl">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              Ready to Transform Your Code?
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto font-medium">
              Join developers who are writing better code with our advanced
              transformation platform
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="https://app.neurolint.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all duration-300 text-lg shadow-2xl hover:scale-105"
              >
                Start Free Trial
              </a>
              <a
                href="https://app.neurolint.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 bg-black/50 text-white font-black rounded-2xl border-2 border-zinc-800 hover:bg-black hover:border-zinc-600 transition-all duration-300 text-lg backdrop-blur-xl hover:scale-105"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
