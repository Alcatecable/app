
import { Header } from "@/components/dashboard/Header";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SystemOverview } from "@/components/dashboard/SystemOverview";
import { LayerArchitecture } from "@/components/dashboard/LayerArchitecture";
import { CLICommands } from "@/components/dashboard/CLICommands";
import { Documentation } from "@/components/dashboard/Documentation";
import { Footer } from "@/components/dashboard/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />
        
        <div className="grid gap-8 mt-8">
          <QuickActions />
          <SystemOverview />
          <LayerArchitecture />
          <CLICommands />
          <Documentation />
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Index;
