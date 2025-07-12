'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, CloudCog, Code, LayoutDashboard, Rocket, Sparkles, Star, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';

const FloatingAnimation = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <div className="floating-animation" style={{ animationDelay: `${delay}s` }}>
    {children}
    <style>{`
      .floating-animation {
        animation: float 6s ease-in-out infinite;
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
    `}</style>
  </div>
);

const PulseAnimation = ({ children }: { children: React.ReactNode }) => (
  <div className="pulse-animation">
    {children}
    <style>{`
      .pulse-animation {
        animation: pulse 2s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
  </div>
);

const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="space-y-0.5">
      <div className="flex items-center space-x-2">
        {icon}
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </div>
      <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
    </CardHeader>
  </Card>
);

export default function EnhancedOnboarding() {
  const [progress, setProgress] = useState(35);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsDarkTheme(theme === 'dark');
  }, [theme]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 animate-spin text-yellow-500" />
          Enhanced NeuroLint Onboarding
        </h1>
        <p className="text-muted-foreground">
          Experience the power of AI-driven code transformation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeatureCard
          title="AI-Powered Code Fixes"
          description="Automatically identify and fix common code issues with AI"
          icon={<CloudCog className="w-4 h-4 text-blue-500" />}
        />
        <FeatureCard
          title="Smart Layer Execution"
          description="Intelligently apply transformation layers for optimal results"
          icon={<LayoutDashboard className="w-4 h-4 text-green-500" />}
        />
        <FeatureCard
          title="Real-time Code Validation"
          description="Validate code transformations to ensure safety and correctness"
          icon={<CheckCircle2 className="w-4 h-4 text-purple-500" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transformation Pipeline</CardTitle>
          <CardDescription>
            Visualize the code transformation process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-blue-500" />
              <span>Configuration</span>
            </div>
            <Badge variant="outline">Complete</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-green-500" />
              <span>Pattern Recognition</span>
            </div>
            <Badge variant="outline">Complete</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-yellow-500" />
              <span>Component Enhancement</span>
            </div>
            <Badge variant="secondary">In Progress</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-red-500" />
              <span>Hydration & SSR</span>
            </div>
            <span>Pending</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-purple-500" />
              <span>Next.js App Router</span>
            </div>
            <span>Pending</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-orange-500" />
              <span>Testing & Validation</span>
            </div>
            <span>Pending</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-pink-500" />
              <span>Adaptive Learning</span>
            </div>
            <span>Pending</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Code Analysis</CardTitle>
            <CardDescription>
              Analyze your code for potential issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FloatingAnimation delay={1}>
              <Code className="w-12 h-12 text-blue-500 mx-auto" />
            </FloatingAnimation>
            <p className="text-center text-muted-foreground">
              NeuroLint analyzes your code to identify potential issues and
              suggest improvements.
            </p>
            <Button className="w-full">Analyze Code</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automated Fixes</CardTitle>
            <CardDescription>
              Apply automated fixes to improve your codebase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PulseAnimation>
              <Rocket className="w-12 h-12 text-green-500 mx-auto" />
            </PulseAnimation>
            <p className="text-center text-muted-foreground">
              Automatically apply fixes to improve code quality and
              performance.
            </p>
            <Button className="w-full">Apply Fixes</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Pattern Learning</CardTitle>
          <CardDescription>
            Continuously learn from code transformations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500 mr-2 animate-pulse" />
            <TrendingUp className="w-6 h-6 text-yellow-500 animate-bounce" />
            <Brain className="w-6 h-6 text-yellow-500 ml-2 animate-spin" />
          </div>
          <p className="text-center text-muted-foreground">
            NeuroLint learns from every transformation, improving its
            capabilities over time.
          </p>
          <Button className="w-full">Enable AI Learning</Button>
        </CardContent>
      </Card>
    </div>
  );
}
