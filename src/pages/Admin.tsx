import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Item, Profile, CATEGORY_LABELS, STATUS_LABELS } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Package,
  Users,
  CheckCircle,
  TrendingUp,
  Trash2,
  ShieldCheck,
  Eye,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface UserWithRole extends Profile {
  role: 'user' | 'admin';
}

interface Analytics {
  totalItems: number;
  lostItems: number;
  foundItems: number;
  recoveredItems: number;
  recoveryRate: number;
  categoryBreakdown: { name: string; value: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
  recentActivity: number;
}

const STATUS_COLORS: Record<string, string> = {
  lost: 'hsl(12, 80%, 60%)',
  found: 'hsl(160, 70%, 40%)',
  claimed: 'hsl(38, 90%, 55%)',
  recovered: 'hsl(174, 62%, 30%)',
  closed: 'hsl(200, 15%, 45%)',
};

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchUsers()]);
    setLoading(false);
  };

  const fetchItems = async () => {
    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: profilesData } = await supabase.from('profiles').select('*');

    if (itemsData) {
      const profilesMap = new Map(profilesData?.map((p: Profile) => [p.id, p]) || []);
      const itemsWithProfiles = itemsData.map(item => ({
        ...item,
        profiles: profilesMap.get(item.user_id) as Profile | undefined,
      })) as Item[];
      setItems(itemsWithProfiles);
      calculateAnalytics(itemsWithProfiles);
    }
  };

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');

    if (profiles && roles) {
      const usersWithRoles: UserWithRole[] = profiles.map((profile: Profile) => {
        const userRole = roles.find((r: { user_id: string; role: string }) => r.user_id === profile.id);
        return {
          ...profile,
          role: (userRole?.role || 'user') as 'user' | 'admin',
        };
      });
      setUsers(usersWithRoles);
    }
  };

  const calculateAnalytics = (items: Item[]) => {
    const totalItems = items.length;
    const lostItems = items.filter(i => i.status === 'lost').length;
    const foundItems = items.filter(i => i.status === 'found').length;
    const recoveredItems = items.filter(i => i.status === 'recovered').length;
    const recoveryRate = totalItems > 0 ? Math.round((recoveredItems / totalItems) * 100) : 0;

    const categoryCount: Record<string, number> = {};
    items.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryCount)
      .map(([key, value]) => ({
        name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] || key,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const statusCount: Record<string, number> = {};
    items.forEach(item => {
      statusCount[item.status] = (statusCount[item.status] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusCount).map(([key, value]) => ({
      name: STATUS_LABELS[key as keyof typeof STATUS_LABELS] || key,
      value,
      color: STATUS_COLORS[key] || 'hsl(200, 15%, 45%)',
    }));

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = items.filter(i => new Date(i.created_at) > weekAgo).length;

    setAnalytics({
      totalItems,
      lostItems,
      foundItems,
      recoveredItems,
      recoveryRate,
      categoryBreakdown,
      statusBreakdown,
      recentActivity,
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Item deleted successfully' });
      fetchItems();
    }
  };

  const handleVerifyItem = async (itemId: string, verified: boolean) => {
    const { error } = await supabase
      .from('items')
      .update({ is_verified: verified })
      .eq('id', itemId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update verification', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: verified ? 'Item verified' : 'Verification removed' });
      fetchItems();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Delete user's items, claims, roles, and profile
    await supabase.from('items').delete().eq('user_id', userId);
    await supabase.from('claims').delete().eq('claimer_id', userId);
    await supabase.from('user_roles').delete().eq('user_id', userId);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'User deleted successfully' });
      fetchUsers();
      fetchItems();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage items, users, and view analytics</p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
                  <Package className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalItems || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics?.recentActivity || 0} new this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lost Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{analytics?.lostItems || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Currently missing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Found Items</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{analytics?.foundItems || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting claim</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Recovery Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.recoveryRate || 0}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics?.recoveredItems || 0} items recovered
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.statusBreakdown || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {analytics?.statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.categoryBreakdown || []} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(174, 62%, 30%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>All Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Posted By</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <Badge className={`status-${item.status}`}>
                              {STATUS_LABELS[item.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>{CATEGORY_LABELS[item.category]}</TableCell>
                          <TableCell>{item.profiles?.full_name || item.profiles?.email}</TableCell>
                          <TableCell>
                            {item.is_verified ? (
                              <ShieldCheck className="h-5 w-5 text-success" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/item/${item.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={item.is_verified ? 'secondary' : 'default'}
                                onClick={() => handleVerifyItem(item.id, !item.is_verified)}
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(userItem => (
                        <TableRow key={userItem.id}>
                          <TableCell className="font-medium">
                            {userItem.full_name || 'No name'}
                          </TableCell>
                          <TableCell>{userItem.email}</TableCell>
                          <TableCell>
                            <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                              {userItem.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(userItem.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {userItem.id !== user?.id && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete user "{userItem.full_name || userItem.email}"? 
                                      This will also delete all their items and claims.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(userItem.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
