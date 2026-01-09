import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Item, CATEGORY_LABELS, STATUS_LABELS } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  MapPin, Calendar, Mail, Phone, ArrowLeft, Edit, Trash2,
  CheckCircle, Loader2, MessageSquare, User
} from 'lucide-react';
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

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claimMessage, setClaimMessage] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  const fetchItem = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Item not found');
      navigate('/dashboard');
      return;
    }

    setItem(data as Item);

    // Fetch owner profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user_id)
      .single();

    setOwner(profile);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);

    const { error } = await supabase.from('items').delete().eq('id', item.id);

    if (error) {
      toast.error('Failed to delete item');
      setDeleting(false);
      return;
    }

    toast.success('Item deleted successfully');
    navigate('/dashboard');
  };

  const handleStatusChange = async (newStatus: 'lost' | 'found' | 'claimed' | 'recovered' | 'closed') => {
    if (!item) return;

    const { error } = await supabase
      .from('items')
      .update({ status: newStatus })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    setItem({ ...item, status: newStatus });
    toast.success('Status updated');
  };

  const handleSubmitClaim = async () => {
    if (!item || !user || !claimMessage.trim()) return;
    setSubmittingClaim(true);

    const { error } = await supabase.from('claims').insert([{
      item_id: item.id,
      claimer_id: user.id,
      message: claimMessage.trim(),
    }]);

    if (error) {
      toast.error('Failed to submit claim');
      setSubmittingClaim(false);
      return;
    }

    toast.success('Claim submitted successfully');
    setClaimMessage('');
    setSubmittingClaim(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!item) return null;

  const isOwner = user?.id === item.user_id;
  const canEdit = isOwner || isAdmin;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  📦
                </div>
              )}
            </div>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getStatusClass(item.status)}>
                        {STATUS_LABELS[item.status]}
                      </Badge>
                      <Badge variant="outline">{CATEGORY_LABELS[item.category]}</Badge>
                      {item.is_verified && (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-display text-2xl">{item.title}</CardTitle>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/edit/${item.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the item.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.description && (
                  <p className="text-muted-foreground">{item.description}</p>
                )}

                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(item.date_lost_found), 'MMMM d, yyyy')}</span>
                  </div>
                </div>

                {/* Status Change (for owner) */}
                {isOwner && item.status !== 'recovered' && item.status !== 'closed' && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.status === 'lost' && (
                        <Button variant="success" size="sm" onClick={() => handleStatusChange('recovered')}>
                          Mark as Recovered
                        </Button>
                      )}
                      {item.status === 'found' && (
                        <Button variant="success" size="sm" onClick={() => handleStatusChange('claimed')}>
                          Mark as Claimed
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange('closed')}>
                        Close Listing
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posted By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={owner?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {owner?.full_name?.charAt(0) || <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{owner?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">
                      Posted {format(new Date(item.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  {item.contact_email && (
                    <a
                      href={`mailto:${item.contact_email}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {item.contact_email}
                    </a>
                  )}
                  {item.contact_phone && (
                    <a
                      href={`tel:${item.contact_phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {item.contact_phone}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Claim Form (for non-owners) */}
            {user && !isOwner && item.status !== 'recovered' && item.status !== 'closed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Contact Owner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Describe why you believe this is your item or provide additional details..."
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    rows={4}
                    className="mb-4"
                  />
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleSubmitClaim}
                    disabled={!claimMessage.trim() || submittingClaim}
                  >
                    {submittingClaim && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            )}

            {!user && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">Sign in to contact the owner</p>
                  <Button variant="hero" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
