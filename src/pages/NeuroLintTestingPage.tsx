import React from "react";
import { NeuroLintTester } from "@/components/testing/NeuroLintTester";

const NeuroLintTestingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NeuroLintTester />
    </div>
  );
};

export default NeuroLintTestingPage;
