import "@testing-library/jest-dom";

// Ensure process is available for Babel
if (typeof process === "undefined") {
  (globalThis as any).process = {
    env: { NODE_ENV: "test" },
    version: "18.0.0",
    versions: { node: "18.0.0" },
    platform: "browser",
    cwd: () => "/",
    memoryUsage: () => ({ heapUsed: 0, heapTotal: 0 }),
  };
}

// Mock browser APIs that aren't available in JSDOM
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
