import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Item, Claim, STATUS_LABELS, CATEGORY_LABELS } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Loader2, MapPin, Calendar, Eye, Edit, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export default function MyItems() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch user's items
    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (itemsData) setItems(itemsData as Item[]);

    // Fetch claims on user's items
    const { data: claimsData } = await supabase
      .from('claims')
      .select(`
        *,
        items!inner(*),
        profiles:claimer_id(full_name, email)
      `)
      .eq('items.user_id', user.id)
      .order('created_at', { ascending: false });

    if (claimsData) setClaims(claimsData);

    setLoading(false);
  };

  const handleClaimAction = async (claimId: string, action: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('claims')
      .update({ status: action })
      .eq('id', claimId);

    if (error) {
      toast.error('Failed to update claim');
      return;
    }

    setClaims(claims.map(c => c.id === claimId ? { ...c, status: action } : c));
    toast.success(`Claim ${action}`);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'lost': return 'status-lost';
      case 'found': return 'status-found';
      case 'claimed': return 'status-claimed';
      case 'recovered': return 'status-recovered';
      default: return 'status-closed';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const pendingClaims = claims.filter(c => c.status === 'pending');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Items</h1>
            <p className="text-muted-foreground">Manage your lost and found posts</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/create">
              <Plus className="h-4 w-4 mr-2" />
              Post New Item
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList>
            <TabsTrigger value="items">My Posts ({items.length})</TabsTrigger>
            <TabsTrigger value="claims" className="relative">
              Claims
              {pendingClaims.length > 0 && (
                <span className="ml-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingClaims.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            {items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">You haven't posted any items yet.</p>
                  <Button variant="hero" asChild>
                    <Link to="/create">Post Your First Item</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <div className="sm:w-48 h-32 sm:h-auto bg-muted flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getStatusClass(item.status)}>
                                {STATUS_LABELS[item.status]}
                              </Badge>
                              <Badge variant="outline">{CATEGORY_LABELS[item.category]}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/item/${item.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/edit/${item.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>

                          <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(item.date_lost_found), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="claims">
            {claims.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No claims received yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {claims.map((claim) => (
                  <Card key={claim.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              claim.status === 'pending' ? 'default' :
                              claim.status === 'approved' ? 'secondary' : 'outline'
                            }>
                              {claim.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(claim.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>

                          <p className="text-sm mb-2">
                            <span className="font-medium">{claim.profiles?.full_name || 'Someone'}</span>
                            {' '}claimed your item:{' '}
                            <Link to={`/item/${claim.items?.id}`} className="text-primary hover:underline">
                              {claim.items?.title}
                            </Link>
                          </p>

                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                            "{claim.message}"
                          </p>

                          {claim.profiles?.email && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Contact: <a href={`mailto:${claim.profiles.email}`} className="text-primary hover:underline">{claim.profiles.email}</a>
                            </p>
                          )}
                        </div>

                        {claim.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleClaimAction(claim.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleClaimAction(claim.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
