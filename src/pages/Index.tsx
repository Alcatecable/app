
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Settings, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle,
  User,
  LogOut,
  FileCode,
  GitBranch,
  Activity,
  Database,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">NeuroLint</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Intelligent Code Analysis
            <br />
            and Transformation
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            NeuroLint provides enterprise-grade code analysis and transformation through a sophisticated 
            multi-layer architecture. Improve code quality, reduce technical debt, and accelerate development.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="px-8 py-3"
            >
              {user ? 'Open Dashboard' : 'Get Started'}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn more
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for code transformation
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform with advanced features for professional development teams
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-gray-900">
                  Multi-Layer Processing
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Seven specialized layers for comprehensive code analysis and transformation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Configuration optimization
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Pattern recognition
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Adaptive learning
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-gray-900">
                  Multiple Input Methods
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Upload files, paste code, or import directly from GitHub repositories
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    File upload support
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    GitHub integration
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Direct code input
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-gray-900">
                  Enterprise Security
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Built-in validation, error recovery, and secure processing
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Automatic rollback
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Error recovery
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Secure processing
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-gray-900">
                  GitHub Integration
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Import and analyze code directly from public GitHub repositories
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Repository browsing
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    File selection
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Direct import
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-gray-900">
                  Real-time Processing
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Fast, efficient transformation with detailed progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Progress tracking
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Performance metrics
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Detailed results
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-gray-900">
                  Adaptive Learning
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Advanced pattern learning that improves with each transformation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Pattern recognition
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Continuous improvement
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Smart recommendations
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Start transforming your code today
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Join development teams who trust NeuroLint for professional code analysis and transformation.
          </p>
          <div className="mt-10">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="px-8 py-3"
            >
              {user ? 'Open Dashboard' : 'Get Started'}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
                <Code className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">NeuroLint</span>
            </div>
            <p className="text-sm text-gray-600">
              Professional code analysis and transformation platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
