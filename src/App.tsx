import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { PricingPage } from './components/PricingPage';
import { CalendarView } from './components/CalendarView';
import { DayContent } from './components/DayContent';
import { AdminPanel } from './components/AdminPanel';
import { PaymentSuccess } from './components/PaymentSuccess';
import { createClient } from './utils/supabase/client';
import { projectId } from './utils/supabase/info';

export interface DayData {
  day: number;
  title: string;
  expert: string;
  theme: string;
  description: string;
  videoUrl?: string;
  pdfUrl?: string;
  practice: string;
  bonus: string;
  expertPhoto?: string;
  expertSocial?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: 'basic' | 'deep' | 'premium';
  payment_status: 'pending' | 'paid';
  progress: number[];
}

// Auth Context
interface AuthContextType {
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  completedDays: Set<number>;
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  markDayCompleted: (day: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  const checkAuth = async () => {
    try {
      console.log('checkAuth - Starting auth check');
      const accessToken = localStorage.getItem('advent_access_token');
      console.log('checkAuth - Access token present:', !!accessToken);

      if (!accessToken) {
        console.log('checkAuth - No token, user not authenticated');
        setIsLoading(false);
        setUserProfile(null);
        setIsAdmin(false);
        setCompletedDays(new Set());
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('checkAuth - Profile response status:', response.status);

      if (!response.ok) {
        console.log('checkAuth - Profile fetch failed, clearing auth');
        localStorage.removeItem('advent_access_token');
        setUserProfile(null);
        setIsAdmin(false);
        setCompletedDays(new Set());
        setIsLoading(false);
        return;
      }

      const profile = await response.json();
      console.log('checkAuth - Profile data:', profile);

      setUserProfile(profile);
      setIsAdmin(profile.email?.toLowerCase() === 'katywenka@gmail.com');
      setCompletedDays(new Set(profile.progress || []));
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('advent_access_token');
      setUserProfile(null);
      setIsAdmin(false);
      setCompletedDays(new Set());
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.removeItem('advent_access_token');
      setUserProfile(null);
      setCompletedDays(new Set());
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const markDayCompleted = async (day: number) => {
    const newCompleted = new Set(completedDays);
    newCompleted.add(day);
    setCompletedDays(newCompleted);

    // Update progress on backend
    try {
      const accessToken = localStorage.getItem('advent_access_token');
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ day }),
        }
      );
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      userProfile, 
      isAdmin, 
      isLoading, 
      completedDays, 
      checkAuth, 
      signOut, 
      markDayCompleted 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Landing Route
function LandingRoute() {
  const navigate = useNavigate();
  const { userProfile, isLoading } = useAuth();

  const handleStart = () => {
    navigate('/auth');
  };

  const handleGoToCalendar = () => {
    if (userProfile?.payment_status === 'paid') {
      navigate('/calendar');
    } else {
      navigate('/pricing');
    }
  };

  return (
    <LandingPage 
      onStart={handleStart}
      isAuthenticated={!!userProfile}
      isLoading={isLoading}
      onGoToCalendar={handleGoToCalendar}
    />
  );
}

// Auth Route
function AuthRoute() {
  const navigate = useNavigate();
  const { checkAuth, userProfile } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (userProfile) {
      console.log('User already authenticated in AuthRoute, redirecting...', userProfile);
      if (userProfile.payment_status === 'paid') {
        navigate('/calendar', { replace: true });
      } else {
        navigate('/pricing', { replace: true });
      }
    }
  }, [userProfile, navigate]);

  const handleAuthSuccess = async () => {
    console.log('handleAuthSuccess called in AuthRoute');
    await checkAuth();
    console.log('checkAuth completed in AuthRoute');
    // Navigation will happen via useEffect above
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return <AuthPage onAuthSuccess={handleAuthSuccess} onBackToHome={handleBackToHome} />;
}

// Pricing Route
function PricingRoute() {
  const navigate = useNavigate();
  const { userProfile, checkAuth, signOut } = useAuth();

  const handlePaymentSuccess = async () => {
    await checkAuth();
    navigate('/calendar');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  if (userProfile.payment_status === 'paid') {
    return <Navigate to="/calendar" replace />;
  }

  return (
    <PricingPage
      onPaymentSuccess={handlePaymentSuccess}
      userName={userProfile.name}
      onBackToHome={handleBackToHome}
      onSignOut={handleSignOut}
    />
  );
}

// Calendar Route
function CalendarRoute() {
  const navigate = useNavigate();
  const { userProfile, isAdmin, completedDays, signOut, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-xl" style={{ color: '#2d5a3d' }}>Завантаження...</div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  if (userProfile.payment_status !== 'paid') {
    return <Navigate to="/pricing" replace />;
  }

  const handleDayClick = (day: number) => {
    navigate(`/day/${day}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <CalendarView
      completedDays={completedDays}
      onDayClick={handleDayClick}
      onBackToHome={handleBackToHome}
      userProfile={userProfile}
      onSignOut={handleSignOut}
      onAdminClick={isAdmin ? handleAdminClick : undefined}
    />
  );
}

// Day Route
function DayRoute() {
  const navigate = useNavigate();
  const { day } = useParams<{ day: string }>();
  const { userProfile, completedDays, markDayCompleted, isLoading } = useAuth();

  const dayNumber = day ? parseInt(day) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-xl" style={{ color: '#2d5a3d' }}>Завантаження...</div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  if (userProfile.payment_status !== 'paid') {
    return <Navigate to="/pricing" replace />;
  }

  if (!dayNumber || dayNumber < 1 || dayNumber > 24) {
    return <Navigate to="/calendar" replace />;
  }

  const handleBack = () => {
    navigate('/calendar');
  };

  const handleComplete = async (day: number) => {
    await markDayCompleted(day);
  };

  return (
    <DayContent
      day={dayNumber}
      isCompleted={completedDays.has(dayNumber)}
      onComplete={handleComplete}
      onBack={handleBack}
      totalCompleted={completedDays.size}
      userTier={userProfile.tier}
    />
  );
}

// Admin Route
function AdminRoute() {
  const navigate = useNavigate();
  const { userProfile, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-xl" style={{ color: '#2d5a3d' }}>Завантаження...</div>
      </div>
    );
  }

  if (!userProfile || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleBack = () => {
    navigate('/calendar');
  };

  return <AdminPanel onBack={handleBack} />;
}

// Debug Info Component
function DebugInfo() {
  const { userProfile, isAdmin } = useAuth();

  if (!userProfile) return null;

  return null;
}

// Main App with Router
function AppContent() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/pricing" element={<PricingRoute />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/calendar" element={<CalendarRoute />} />
        <Route path="/day/:day" element={<DayRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DebugInfo />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}