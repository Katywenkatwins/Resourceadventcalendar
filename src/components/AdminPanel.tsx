import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Pencil, Trash2, ArrowLeft, Users, Calendar, Settings, CreditCard } from 'lucide-react';
import { DayContentEditor } from './DayContentEditor';
import { CalendarSettings } from './CalendarSettings';
import { UpdateExpertPhotos } from './UpdateExpertPhotos';
import { TierContent } from '../types/contentBlocks';
import { ExpertData, ThemeData } from '../types/dayData';
import { projectId } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  tier: 'basic' | 'deep' | 'premium';
  payment_status: 'pending' | 'paid';
  progress: number[];
  created_at: string;
  payment_date?: string;
}

interface Payment {
  userId: string;
  userName: string;
  userEmail: string;
  email: string;
  tier: 'basic' | 'deep' | 'premium';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  orderReference: string;
  transactionId?: string;
  transactionStatus?: string;
}

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'days' | 'settings' | 'experts'>('users');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [dayContents, setDayContents] = useState<Map<number, TierContent>>(new Map());
  const [dayExperts, setDayExperts] = useState<Map<number, ExpertData>>(new Map());
  const [dayThemes, setDayThemes] = useState<Map<number, ThemeData>>(new Map());
  const supabase = createClient();

  // Функція для отримання актуального токену
  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return session.access_token;
    }
    // Fallback на localStorage
    return localStorage.getItem('advent_access_token');
  };

  useEffect(() => {
    loadUsers();
    loadDayContents();
    loadPayments();
  }, []);

  const loadUsers = async () => {
    try {
      const accessToken = await getAccessToken();
      
      console.log('Fetching admin users with token:', accessToken ? 'present' : 'missing');
      
      if (!accessToken) {
        alert('Токен відсутній. Будь ласка, увійдіть знову.');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('Admin users response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Admin users error response:', errorData);
        
        if (response.status === 401) {
          alert('Сесія прострочена. Будь ласка, увійдіть знову.');
          // Redirect to login
          window.location.href = '/';
          return;
        }
        
        throw new Error(errorData.error || 'Failed to load users');
      }

      const data = await response.json();
      console.log('Admin users data:', data);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert(`Помилка завантаження користувачів: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDayContents = async () => {
    try {
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/content/all`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to load day contents');
        return;
      }

      const data = await response.json();
      console.log('Loaded day contents:', data);
      
      if (data.content && Array.isArray(data.content)) {
        const contentsMap = new Map<number, TierContent>();
        const expertsMap = new Map<number, ExpertData>();
        const themesMap = new Map<number, ThemeData>();
        
        data.content.forEach((item: { 
          day: number; 
          content: TierContent | null; 
          expert: ExpertData | null; 
          theme: ThemeData | null;
        }) => {
          if (item.content) {
            contentsMap.set(item.day, item.content);
          }
          if (item.expert) {
            expertsMap.set(item.day, item.expert);
          }
          if (item.theme) {
            themesMap.set(item.day, item.theme);
          }
        });
        
        setDayContents(contentsMap);
        setDayExperts(expertsMap);
        setDayThemes(themesMap);
        
        console.log('Loaded maps:', {
          contents: contentsMap.size,
          experts: expertsMap.size,
          themes: themesMap.size,
        });
      }
    } catch (error) {
      console.error('Error loading day contents:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/admin/payments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to load payments');
        return;
      }

      const data = await response.json();
      console.log('Loaded payments:', data);
      
      if (data.payments && Array.isArray(data.payments)) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleRefreshPaymentStatus = async (orderReference: string) => {
    try {
      const accessToken = await getAccessToken();
      
      console.log('🔄 Refreshing payment status for:', orderReference);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/check-wayforpay-status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderReference }),
        }
      );

      const data = await response.json();
      console.log('Payment status refresh result:', data);

      if (data.success) {
        alert(`Статус оновлено! ${data.message}\n\nWayForPay відповідь:\n${JSON.stringify(data.wayforpayData, null, 2)}`);
        // Перезавантажуємо список платежів і користувачів
        await loadPayments();
        await loadUsers();
      } else {
        alert(`Не вдалося оновити статус: ${data.message || 'Невідома помилка'}\n\nWayForPay відповідь:\n${JSON.stringify(data.wayforpayData, null, 2)}`);
      }
    } catch (error) {
      console.error('Error refreshing payment status:', error);
      alert(`Помилка при оновленні статусу: ${error.message}`);
    }
  };

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name') as string,
      tier: formData.get('tier') as string,
      payment_status: formData.get('payment_status') as string,
    };

    try {
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/admin/users/${editingUser.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Помилка оновлення користувача');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      loadUsers();
      alert('Користувача успішно видалено');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Помилка видалення користувача');
    }
  };

  const handleDeleteIncompleteUsers = async () => {
    const incompleteUsers = users.filter(u => !u.name || u.name === 'Без імені');
    
    if (incompleteUsers.length === 0) {
      alert('Немає користувачів без даних');
      return;
    }

    if (!confirm(`Ви впевнені, що хочете видалити ${incompleteUsers.length} користувачів без даних?`)) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      
      // Delete users one by one
      for (const user of incompleteUsers) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/admin/users/${user.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
      }

      loadUsers();
      alert(`Успішно видалено ${incompleteUsers.length} користувачів`);
    } catch (error) {
      console.error('Error deleting incomplete users:', error);
      alert('Помилка видалення користувачів');
    }
  };

  const handleMarkAsAdventUser = async (userId: string) => {
    try {
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/admin/mark-advent-user/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark user');
      }

      loadUsers();
      alert('Користувача позначено як користувача адвент-календаря');
    } catch (error) {
      console.error('Error marking user:', error);
      alert('Помилка позначення користувача');
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-amber-500';
      case 'deep': return 'bg-purple-500';
      case 'premium': return 'bg-indigo-600';
      default: return 'bg-gray-500';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'basic': return 'Світло';
      case 'deep': return 'Магія';
      case 'premium': return 'Чудо';
      default: return tier;
    }
  };

  const handleSaveDayContent = async (day: number, content: TierContent) => {
    try {
      const accessToken = await getAccessToken();
      
      console.log('Saving day content:', { day, content });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/content/day/${day}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      console.log('Save response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        throw new Error('Failed to save day content');
      }

      const result = await response.json();
      console.log('Save result:', result);

      // Update local state
      setDayContents(new Map(dayContents.set(day, content)));
      alert(`Контент дня ${day} успішно збережено!`);
    } catch (error) {
      console.error('Error saving day content:', error);
      alert(`Помилка збереження контенту: ${error.message}`);
    }
  };

  const handleSaveExpert = async (day: number, expert: ExpertData) => {
    try {
      const accessToken = await getAccessToken();
      
      console.log('Saving expert data:', { day, expert });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/content/day/${day}/expert`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ expert }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save expert error:', errorData);
        throw new Error('Failed to save expert data');
      }

      const result = await response.json();
      console.log('Save expert result:', result);

      // Update local state
      setDayExperts(new Map(dayExperts.set(day, expert)));
      alert(`Дані експерта дня ${day} успішно збережено!`);
    } catch (error) {
      console.error('Error saving expert data:', error);
      alert(`Помилка збереження даних експерта: ${error.message}`);
    }
  };

  const handleSaveTheme = async (day: number, theme: ThemeData) => {
    try {
      const accessToken = await getAccessToken();
      
      console.log('Saving theme data:', { day, theme });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/content/day/${day}/theme`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ theme }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save theme error:', errorData);
        throw new Error('Failed to save theme data');
      }

      const result = await response.json();
      console.log('Save theme result:', result);

      // Update local state
      setDayThemes(new Map(dayThemes.set(day, theme)));
      alert(`Дані теми дня ${day} успішно збережено!`);
    } catch (error) {
      console.error('Error saving theme data:', error);
      alert(`Помилка збереження даних теми: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Завантаження...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-3xl flex items-center gap-2">
              {activeTab === 'users' ? <Users className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
              Адмін панель
            </h1>
          </div>
          <div className="flex gap-2">
            {activeTab === 'users' && (
              <Button 
                onClick={handleDeleteIncompleteUsers} 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Очистити неповні
              </Button>
            )}
            {activeTab === 'users' && (
              <Button onClick={loadUsers} variant="outline">
                Оновити
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Користувачі
          </Button>
          <Button
            variant={activeTab === 'payments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('payments')}
            className="flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Платежі
          </Button>
          <Button
            variant={activeTab === 'days' ? 'default' : 'outline'}
            onClick={() => setActiveTab('days')}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Редагування днів
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Налаштування календаря
          </Button>
          <Button
            variant={activeTab === 'experts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('experts')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Оновити фото експертів
          </Button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>Користувачі ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ім'я</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Тариф</TableHead>
                      <TableHead>Статус оплати</TableHead>
                      <TableHead>Прогрес</TableHead>
                      <TableHead>Дата реєстрації</TableHead>
                      <TableHead className="text-right">Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getTierBadgeColor(user.tier)}>
                            {getTierName(user.tier)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {user.payment_status === 'paid' ? 'Оплачено' : 'Очікується'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.progress?.length || 0} / 24
                        </TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('uk-UA') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog open={isDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                              setIsDialogOpen(open);
                              if (!open) setEditingUser(null);
                            }}>
                              <DialogTrigger asChild>
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setIsDialogOpen(true);
                                  }}
                                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Редагувати користувача</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleEditUser} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="name">Ім'я</Label>
                                    <Input
                                      id="name"
                                      name="name"
                                      defaultValue={user.name}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="tier">Тариф</Label>
                                    <Select name="tier" defaultValue={user.tier}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="basic">Світло</SelectItem>
                                        <SelectItem value="deep">Магія</SelectItem>
                                        <SelectItem value="premium">Чудо</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="payment_status">Статус оплати</Label>
                                    <Select name="payment_status" defaultValue={user.payment_status}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Очікується</SelectItem>
                                        <SelectItem value="paid">Оплачено</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="submit" className="flex-1">
                                      Зберегти
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setIsDialogOpen(false);
                                        setEditingUser(null);
                                      }}
                                    >
                                      Скасувати
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Платежі ({payments.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!confirm('Оновити платежі для oksana1999hrl@gmail.com?')) return;
                      
                      try {
                        const accessToken = await getAccessToken();
                        const response = await fetch(
                          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/update-by-email`,
                          {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${accessToken}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: 'oksana1999hrl@gmail.com' }),
                          }
                        );
                        
                        const data = await response.json();
                        console.log('Update result:', data);
                        
                        if (data.success) {
                          alert(`Оксана: ${data.results.length} платежів перевірено\n\n${data.results.map(r => 
                            `${r.orderReference}: ${r.status}${r.tier ? ' → ' + r.tier : ''}`
                          ).join('\n')}`);
                          await loadPayments();
                          await loadUsers();
                        } else {
                          alert(`Помилка: ${data.error}`);
                        }
                      } catch (error) {
                        alert(`Помилка: ${error.message}`);
                      }
                    }}
                  >
                    ✅ Оксана
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!confirm('Оновити платежі для szhizhnevdkaya@ukr.net?')) return;
                      
                      try {
                        const accessToken = await getAccessToken();
                        const response = await fetch(
                          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/update-by-email`,
                          {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${accessToken}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: 'szhizhnevdkaya@ukr.net' }),
                          }
                        );
                        
                        const data = await response.json();
                        console.log('Update result:', data);
                        
                        if (data.success) {
                          alert(`Світлана: ${data.results.length} платежів перевірено\n\n${data.results.map(r => 
                            `${r.orderReference}: ${r.status}${r.tier ? ' → ' + r.tier : ''}`
                          ).join('\n')}`);
                          await loadPayments();
                          await loadUsers();
                        } else {
                          alert(`Помилка: ${data.error}`);
                        }
                      } catch (error) {
                        alert(`Помилка: ${error.message}`);
                      }
                    }}
                  >
                    ✅ Світлана
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const email = prompt('Введіть email користувача для перевірки всіх його платежів:');
                      if (!email) return;
                      
                      try {
                        const accessToken = await getAccessToken();
                        const response = await fetch(
                          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/update-by-email`,
                          {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${accessToken}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email }),
                          }
                        );
                        
                        const data = await response.json();
                        console.log('Update by email result:', data);
                        
                        if (data.success) {
                          alert(`Перевірено платежів: ${data.results.length}\n\n${data.results.map(r => 
                            `${r.orderReference}: ${r.status}${r.tier ? ' (тариф: ' + r.tier + ')' : ''}`
                          ).join('\n')}`);
                          await loadPayments();
                          await loadUsers();
                        } else {
                          alert(`Помилка: ${data.error || 'Невідома помилка'}`);
                        }
                      } catch (error) {
                        console.error('Error:', error);
                        alert(`Помилка: ${error.message}`);
                      }
                    }}
                  >
                    🔄 Інший email
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ім'я</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Тариф</TableHead>
                      <TableHead>Сума</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата створення</TableHead>
                      <TableHead>Дата завершення</TableHead>
                      <TableHead>Референс</TableHead>
                      <TableHead>Транзакція</TableHead>
                      <TableHead>Статус транзакції</TableHead>
                      <TableHead>Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.orderReference}>
                        <TableCell>{payment.userName}</TableCell>
                        <TableCell>{payment.userEmail}</TableCell>
                        <TableCell>
                          <Badge className={getTierBadgeColor(payment.tier)}>
                            {getTierName(payment.tier)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.amount} UAH
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('uk-UA') : '-'}
                        </TableCell>
                        <TableCell>
                          {payment.completedAt ? new Date(payment.completedAt).toLocaleDateString('uk-UA') : '-'}
                        </TableCell>
                        <TableCell>
                          {payment.orderReference}
                        </TableCell>
                        <TableCell>
                          {payment.transactionId}
                        </TableCell>
                        <TableCell>
                          {payment.transactionStatus}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefreshPaymentStatus(payment.orderReference)}
                            title="Перевірити статус через WayForPay API"
                            className={payment.status === 'completed' ? 'opacity-50' : ''}
                          >
                            🔄 Оновити
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Days Tab */}
        {activeTab === 'days' && (
          <Card>
            <CardHeader>
              <CardTitle>Редагування днів календаря</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {Array.from({ length: 24 }, (_, i) => i + 1).map((day) => (
                  <Button
                    key={day}
                    variant="outline"
                    className="h-20 text-2xl"
                    style={{ backgroundColor: dayContents.has(day) ? '#2d5a3d' : '#fff', color: dayContents.has(day) ? '#fff' : '#2d5a3d' }}
                    onClick={() => setEditingDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Тестування WayForPay */}
            <Card>
              <CardHeader>
                <CardTitle>💳 Тестування WayForPay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Перевірка налаштувань оплати та інтеграції з WayForPay
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={async () => {
                      try {
                        const accessToken = await getAccessToken();
                        const response = await fetch(
                          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/create`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({ 
                              tier: 'basic',
                              clientEmail: 'katywenka@gmail.com'
                            })
                          }
                        );

                        if (response.ok) {
                          const data = await response.json();
                          console.log('Payment data:', data);
                          alert('✅ Платіж створено успішно!\n\n' + JSON.stringify(data, null, 2));
                        } else {
                          const error = await response.text();
                          alert('❌ Помилка: ' + error);
                        }
                      } catch (error) {
                        alert('❌ Помилка: ' + error);
                      }
                    }}
                    variant="outline"
                  >
                    🧪 Тест створення платежу
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const accessToken = await getAccessToken();
                        const response = await fetch(
                          `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/payment/demo-success`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({ tier: 'premium' })
                          }
                        );

                        if (response.ok) {
                          alert('✅ DEMO оплата успішна! Перезавантажте сторінку.');
                          loadUsers();
                        } else {
                          const error = await response.text();
                          alert('❌ Помилка: ' + error);
                        }
                      } catch (error) {
                        alert('❌ Помилка: ' + error);
                      }
                    }}
                    variant="outline"
                  >
                    🎭 DEMO: Успішна оплата
                  </Button>

                  <Button
                    onClick={() => {
                      const logs = `
🔧 WayForPay Credentials:
- Merchant: adventresurs_space  
- Secret: ${'{stored in WAYFORPAY_MERCHANT_PASSWORD}'}
- Currency: UAH

📋 Endpoints:
- Create: /payment/create
- Callback: /payment/callback
- Status: /payment/status/:ref
- Demo: /payment/demo-success

🔗 Callback URL:
https://{supabase-url}/functions/v1/make-server-dc8cbf1f/payment/callback
                      `.trim();
                      
                      alert(logs);
                      console.log(logs);
                    }}
                    variant="outline"
                  >
                    📋 Показати налаштування
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Міграція даних */}
            <Card>
              <CardHeader>
                <CardTitle>⚠️ Міграція даних користувачів</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Якщо дані користувачів зберігаються в неправильному форматі (кожен символ як окремий ключ), 
                  ця кнопка виправить структуру даних.
                </p>
                <Button
                  onClick={async () => {
                    if (!confirm('Ви впевнені? Це оновить дані ВСІХ користувачів.')) return;
                    
                    try {
                      const accessToken = await getAccessToken();
                      if (!accessToken) {
                        alert('Токен відсутній. Будь ласка, увійдіть знову.');
                        return;
                      }

                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-dc8cbf1f/migrate-users`,
                        {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${accessToken}`,
                          },
                        }
                      );

                      if (response.ok) {
                        const result = await response.json();
                        alert('✅ Міграція успішна! ' + JSON.stringify(result));
                        loadUsers(); // Перезавантажуємо список користувачів
                      } else {
                        const error = await response.text();
                        alert('❌ Помилка міграції: ' + error);
                      }
                    } catch (error) {
                      alert('❌ Помилка: ' + error);
                    }
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  🔧 Виправити структуру даних користувачів
                </Button>
              </CardContent>
            </Card>

            {/* Налаштування календаря */}
            <CalendarSettings accessToken={localStorage.getItem('advent_access_token') || ''} />
          </div>
        )}

        {/* Experts Tab */}
        {activeTab === 'experts' && (
          <div className="space-y-6">
            <UpdateExpertPhotos />
          </div>
        )}

        {/* Day Content Editor Modal */}
        {editingDay !== null && (
          <DayContentEditor
            day={editingDay}
            initialContent={dayContents.get(editingDay)}
            initialExpert={dayExperts.get(editingDay)}
            initialTheme={dayThemes.get(editingDay)}
            onSave={handleSaveDayContent}
            onSaveExpert={handleSaveExpert}
            onSaveTheme={handleSaveTheme}
            onClose={() => setEditingDay(null)}
          />
        )}
      </div>
    </div>
  );
}