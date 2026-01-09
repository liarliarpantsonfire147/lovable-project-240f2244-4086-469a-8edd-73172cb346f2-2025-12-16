export type ItemStatus = 'lost' | 'found' | 'claimed' | 'recovered' | 'closed';
export type ItemCategory = 'electronics' | 'documents' | 'bags' | 'clothing' | 'accessories' | 'keys' | 'jewelry' | 'sports' | 'books' | 'other';
export type AppRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  category: ItemCategory;
  description: string | null;
  location: string;
  date_lost_found: string;
  image_url: string | null;
  status: ItemStatus;
  contact_email: string | null;
  contact_phone: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Claim {
  id: string;
  item_id: string;
  claimer_id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: Profile;
  items?: Item;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  electronics: 'Electronics',
  documents: 'Documents',
  bags: 'Bags & Luggage',
  clothing: 'Clothing',
  accessories: 'Accessories',
  keys: 'Keys',
  jewelry: 'Jewelry',
  sports: 'Sports Equipment',
  books: 'Books',
  other: 'Other',
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  lost: 'Lost',
  found: 'Found',
  claimed: 'Claimed',
  recovered: 'Recovered',
  closed: 'Closed',
};
