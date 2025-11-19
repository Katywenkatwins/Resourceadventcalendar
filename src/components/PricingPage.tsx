import { useState } from 'react';
import { Button } from './ui/button';
import { Home, LogOut, ArrowLeft } from 'lucide-react';
import { TierSelection } from './TierSelection';
import { useAuth } from '../App';

interface PricingPageProps {
  onPaymentSuccess: (tier: 'basic' | 'deep' | 'premium') => void;
  userName: string;
  onBackToHome?: () => void;
  onSignOut?: () => void;
}

export function PricingPage({ onPaymentSuccess, userName, onBackToHome, onSignOut }: PricingPageProps) {
  const { userProfile, checkAuth } = useAuth();

  const handlePaymentSuccess = async () => {
    console.log('PricingPage: handlePaymentSuccess called');
    
    // Wait a bit for data to be fully updated
    console.log('PricingPage: waiting 1 second for data sync...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Refresh user profile to get updated tier
    console.log('PricingPage: calling checkAuth...');
    await checkAuth();
    console.log('PricingPage: checkAuth completed, userProfile:', userProfile);
    
    // Call parent success handler
    console.log('PricingPage: calling onPaymentSuccess with tier:', userProfile?.tier);
    onPaymentSuccess(userProfile?.tier || 'basic');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#e8e4e1' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-2" style={{ borderColor: '#2d5a3d20' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#1e3a5f', fontFamily: 'Arial, sans-serif' }}>
                Вітаємо, {userName}!
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onBackToHome && (
                <Button
                  variant="ghost"
                  onClick={onBackToHome}
                  className="hover:bg-[#2d5a3d]/10"
                  style={{ color: '#2d5a3d', fontFamily: 'Arial, sans-serif' }}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Головна
                </Button>
              )}
              {onSignOut && (
                <Button
                  variant="ghost"
                  onClick={onSignOut}
                  className="hover:bg-[#d94a4a]/10"
                  style={{ color: '#d94a4a', fontFamily: 'Arial, sans-serif' }}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Вийти
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tier Selection */}
      <TierSelection
        userEmail={userProfile?.email || ''}
        currentTier={userProfile?.tier}
        onSuccess={handlePaymentSuccess}
        onBack={() => onBackToHome && onBackToHome()}
      />
    </div>
  );
}