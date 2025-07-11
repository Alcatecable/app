import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  // Typewriter animation state
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Code transformation animation state
  const [scanLinePosition, setScanLinePosition] = useState(0);
  const [showTransformed, setShowTransformed] = useState(false);
  const [showCheckIcon, setShowCheckIcon] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  
  // Pipeline ticker state
  const [tickerOffset, setTickerOffset] = useState(0);
  
  const { toast } = useToast();
  
  const fullText = "Welcome to NeuroLint: Transform Your Code with Confidence";
  const segments = [
    { text: "Welcome", delay: 300 },
    { text: " to NeuroLint", delay: 200, bold: true },
    { text: ": Transform Your Code with Confidence", delay: 100 }
  ];

  const beforeCode = `// Legacy React Component
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: input, 
        completed: false 
      }]);
      setInput('');
    }
  };

  return (
    <div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={addTodo}>Add</button>
      {todos.map(todo => (
        <div key={todo.id}>
          <input 
            type="checkbox" 
            checked={todo.completed}
          />
          {todo.text}
        </div>
      ))}
    </div>
  );
}`;

  const afterCode = `// Optimized with NeuroLint
'use client';
import React, { useState, useCallback } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoList(): JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>('');

  const addTodo = useCallback(() => {
    if (input.trim()) {
      setTodos(prev => [...prev, { 
        id: Date.now(), 
        text: input.trim(), 
        completed: false 
      }]);
      setInput('');
    }
  }, [input]);

  const toggleTodo = useCallback((id: number) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed } 
        : todo
    ));
  }, []);

  return (
    <div role="main" aria-label="Todo List">
      <div className="input-group">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
          aria-label="New todo input"
        />
        <button 
          onClick={addTodo}
          aria-label="Add todo"
        >
          Add
        </button>
      </div>
      <ul role="list" aria-label="Todo items">
        {todos.map(todo => (
          <li key={todo.id} role="listitem">
            <input 
              type="checkbox" 
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              aria-label={\`Mark "\${todo.text}" as \${todo.completed ? 'incomplete' : 'complete'}\`}
            />
            <span className={todo.completed ? 'completed' : ''}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;`;

  // Typewriter effect
  useEffect(() => {
    let currentSegment = 0;
    let currentChar = 0;
    let currentText = '';

    const typeNextCharacter = () => {
      if (currentSegment >= segments.length) {
        setAnimationComplete(true);
        return;
      }

      const segment = segments[currentSegment];
      if (currentChar < segment.text.length) {
        currentText += segment.text[currentChar];
        setDisplayedText(currentText);
        currentChar++;
        setTimeout(typeNextCharacter, 50);
      } else {
        setTimeout(() => {
          currentSegment++;
          currentChar = 0;
          if (currentSegment < segments.length) {
            setTimeout(typeNextCharacter, segments[currentSegment].delay);
          } else {
            setAnimationComplete(true);
          }
        }, 200);
      }
    };

    const timer = setTimeout(typeNextCharacter, 500);
    return () => clearTimeout(timer);
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Code transformation animation
  useEffect(() => {
    if (!animationComplete || isAnimationPaused) return;

    const interval = setInterval(() => {
      setScanLinePosition(prev => {
        if (prev >= 100) {
          setShowTransformed(true);
          setTimeout(() => setShowCheckIcon(true), 200);
          setTimeout(() => {
            setScanLinePosition(0);
            setShowTransformed(false);
            setShowCheckIcon(false);
          }, 3000);
          return 0;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [animationComplete, isAnimationPaused]);

  // Pipeline ticker animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset(prev => prev - 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const pipelineLayers = [
    "Layer 1: Configuration",
    "Layer 2: Entity Cleanup", 
    "Layer 3: Components",
    "Layer 4: Hydration",
    "Layer 5: Next.js Fixes",
    "Layer 6: Testing",
    "Layer 7: Adaptive Learning (Beta)"
  ];

  const tickerText = pipelineLayers.join(" | ");

  const handleGetStarted = () => {
    toast({
      title: "Welcome to NeuroLint!",
      description: "Let's start transforming your code with confidence.",
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full space-y-12">
          
          {/* Animated Headline */}
          <div 
            className="text-center space-y-6"
            style={{
              border: '1px solid #4A4A4A',
              borderRadius: '8px',
              padding: '2rem',
              animation: 'borderPulse 2s infinite ease-in-out'
            }}
          >
            <h1 
              className="text-4xl md:text-5xl font-bold"
              role="heading" 
              aria-level={1}
              aria-label="Main headline"
            >
              {displayedText}
              {!animationComplete && (
                <span 
                  className={`inline-block w-0.5 h-12 ml-1 ${showCursor ? 'bg-zinc-400' : 'bg-transparent'}`}
                  aria-hidden="true"
                />
              )}
            </h1>
            
            <p className="text-xl text-zinc-300 max-w-4xl mx-auto leading-relaxed">
              NeuroLint is an enterprise-grade code transformation tool that validates and optimizes your code using a layered pipeline, including adaptive pattern learning. Start improving your TypeScript, JavaScript, and Next.js code today!
            </p>
          </div>

          {/* Code Transformation Animation */}
          <div 
            className="relative"
            style={{
              border: '1px solid #4A4A4A',
              borderRadius: '8px',
              padding: '1.5rem',
              animation: 'borderPulse 2s infinite ease-in-out'
            }}
            onMouseEnter={() => setIsAnimationPaused(true)}
            onMouseLeave={() => setIsAnimationPaused(false)}
            role="region"
            aria-label="Code transformation demonstration"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-zinc-300">Before</h3>
                <div 
                  className="relative bg-zinc-900 rounded-lg p-4 font-mono text-sm overflow-hidden"
                  style={{ border: '1px solid #4A4A4A' }}
                >
                  <pre className="text-zinc-200 whitespace-pre-wrap">
                    {beforeCode}
                  </pre>
                  
                  {/* Scan Line */}
                  {scanLinePosition > 0 && (
                    <div 
                      className="absolute left-0 right-0 h-px bg-zinc-400 opacity-80"
                      style={{ 
                        top: `${scanLinePosition}%`,
                        boxShadow: '0 0 10px #4A4A4A'
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-zinc-300">After</h3>
                <div 
                  className="relative bg-zinc-900 rounded-lg p-4 font-mono text-sm overflow-hidden"
                  style={{ border: '1px solid #4A4A4A' }}
                >
                  <pre className={`text-zinc-200 whitespace-pre-wrap transition-opacity duration-300 ${showTransformed ? 'opacity-100' : 'opacity-30'}`}>
                    {afterCode}
                  </pre>
                  
                  {showCheckIcon && (
                    <div 
                      className="absolute top-4 right-4 animate-scale-in"
                      aria-label="Transformation complete"
                      role="img"
                    >
                      <svg 
                        className="w-6 h-6 text-zinc-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {isAnimationPaused && (
              <div 
                className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg"
                role="tooltip"
                aria-label="Animation paused - showing before and after states"
              >
                <div className="text-center space-y-2">
                  <p className="text-zinc-300 font-semibold">Transformation Preview</p>
                  <p className="text-zinc-400 text-sm">Layers 1-6: Configuration, Cleanup, Components, Hydration, Next.js Fixes, Testing</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div 
            className="flex justify-center space-x-6"
            style={{
              border: '1px solid #4A4A4A',
              borderRadius: '8px',
              padding: '2rem',
              animation: 'borderPulse 2s infinite ease-in-out'
            }}
          >
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="
                bg-white hover:bg-zinc-100 text-black font-semibold px-8 py-3
                border border-zinc-400 transition-all duration-200
                hover:border-2 hover:border-zinc-600 hover:scale-98
                active:animate-ripple
              "
              style={{
                boxShadow: '0 0 0 1px #4A4A4A'
              }}
              aria-label="Start using NeuroLint"
            >
              Get Started
              <svg 
                className="ml-2 h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button
              onClick={onSkip}
              variant="outline"
              size="lg"
              className="
                border-zinc-400 text-zinc-300 hover:bg-zinc-800 font-semibold px-8 py-3
                transition-all duration-200 hover:border-2 hover:border-zinc-600 hover:scale-98
                active:animate-ripple
              "
              aria-label="Skip onboarding for advanced users"
            >
              <svg 
                className="mr-2 h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Skip
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline Ticker */}
      <div 
        className="border-t border-zinc-400 bg-black overflow-hidden"
        style={{ height: '60px' }}
        role="region"
        aria-label="NeuroLint pipeline layers"
      >
        <div 
          className="flex items-center h-full whitespace-nowrap text-sm text-zinc-300"
          style={{ 
            transform: `translateX(${tickerOffset}px)`,
            width: 'max-content'
          }}
          aria-hidden="true"
        >
          <span className="inline-block px-4">
            {Array(5).fill(tickerText).map((text, index) => (
              <span key={index}>
                {pipelineLayers.map((layer, layerIndex) => (
                  <span key={layerIndex}>
                    <span className={layer.includes('(Beta)') ? 'text-zinc-500' : 'text-white'}>
                      {layer}
                    </span>
                    {layerIndex < pipelineLayers.length - 1 && (
                      <span className="text-zinc-400 mx-4">|</span>
                    )}
                  </span>
                ))}
                <span className="text-zinc-400 mx-4">|</span>
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes borderPulse {
          0%, 100% { border-width: 1px; }
          50% { border-width: 2px; }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes ripple {
          0% { box-shadow: 0 0 0 0 rgba(74, 74, 74, 0.4); }
          100% { box-shadow: 0 0 0 10px rgba(74, 74, 74, 0); }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .hover\\:scale-98:hover {
          transform: scale(0.98);
        }
        
        .active\\:animate-ripple:active {
          animation: ripple 0.6s ease-out;
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .text-zinc-300 { color: #ffffff; }
          .text-zinc-400 { color: #cccccc; }
          .border-zinc-400 { border-color: #ffffff; }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}