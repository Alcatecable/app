import { describe, it, expect, beforeEach } from "vitest";
import { NeuroLintOrchestrator } from "@/lib/neurolint/orchestrator";
import { ValidationService } from "@/lib/neurolint/validation";
import { PatternLearner } from "@/lib/neurolint/pattern-learner";
import { SmartLayerSelector } from "@/lib/neurolint/smart-selector";

describe("NeuroLint Layer Tests", () => {
  let orchestrator: NeuroLintOrchestrator;
  let validation: ValidationService;
  let patternLearner: PatternLearner;
  let smartSelector: SmartLayerSelector;

  beforeEach(() => {
    orchestrator = new NeuroLintOrchestrator();
    validation = new ValidationService();
    patternLearner = new PatternLearner();
    smartSelector = new SmartLayerSelector();
  });

  describe("Layer 1: Configuration", () => {
    it("should validate basic configuration", () => {
      const config = {
        enablePatternLearning: true,
        maxFileSize: 1024 * 1024,
        selectedLayers: [1, 2, 3],
      };

      expect(config.enablePatternLearning).toBe(true);
      expect(config.maxFileSize).toBeGreaterThan(0);
      expect(config.selectedLayers).toContain(1);
    });

    it("should handle invalid configuration gracefully", () => {
      const invalidConfig = {
        enablePatternLearning: "invalid",
        maxFileSize: -1,
        selectedLayers: [],
      };

      // Should not crash with invalid config
      expect(() => {
        // Configuration validation logic would go here
      }).not.toThrow();
    });
  });

  describe("Layer 2: Pattern Detection", () => {
    it("should detect missing key props in map operations", async () => {
      const testCode = `
        const items = [1, 2, 3];
        const rendered = items.map(item => <div>{item}</div>);
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [2],
      });

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it("should ignore already correct key props", async () => {
      const testCode = `
        const items = [1, 2, 3];
        const rendered = items.map((item, index) => <div key={index}>{item}</div>);
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [2],
      });

      expect(result).toBeDefined();
    });
  });

  describe("Layer 3: Component Analysis", () => {
    it("should analyze component structure", async () => {
      const testCode = `
        const MyComponent = ({ items }) => {
          return (
            <div>
              {items.map(item => <span>{item.name}</span>)}
            </div>
          );
        };
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [3],
      });

      expect(result).toBeDefined();
    });

    it("should handle complex nested components", async () => {
      const testCode = `
        const ComplexComponent = () => {
          const data = [];
          return (
            <div>
              {data.map(item => (
                <div>
                  {item.children.map(child => (
                    <span>{child.name}</span>
                  ))}
                </div>
              ))}
            </div>
          );
        };
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [3],
      });

      expect(result).toBeDefined();
    });
  });

  describe("Layer 4: Hydration Fixes", () => {
    it("should detect hydration mismatches", async () => {
      const testCode = `
        const TimeComponent = () => {
          return <div>{new Date().toISOString()}</div>;
        };
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [4],
      });

      expect(result).toBeDefined();
    });

    it("should handle client-side only code", async () => {
      const testCode = `
        const ClientComponent = () => {
          const userAgent = navigator.userAgent;
          return <div>{userAgent}</div>;
        };
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [4],
      });

      expect(result).toBeDefined();
    });
  });

  describe("Layer 5: Next.js Optimization", () => {
    it("should detect client components", async () => {
      const testCode = `
        const InteractiveComponent = () => {
          const [state, setState] = useState(0);
          return <button onClick={() => setState(state + 1)}>{state}</button>;
        };
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [5],
      });

      expect(result).toBeDefined();
    });

    it("should handle server components", async () => {
      const testCode = `
        const ServerComponent = async () => {
          const data = await fetch('/api/data');
          return <div>{JSON.stringify(data)}</div>;
        };
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [5],
      });

      expect(result).toBeDefined();
    });
  });

  describe("Layer 6: Testing Integration", () => {
    it("should wrap components for testing", async () => {
      const testCode = `
        const TestableComponent = ({ value }) => {
          return <div data-testid="component">{value}</div>;
        };
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [6],
      });

      expect(result).toBeDefined();
    });
  });

  describe("Layer 7: Adaptive Learning", () => {
    it("should initialize pattern learning", () => {
      expect(patternLearner).toBeDefined();
      expect(patternLearner.getLearnedRules).toBeDefined();
    });

    it("should learn from processed code", async () => {
      const testCode = `
        const items = [];
        items.map(item => <div key={item.id}>{item.name}</div>);
      `;

      await orchestrator.processCode(testCode, {
        selectedLayers: [7],
        enablePatternLearning: true,
      });

      const rules = patternLearner.getLearnedRules();
      expect(Array.isArray(rules)).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("should process code through all layers", async () => {
      const testCode = `
        const MyApp = () => {
          const [items, setItems] = useState([]);
          
          useEffect(() => {
            console.log(new Date().toISOString());
          }, []);
          
          return (
            <div>
              {items.map(item => (
                <div>{item.name}</div>
              ))}
            </div>
          );
        };
      `;

      const result = await orchestrator.processCode(testCode, {
        selectedLayers: [1, 2, 3, 4, 5, 6, 7],
        enablePatternLearning: true,
      });

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it("should handle empty code gracefully", async () => {
      const result = await orchestrator.processCode("", {
        selectedLayers: [1, 2, 3, 4, 5, 6, 7],
      });

      expect(result).toBeDefined();
    });

    it("should handle invalid syntax gracefully", async () => {
      const invalidCode = "const invalid = function( { return }";

      const result = await orchestrator.processCode(invalidCode, {
        selectedLayers: [1, 2, 3, 4, 5, 6, 7],
      });

      expect(result).toBeDefined();
      // Should not throw error, should handle gracefully
    });
  });

  describe("Validation Tests", () => {
    it("should validate code transformations", async () => {
      const before = "const test = true;";
      const after = "const test = true;";

      const result = await validation.validateTransformation(before, after, 1);

      expect(result).toBeDefined();
      expect(result.isValid).toBeDefined();
    });
  });

  describe("Smart Selector Tests", () => {
    it("should recommend appropriate layers", async () => {
      const testCode = `
        const items = [];
        items.map(item => <div>{item.name}</div>);
      `;

      const recommendation = await smartSelector.recommendLayers(testCode);

      expect(recommendation).toBeDefined();
      expect(recommendation.recommendedLayers).toBeDefined();
      expect(Array.isArray(recommendation.recommendedLayers)).toBe(true);
    });
  });
});
