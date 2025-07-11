import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedOnboarding from '@/components/EnhancedOnboarding';

const EnhancedOnboardingDemo = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <EnhancedOnboarding 
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
};

export default EnhancedOnboardingDemo;