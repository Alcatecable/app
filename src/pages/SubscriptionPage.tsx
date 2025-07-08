
import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';

export default function SubscriptionPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upgrade your NeuroLint experience with more transformations, advanced features, 
              and priority support. All plans include a 14-day free trial.
            </p>
          </div>
          <SubscriptionManager />
        </div>
      </div>
    </ProtectedRoute>
  );
}
