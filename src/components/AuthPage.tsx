import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { createClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onBackToHome?: () => void;
}

export function AuthPage({ onAuthSuccess, onBackToHome }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('Sign in attempt for:', email);

    try {
      // Use backend for sign in instead of direct Supabase Auth
      console.log('Attempting to sign in via backend...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      console.log('Sign in response status:', response.status);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Помилка з\'єднання з сервером' }));
        console.error('Sign in error:', data);
        
        if (response.status === 401) {
          setError('Неправильний email або пароль');
        } else if (response.status === 400) {
          setError(data.error || 'Неправильні дані');
        } else {
          setError(data.error || 'Помилка входу');
        }
        return;
      }

      const data = await response.json();
      console.log('Sign in successful:', data);

      if (data.access_token) {
        console.log('Storing token and calling onAuthSuccess');
        localStorage.setItem('advent_access_token', data.access_token);
        onAuthSuccess();
      } else {
        console.error('No access token in response');
        setError('Не вдалося отримати токен авторизації');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Помилка з\'єднання з сервером. Перевірте інтернет-з\'єднання та спробуйте ще раз.');
      } else {
        setError('Помилка входу. Спробуйте ще раз.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (password.length < 6) {
      setError('Пароль повинен містити щонайменше 6 символів');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Помилка реєстрації');
        return;
      }

      // Auto sign in after signup using backend
      console.log('Signup successful, attempting auto sign in...');
      const signInResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!signInResponse.ok) {
        const signInData = await signInResponse.json();
        setError(signInData.error || 'Помилка автоматичного входу');
        return;
      }

      const signInData = await signInResponse.json();

      if (signInData.access_token) {
        console.log('Sign in successful, storing token and calling onAuthSuccess');
        localStorage.setItem('advent_access_token', signInData.access_token);
        onAuthSuccess();
      } else {
        console.error('No access token in sign in response');
        setError('Не вдалося отримати токен авторизації');
      }
    } catch (err) {
      setError('Помилка реєстрації. Спробуйте ще раз.');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2d5a3d] via-[#1e3a5f] to-[#d94a4a] p-4">
      <Card className="w-full max-w-md relative">
        {onBackToHome && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-900"
            onClick={onBackToHome}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        )}
        
        <CardHeader className="space-y-1 pt-[50px] pr-[24px] pb-[0px] pl-[24px]">
          <CardTitle className="text-2xl text-center">24 кроки до нової себе</CardTitle>
          <CardDescription className="text-center">
            Увійдіть або створіть акаунт для участі
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Вхід</TabsTrigger>
              <TabsTrigger value="signup">Реєстрація</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Пароль</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Завантаження...' : 'Увійти'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Ім'я</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Ваше ім'я"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Пароль</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Мінімум 6 символів"
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Завантаження...' : 'Зареєструватись'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}