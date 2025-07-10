import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  MessageCircle, 
  FileText, 
  ExternalLink,
  Phone,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { UnifiedHeader } from '@/components/navigation/UnifiedHeader';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help from our support team',
      action: 'Send Email',
      link: 'mailto:founder@neurolint.dev',
      type: 'email'
    },
    {
      icon: MessageCircle,
      title: 'Community Forum',
      description: 'Join discussions with other developers',
      action: 'Visit Forum',
      link: 'https://forum.neurolint.dev',
      type: 'external'
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Find answers in our comprehensive docs',
      action: 'View Docs',
      link: 'https://docs.neurolint.dev',
      type: 'external'
    },
    {
      icon: Globe,
      title: 'Website',
      description: 'Visit our main website for more information',
      action: 'Visit Website',
      link: 'https://neurolint.dev',
      type: 'external'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <UnifiedHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Have questions about NeuroLint? Need help with code transformation? 
            We're here to help you get the most out of our platform.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {contactMethods.map((method, index) => (
            <Card key={index} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-800/30">
              <CardHeader className="pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/20 mb-4">
                  <method.icon className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-white">
                  {method.title}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {method.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                >
                  {method.type === 'external' ? (
                    <a 
                      href={method.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      {method.action}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <a href={method.link} className="flex items-center gap-2">
                      {method.action}
                    </a>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Start Guide</h2>
          <p className="text-zinc-300 mb-6">
            New to NeuroLint? Here are some helpful resources to get you started:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-green-600/20 border border-green-500/20">
                <span className="text-green-400 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Try NeuroLint</h3>
                <p className="text-zinc-400 text-sm">Start with our interactive demo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600/20 border border-blue-500/20">
                <span className="text-blue-400 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Read the Docs</h3>
                <p className="text-zinc-400 text-sm">Learn about our features</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-600/20 border border-purple-500/20">
                <span className="text-purple-400 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Join Community</h3>
                <p className="text-zinc-400 text-sm">Connect with other developers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Contact */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Enterprise Solutions</h2>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            Looking for enterprise-grade code transformation with custom integrations, 
            dedicated support, and SLA guarantees? Let's discuss your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              className="bg-white text-black hover:bg-gray-100 font-medium"
            >
              <a href="mailto:founder@neurolint.dev?subject=Enterprise%20Inquiry">
                Contact Sales
              </a>
            </Button>
            <Button 
              asChild
              variant="outline" 
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              <a 
                href="https://docs.neurolint.dev/enterprise" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                View Enterprise Features
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-900/20 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/neurolint" className="text-zinc-400 hover:text-white transition-colors">NeuroLint Tool</Link></li>
                <li><a href="https://vs.neurolint.dev" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">VS Code Extension</a></li>
                <li><a href="https://docs.neurolint.dev" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://docs.neurolint.dev/api" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Community</h3>
              <ul className="space-y-2">
                <li><a href="https://forum.neurolint.dev" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Forum</a></li>
                <li><a href="https://neurolint.dev" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Website</a></li>
                <li><a href="mailto:founder@neurolint.dev" className="text-zinc-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="https://docs.neurolint.dev/getting-started" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Getting Started</a></li>
                <li><a href="https://docs.neurolint.dev/guides" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Guides</a></li>
                <li><a href="https://docs.neurolint.dev/examples" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="https://neurolint.dev/about" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">About</a></li>
                <li><a href="mailto:founder@neurolint.dev" className="text-zinc-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="https://neurolint.dev/privacy" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="https://neurolint.dev/terms" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800/50 mt-8 pt-8 text-center">
            <p className="text-zinc-400">
              © 2024 NeuroLint. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;