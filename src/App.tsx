
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CompleteDashboard from "./pages/CompleteDashboard";
import ModernAdminDashboard from "./pages/ModernAdminDashboard";
import ModernNeuroLintPage from "./pages/ModernNeuroLintPage";
import ModernTestingPage from "./pages/ModernTestingPage";
import ModernProfilePage from "./pages/ModernProfilePage";
import ModernSubscriptionPage from "./pages/ModernSubscriptionPage";
import AuthPage from "./pages/AuthPage";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import EnhancedOnboarding from "./components/EnhancedOnboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={
              <EnhancedOnboarding 
                onComplete={() => window.location.href = '/dashboard'}
                onSkip={() => window.location.href = '/dashboard'}
              />
            } />
            <Route path="/dashboard" element={<CompleteDashboard />} />
            <Route path="/admin" element={<ModernAdminDashboard />} />
            <Route path="/neurolint" element={<ModernNeuroLintPage />} />
            <Route path="/testing" element={<ModernTestingPage />} />
            <Route path="/neurolint/testing" element={<ModernTestingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ModernProfilePage />} />
            <Route path="/subscription" element={<ModernSubscriptionPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/subscription/success"
              element={<SubscriptionSuccess />}
            />
            <Route
              path="/subscription/cancel"
              element={<SubscriptionCancel />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
