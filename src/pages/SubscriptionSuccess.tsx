
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const subscriptionId = searchParams.get('subscription_id');
    const token = searchParams.get('token');

    if (subscriptionId || token) {
      // Here you would typically confirm the subscription with your backend
      setTimeout(() => {
        setProcessing(false);
        toast({
          title: "Subscription Activated!",
          description: "Your subscription has been successfully activated."
        });
      }, 2000);
    } else {
      setProcessing(false);
    }
  }, [searchParams, toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {processing ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              ) : (
                <CheckCircle className="h-12 w-12 text-green-500" />
              )}
            </div>
            <CardTitle>
              {processing ? 'Processing Your Subscription...' : 'Subscription Successful!'}
            </CardTitle>
            <CardDescription>
              {processing 
                ? 'Please wait while we confirm your subscription with PayPal.'
                : 'Your subscription has been activated and you can now enjoy all the benefits of your plan.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {!processing && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You will receive a confirmation email from PayPal shortly.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your increased transformation limits are now active.
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate('/profile')}>
                    View Profile
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
