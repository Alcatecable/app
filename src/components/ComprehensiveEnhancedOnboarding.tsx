'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const LayerFlowAnimation = () => {
  const layers = [
    "Config Fix",
    "Pattern Clean", 
    "Component Fix",
    "Hydration Guard",
    "Next.js Router",
    "Testing Setup",
    "AI Learning"
  ];

  return (
    <div className="border border-zinc-700 rounded-lg bg-zinc-900/30 overflow-hidden">
      <div className="flex space-x-8 py-3 animate-scroll">
        {[...layers, ...layers].map((layer, index) => (
          <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
            <span className="text-sm text-zinc-300">{layer}</span>
            <ArrowRight className="h-3 w-3 text-zinc-500" />
          </div>
        ))}
      </div>
      
      <style>{`
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        @keyframes scroll {
          0% { 
            transform: translateX(0); 
          }
          100% { 
            transform: translateX(-50%); 
          }
        }
      `}</style>
    </div>
  );
};

const FeatureItem = ({ title, description, badge }: { title: string; description: string; badge?: string }) => (
  <div className="flex items-start space-x-4">
    {badge && (
      <Badge className="bg-green-500 border-none text-white">{badge}</Badge>
    )}
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  </div>
);

const CodeSnippet = ({ code }: { code: string }) => (
  <pre className="bg-zinc-800 rounded-md p-4 overflow-x-auto">
    <code className="text-sm text-zinc-200">{code}</code>
  </pre>
);

const LayerAccordion = () => (
  <Accordion type="single" collapsible className="w-full">
    <AccordionItem value="layer-1">
      <AccordionTrigger>Layer 1: Configuration Fixes</AccordionTrigger>
      <AccordionContent>
        <p className="text-sm text-zinc-400">
          Fixes common configuration issues in TypeScript, ESLint, and other
          config files.
        </p>
        <CodeSnippet
          code={`
        // Example: Fixing TypeScript config
        {
          "compilerOptions": {
            "target": "es5",
            "lib": ["dom", "esnext"]
          }
        }
        `}
        />
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="layer-2">
      <AccordionTrigger>Layer 2: Pattern Recognition</AccordionTrigger>
      <AccordionContent>
        <p className="text-sm text-zinc-400">
          Recognizes and fixes common code patterns, such as HTML entity
          corruption and unused imports.
        </p>
        <CodeSnippet
          code={`
        // Example: Fixing HTML entity
        const message = "Hello &quot;World&quot;";
        `}
        />
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="layer-3">
      <AccordionTrigger>Layer 3: Component Enhancement</AccordionTrigger>
      <AccordionContent>
        <p className="text-sm text-zinc-400">
          Enhances React components by adding missing key props, standardizing
          button variants, and more.
        </p>
        <CodeSnippet
          code={`
        // Example: Adding missing key prop
        items.map((item) => <div key={item.id}>{item.name}</div>)
        `}
        />
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="layer-4">
      <AccordionTrigger>Layer 4: Hydration & SSR</AccordionTrigger>
      <AccordionContent>
        <p className="text-sm text-zinc-400">
          Fixes hydration issues and adds SSR guards for browser-specific code.
        </p>
        <CodeSnippet
          code={`
        // Example: Adding SSR guard
        const theme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
        `}
        />
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="layer-5">
      <AccordionTrigger>Layer 5: Next.js App Router</AccordionTrigger>
      <AccordionContent>
        <p className="text-sm text-zinc-400">
          Addresses common issues in Next.js App Router, such as misplaced
          "use client" directives.
        </p>
        <CodeSnippet
          code={`
        // Example: Fixing misplaced "use client"
        import React from 'react';
        'use client';
        `}
        />
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="layer-6">
      <AccordionTrigger>Layer 6: Testing & Validation</AccordionTrigger>
      <AccordionContent>
        <p className="text-sm text-zinc-400">
          Adds error boundaries and other testing/validation mechanisms to
          improve code reliability.
        </p>
        <CodeSnippet
          code={`
        // Example: Adding error boundary
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
        `}
        />
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="layer-7">
      <AccordionTrigger>Layer 7: AI Pattern Learning</AccordionTrigger>
      <AccordionContent>
        <p className="text-sm text-zinc-400">
          Learns from previous transformations to apply common fixes
          automatically.
        </p>
        <CodeSnippet
          code={`
        // Example: AI Learning
        // The system learns from previous transformations and applies common fixes automatically.
        `}
        />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default function ComprehensiveEnhancedOnboarding() {
  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Comprehensive Enhanced Onboarding
        </h1>
        <p className="text-zinc-400">
          Learn about the NeuroLint system and its capabilities.
        </p>
      </div>

      <Card className="bg-zinc-900/30 border-zinc-700">
        <CardHeader>
          <CardTitle>How NeuroLint Works</CardTitle>
          <CardDescription>
            NeuroLint uses a layered approach to automatically fix and enhance
            your codebase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LayerFlowAnimation />
          <p className="text-sm text-zinc-400">
            Each layer focuses on a specific type of fix or enhancement,
            allowing for a modular and targeted approach.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/30 border-zinc-700">
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <CardDescription>
            Explore the core features that make NeuroLint a powerful tool for
            code transformation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeatureItem
            title="Automated Code Fixes"
            description="Automatically identify and fix common code issues, saving you time and effort."
            badge="AI"
          />
          <FeatureItem
            title="Layered Architecture"
            description="Modular architecture allows for targeted fixes and enhancements."
          />
          <FeatureItem
            title="SSR and Hydration Support"
            description="Fixes common SSR and hydration issues in Next.js applications."
            badge="Next.js"
          />
          <FeatureItem
            title="AI Pattern Learning"
            description="Learns from previous transformations to apply common fixes automatically."
            badge="AI"
          />
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/30 border-zinc-700">
        <CardHeader>
          <CardTitle>Layer Details</CardTitle>
          <CardDescription>
            Learn more about each layer and its specific capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LayerAccordion />
        </CardContent>
      </Card>

      <div className="text-center">
        <Button>Get Started</Button>
      </div>
    </div>
  );
}
