#!/usr/bin/env node

// Verification script for AST validation functionality
import { TransformationValidator } from "./src/lib/neurolint/validation.js";

// Test Layer 3 (Component) AST validation
console.log("🧪 Testing Layer 3 (Component) AST Validation...");

const beforeComponent = `
function MyComponent({ items }) {
  return (
    <div>
      {items.map(item => <span>{item.name}</span>)}
    </div>
  );
}
`;

const afterComponent = `
function MyComponent({ items }) {
  return (
    <div>
      {items.map(item => <span key={item.id}>{item.name}</span>)}
    </div>
  );
}
`;

try {
  const result1 = TransformationValidator.validateTransformation(
    beforeComponent,
    afterComponent,
    3,
  );
  console.log("✅ Layer 3 validation result:", result1);
} catch (error) {
  console.log("❌ Layer 3 validation error:", error.message);
}

// Test Layer 4 (Hydration) AST validation
console.log("\n🧪 Testing Layer 4 (Hydration) AST Validation...");

const beforeHydration = `
function useTheme() {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme;
}
`;

const afterHydration = `
function useTheme() {
  const savedTheme = typeof window !== "undefined" && localStorage.getItem('theme');
  return savedTheme;
}
`;

try {
  const result2 = TransformationValidator.validateTransformation(
    beforeHydration,
    afterHydration,
    4,
  );
  console.log("✅ Layer 4 validation result:", result2);
} catch (error) {
  console.log("❌ Layer 4 validation error:", error.message);
}

// Test validation with invalid transformation
console.log("\n🧪 Testing validation with invalid transformation...");

const invalidAfter = `
function MyComponent({ items }) {
  return (
    <div>
      {items.map(item => <span>{item.name}</span>
    </div>
  );
}
`; // Missing closing tag

try {
  const result3 = TransformationValidator.validateTransformation(
    beforeComponent,
    invalidAfter,
    3,
  );
  console.log("✅ Invalid transformation result:", result3);
} catch (error) {
  console.log("❌ Invalid transformation error:", error.message);
}

console.log("\n🎉 AST validation verification completed!");
