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
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', { data, error: signInError });

      if (signInError) {
        setError(signInError.message);
        console.error('Sign in error:', signInError);
        return;
      }

      if (data.session) {
        console.log('Sign in successful, storing token and calling onAuthSuccess');
        localStorage.setItem('advent_access_token', data.session.access_token);
        onAuthSuccess();
      } else {
        console.error('No session in sign in response');
        setError('Не вдалося створити сесію');
      }
    } catch (err) {
      setError('Помилка входу. Спробуйте ще раз.');
      console.error('Sign in error:', err);
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

      // Auto sign in after signup
      const supabase = createClient();

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Акаунт створено, але помилка входу. Спробуйте увійти вручну.');
        return;
      }

      if (signInData.session) {
        localStorage.setItem('advent_access_token', signInData.session.access_token);
        onAuthSuccess();
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
          <CardTitle className="text-2xl text-center">24 кроки до нового себе</CardTitle>
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