import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ItemForm } from '@/components/items/ItemForm';
import { Item } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function EditItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (id && user) {
      fetchItem();
    }
  }, [id, user, authLoading, navigate]);

  const fetchItem = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Item not found');
      navigate('/my-items');
      return;
    }

    // Check ownership
    if (data.user_id !== user?.id && !isAdmin) {
      toast.error('You do not have permission to edit this item');
      navigate('/my-items');
      return;
    }

    setItem(data as Item);
    setLoading(false);
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

  if (!item) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ItemForm
          mode="edit"
          initialData={{
            id: item.id,
            title: item.title,
            category: item.category,
            description: item.description || '',
            location: item.location,
            date_lost_found: item.date_lost_found,
            status: item.status as 'lost' | 'found',
            contact_email: item.contact_email || '',
            contact_phone: item.contact_phone || '',
            image_url: item.image_url || undefined,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
