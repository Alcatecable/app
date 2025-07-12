'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { patternLearner } from '@/lib/neurolint/pattern-learner';
import { Brain, TrendingUp, Database, Zap } from 'lucide-react';

export default function Layer7Test() {
  const [stats, setStats] = useState(patternLearner.getStatistics());
  const [isLearning, setIsLearning] = useState(false);

  const refreshStats = () => {
    setStats(patternLearner.getStatistics());
  };

  const simulateLearning = () => {
    setIsLearning(true);
    
    // Simulate pattern learning
    setTimeout(() => {
      patternLearner.learn(
        'const message = "&quot;Hello&quot;";',
        'const message = "Hello";',
        2,
        ['Fixed HTML entity corruption']
      );
      
      patternLearner.learn(
        'localStorage.getItem("theme")',
        'typeof window !== "undefined" && localStorage.getItem("theme")',
        4,
        ['Added SSR guard for localStorage']
      );
      
      refreshStats();
      setIsLearning(false);
    }, 1500);
  };

  const clearLearning = () => {
    patternLearner.clearRules();
    setStats(patternLearner.getStatistics());
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="w-8 h-8" />
          Layer 7: Pattern Learning
        </h1>
        <p className="text-muted-foreground">
          Advanced pattern recognition and learning system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4" />
              Total Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRules}</div>
            <p className="text-xs text-muted-foreground">Learned patterns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Active Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeRules}</div>
            <p className="text-xs text-muted-foreground">High confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(stats.overallSuccessRate * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Overall accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Times applied</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pattern Learning System</CardTitle>
          <CardDescription>
            Monitor and control the AI pattern learning capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Confidence</span>
              <span>{Math.round(stats.averageConfidence * 100)}%</span>
            </div>
            <Progress value={stats.averageConfidence * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Success Rate</span>
              <span>{Math.round(stats.overallSuccessRate * 100)}%</span>
            </div>
            <Progress value={stats.overallSuccessRate * 100} className="bg-green-100" />
          </div>

          <div className="flex gap-2">
            <Button onClick={simulateLearning} disabled={isLearning}>
              {isLearning ? 'Learning...' : 'Simulate Learning'}
            </Button>
            <Button variant="outline" onClick={refreshStats}>
              Refresh Stats
            </Button>
            <Button variant="outline" onClick={clearLearning}>
              Clear Rules
            </Button>
          </div>

          {stats.totalRules > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Learned Rules</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {patternLearner.getLearnedRules().slice(0, 10).map((rule, index) => (
                  <div key={rule.id} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div>
                      <span className="font-medium">{rule.description}</span>
                      <div className="text-xs text-muted-foreground">
                        Layer {rule.layerId} • Used {rule.usage || 0} times
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {Math.round(rule.confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
