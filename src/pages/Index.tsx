
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
  Upload,
  Terminal,
  Zap
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
    <div className="min-h-screen bg-black text-white">
      {/* Header with neurolint.dev styling */}
      <header className="border-b border-zinc-800/50 bg-black/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-600">
                <Terminal className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NeuroLint</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-zinc-300">{user.email}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-zinc-300 hover:bg-zinc-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-white text-black hover:bg-gray-100 font-medium"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Terminal inspired */}
      <section className="section-padding container-padding">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <div className="flex h-16 w-16 items-center justify-center mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mb-6">
              <Terminal className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl leading-tight mb-6">
            Advanced Code
            <br />
            <span className="text-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text">
              Transformation Platform
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-300 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Currently in beta with AI-ready architecture. Advanced code analysis and
            transformation using proven rule-based techniques.
            <br className="hidden sm:block" />
            AI integration planned for future releases.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-black font-bold hover:bg-gray-100 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <ArrowRight className="mr-3 w-5 h-5" />
              {user ? 'Open Dashboard' : 'Try NeuroLint Free'}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-xl text-lg transition-all duration-300"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding container-padding bg-zinc-900/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Everything you need for code transformation
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              A comprehensive platform with advanced features for professional development teams
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-800/30">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/20">
                  <Settings className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-white">
                  Multi-Layer Processing
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Seven specialized layers for comprehensive code analysis and transformation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Configuration optimization
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Pattern recognition
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Adaptive learning
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-800/30">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/20 border border-green-500/20">
                  <Upload className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-white">
                  Multiple Input Methods
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Upload files, paste code, or import directly from GitHub repositories
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    File upload support
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    GitHub integration
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Direct code input
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-800/30">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 border border-purple-500/20">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-white">
                  Enterprise Security
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Built-in validation, error recovery, and secure processing
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Automatic rollback
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Error recovery
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Secure processing
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-800/30">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600/20 border border-orange-500/20">
                  <GitBranch className="h-6 w-6 text-orange-400" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-white">
                  GitHub Integration
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Import and analyze code directly from public GitHub repositories
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Repository browsing
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    File selection
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Direct import
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-800/30">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600/20 border border-cyan-500/20">
                  <Activity className="h-6 w-6 text-cyan-400" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-white">
                  Real-time Processing
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Fast, efficient transformation with detailed progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Progress tracking
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Performance metrics
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Detailed results
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-800/30">
              <CardHeader className="pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-600/20 border border-yellow-500/20">
                  <Database className="h-6 w-6 text-yellow-400" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-white">
                  Adaptive Learning
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Advanced pattern learning that improves with each transformation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Pattern recognition
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Continuous improvement
                  </div>
                  <div className="flex items-center text-sm text-zinc-300">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                    Smart recommendations
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding container-padding">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
            Start transforming your code today
          </h2>
          <p className="text-lg leading-8 text-zinc-400 max-w-2xl mx-auto mb-12">
            Join development teams who trust NeuroLint for professional code analysis and transformation.
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-black font-bold hover:bg-gray-100 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <ArrowRight className="mr-3 w-5 h-5" />
              {user ? 'Open Dashboard' : 'Get Started'}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-600">
                <Terminal className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">NeuroLint</span>
            </div>
            <p className="text-sm text-zinc-400">
              Advanced code transformation platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
