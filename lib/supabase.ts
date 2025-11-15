import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type InventoryRow = {
  id: string;
  sku: string;
  name: string;
  current_stock: number;
  optimal_stock: number;
  unit: string;
  location: string;
  last_updated: string;
};

export type ReplenishmentOrderRow = {
  id: string;
  sku: string;
  item_name: string;
  current_stock: number;
  optimal_stock: number;
  quantity_to_order: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
};
