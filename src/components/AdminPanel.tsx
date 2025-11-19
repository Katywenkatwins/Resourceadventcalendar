import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Pencil, Trash2, ArrowLeft, Users } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

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

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const accessToken = localStorage.getItem('advent_access_token');
      
      console.log('Fetching admin users with token:', accessToken ? 'present' : 'missing');
      
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
      const accessToken = localStorage.getItem('advent_access_token');
      
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
      const accessToken = localStorage.getItem('advent_access_token');
      
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
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Помилка видалення користувача');
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
              <Users className="w-8 h-8" />
              Адмін панель
            </h1>
          </div>
          <Button onClick={loadUsers} variant="outline">
            Оновити
          </Button>
        </div>

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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
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
      </div>
    </div>
  );
}