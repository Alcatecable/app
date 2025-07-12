'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Onboarding = () => {
  return (
    <section className="py-12 bg-zinc-900 rounded-lg overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Supercharge Your Code with AI
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Automated code transformations that learn and adapt to your style.
          </p>
        </div>

        <LayerFlowAnimation />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          <FeatureCard
            title="Automated Code Fixes"
            description="AI-powered transformations that fix common code issues automatically."
            icon="🛠️"
            delay={0}
          />
          <FeatureCard
            title="Adaptive Learning"
            description="Learns from your coding patterns to provide personalized suggestions."
            icon="🧠"
            delay={0.5}
          />
          <FeatureCard
            title="SSR & Hydration Support"
            description="Optimizes your code for server-side rendering and hydration."
            icon="💧"
            delay={1}
          />
        </div>
      </div>

      <BackgroundCircles />
    </section>
  );
};

const FeatureCard = ({ title, description, icon, delay }: {
  title: string;
  description: string;
  icon: string;
  delay: number;
}) => (
  <FloatingAnimation delay={delay}>
    <div className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-colors duration-300">
      <div className="text-4xl text-blue-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  </FloatingAnimation>
);

const BackgroundCircles = () => (
  <div className="absolute inset-0 pointer-events-none">
    {[1, 2, 3].map((index) => (
      <PulseAnimation key={index}>
        <motion.div
          className="absolute rounded-full bg-blue-500 opacity-10"
          style={{
            width: `${index * 150}px`,
            height: `${index * 150}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
            delay: Math.random() * 2,
          }}
        />
      </PulseAnimation>
    ))}
  </div>
);

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

export default Onboarding;
