import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { PricingPage } from './components/PricingPage';
import { CalendarView } from './components/CalendarView';
import { MobileCalendarView } from './components/MobileCalendarView';
import { DayContent } from './components/DayContent';
import { AdminPanel } from './components/AdminPanel';
import { ContactsPage } from './components/ContactsPage';
import { OfferPage } from './components/OfferPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { KVFormatTest } from './components/KVFormatTest';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  adminUnlockAll: boolean;
  unlockedDays: number[]; // список днів, розблокованих адміном
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  markDayCompleted: (day: number) => Promise<void>;
  toggleAdminUnlockAll: () => void;
  loadUnlockedDays: () => Promise<void>; // функція для завантаження розблокованих днів
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [adminUnlockAll, setAdminUnlockAll] = useState(false);
  const [unlockedDays, setUnlockedDays] = useState<number[]>([]); // масив розблокованих днів

  const checkAuth = async () => {
    try {
      console.log('🔍 checkAuth: Starting...');
      const accessToken = localStorage.getItem('advent_access_token');

      if (!accessToken) {
        console.log('🔍 checkAuth: No access token found');
        setIsLoading(false);
        setUserProfile(null);
        setIsAdmin(false);
        setCompletedDays(new Set());
        return;
      }

      console.log('🔍 checkAuth: Fetching profile from server...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('🔍 checkAuth: Profile fetch failed with status:', response.status);
        localStorage.removeItem('advent_access_token');
        setUserProfile(null);
        setIsAdmin(false);
        setCompletedDays(new Set());
        setIsLoading(false);
        return;
      }

      const profile = await response.json();
      console.log('🔍 checkAuth: Profile received:', {
        email: profile.email,
        name: profile.name,
        tier: profile.tier,
        payment_status: profile.payment_status
      });

      setUserProfile(profile);
      setIsAdmin(profile.email?.toLowerCase() === 'katywenka@gmail.com');
      setCompletedDays(new Set(profile.progress || []));
      setIsLoading(false);
      
      console.log('✅ checkAuth: Profile updated successfully');
    } catch (error) {
      console.error('❌ checkAuth: Error:', error);
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
    console.log('markDayCompleted - Starting for day:', day);
    
    const newCompleted = new Set(completedDays);
    newCompleted.add(day);
    setCompletedDays(newCompleted);
    
    console.log('markDayCompleted - Updated local state. All completed:', Array.from(newCompleted));

    // Update progress on backend
    try {
      const accessToken = localStorage.getItem('advent_access_token');
      console.log('markDayCompleted - Access token exists:', !!accessToken);
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/progress`;
      console.log('markDayCompleted - Sending request to:', url);
      console.log('markDayCompleted - Request body:', { day });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ day }),
      });
      
      console.log('markDayCompleted - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('markDayCompleted - Backend error:', errorText);
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('markDayCompleted - Success! Backend response:', result);
      
      // Оновити профіль після успішного збереження
      await checkAuth();
      console.log('markDayCompleted - Profile refreshed');
      
    } catch (error) {
      console.error('markDayCompleted - Error:', error);
      alert('Помилка при збереженні прогресу. Будь ласка, спробуйте ще раз.');
    }
  };

  const toggleAdminUnlockAll = () => {
    setAdminUnlockAll(!adminUnlockAll);
  };

  const loadUnlockedDays = async () => {
    try {
      const accessToken = localStorage.getItem('advent_access_token');
      
      // Якщо немає токену - не завантажуємо (користувач не авторизований)
      if (!accessToken) {
        console.log('loadUnlockedDays - No access token, skipping');
        setUnlockedDays([]);
        return;
      }
      
      console.log('loadUnlockedDays - Access token exists:', !!accessToken);
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/unlocked-days`;
      console.log('loadUnlockedDays - Sending request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      console.log('loadUnlockedDays - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('loadUnlockedDays - Backend error:', errorText);
        throw new Error(`Backend returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('loadUnlockedDays - Success! Backend response:', result);
      
      setUnlockedDays(result.days);
      
    } catch (error) {
      console.error('loadUnlockedDays - Error:', error);
      alert('Помилка при завантаженні розблокованих днів. Будь ласка, спробуйте ще раз.');
    }
  };

  useEffect(() => {
    checkAuth();
    loadUnlockedDays(); // Завантажуємо розблоковані дні при старті
  }, []);

  return (
    <AuthContext.Provider value={{ 
      userProfile, 
      isAdmin, 
      isLoading, 
      completedDays, 
      adminUnlockAll,
      unlockedDays,
      checkAuth, 
      signOut, 
      markDayCompleted,
      toggleAdminUnlockAll,
      loadUnlockedDays
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
    console.log('🎯 handlePaymentSuccess: Starting...');
    await checkAuth();
    console.log('🎯 handlePaymentSuccess: checkAuth completed, navigating to calendar');
    navigate('/calendar');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Автоматично перенаправляємо якщо payment_status змінився на 'paid'
  useEffect(() => {
    if (userProfile?.payment_status === 'paid') {
      console.log('🎯 PricingRoute: Payment status is paid, redirecting to calendar...');
      navigate('/calendar', { replace: true });
    }
  }, [userProfile?.payment_status, navigate]);

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
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
  const { userProfile, isAdmin, completedDays, adminUnlockAll, signOut, isLoading } = useAuth();

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
    console.log('🎯 App.tsx handleDayClick викликано для дня:', day);
    console.log('📍 Навігуємо на:', `/day/${day}`);
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
    <ErrorBoundary>
      <CalendarView
        completedDays={completedDays}
        onDayClick={handleDayClick}
        onBackToHome={handleBackToHome}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        onAdminClick={isAdmin ? handleAdminClick : undefined}
        isAdmin={isAdmin}
        adminUnlockAll={adminUnlockAll}
      />
    </ErrorBoundary>
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
        <Route path="/calendar" element={<CalendarRoute />} />
        <Route path="/day/:day" element={<DayRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/test-kv" element={
          <div className="min-h-screen bg-[#faf8f5] p-8">
            <KVFormatTest />
          </div>
        } />
        <Route path="/contacts" element={<ContactsRoute />} />
        <Route path="/offer" element={<OfferRoute />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyRoute />} />
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

// Contacts Route
function ContactsRoute() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };

  return <ContactsPage onBack={handleBack} />;
}

// Offer Route
function OfferRoute() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };

  return <OfferPage onBack={handleBack} />;
}

// Privacy Policy Route
function PrivacyPolicyRoute() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };

  return <PrivacyPolicy onBack={handleBack} />;
}