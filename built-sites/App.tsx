import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <TooltipProvider>
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-all duration-200"
      >
        Skip to main content
      </a>

      <Toaster />
      <Sonner />

      <div className="min-h-screen bg-black text-white">
        <SiteHeader />
        <main id="main-content" className="relative">
          <Index />
        </main>
        <SiteFooter />
      </div>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
