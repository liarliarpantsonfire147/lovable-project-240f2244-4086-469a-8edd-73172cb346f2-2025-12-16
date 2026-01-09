import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemCategory, ItemStatus, CATEGORY_LABELS } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  category: z.enum(['electronics', 'documents', 'bags', 'clothing', 'accessories', 'keys', 'jewelry', 'sports', 'books', 'other']),
  description: z.string().max(1000).optional(),
  location: z.string().min(2, 'Location is required').max(200),
  date_lost_found: z.string(),
  status: z.enum(['lost', 'found']),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().max(20).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemFormProps {
  initialData?: Partial<FormValues> & { id?: string; image_url?: string };
  mode?: 'create' | 'edit';
}

export function ItemForm({ initialData, mode = 'create' }: ItemFormProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url || null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      category: initialData?.category || 'other',
      description: initialData?.description || '',
      location: initialData?.location || '',
      date_lost_found: initialData?.date_lost_found || new Date().toISOString().split('T')[0],
      status: initialData?.status || 'lost',
      contact_email: initialData?.contact_email || profile?.email || '',
      contact_phone: initialData?.contact_phone || profile?.phone || '',
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to post an item');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        title: values.title,
        category: values.category,
        location: values.location,
        date_lost_found: values.date_lost_found,
        status: values.status,
        user_id: user.id,
        image_url: imageUrl,
        contact_email: values.contact_email || null,
        contact_phone: values.contact_phone || null,
        description: values.description || null,
      };

      if (mode === 'edit' && initialData?.id) {
        const { user_id, ...updateData } = itemData;
        const { error } = await supabase
          .from('items')
          .update(updateData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Item updated successfully');
        navigate(`/item/${initialData.id}`);
      } else {
        const { data, error } = await supabase
          .from('items')
          .insert([itemData])
          .select()
          .single();

        if (error) throw error;
        toast.success('Item posted successfully');
        navigate(`/item/${data.id}`);
      }
    } catch (error: any) {
      toast.error('Error saving item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-display">
          {mode === 'edit' ? 'Edit Item' : 'Report an Item'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Status Toggle */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Status</FormLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={field.value === 'lost' ? 'lost' : 'outline'}
                      className="flex-1"
                      onClick={() => field.onChange('lost')}
                    >
                      I Lost Something
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'found' ? 'found' : 'outline'}
                      className="flex-1"
                      onClick={() => field.onChange('found')}
                    >
                      I Found Something
                    </Button>
                  </div>
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div>
              <FormLabel>Photo</FormLabel>
              <div className="mt-2 flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                    <img
                      src={imageUrl}
                      alt="Item preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl(null)}
                      className="absolute inset-0 bg-foreground/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <span className="text-background text-sm">Remove</span>
                    </button>
                  </div>
                ) : (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="mt-1 text-xs text-muted-foreground">Upload</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Black Leather Wallet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details that could help identify the item..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Library 2nd Floor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_lost_found"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 234 567 8900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={form.watch('status') === 'lost' ? 'lost' : 'found'}
                className="flex-1"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'edit' ? 'Update Item' : 'Post Item'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
