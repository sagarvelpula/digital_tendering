
import { toast } from '@/components/ui/use-toast';

// Error handling utility
export const handleSupabaseError = (error: any, message: string = 'Operation failed') => {
  console.error(`Supabase Error: ${message}`, error);
  toast({
    title: 'Error',
    description: error?.message || message,
    variant: 'destructive',
  });
  return null;
};

// Base Types to match the Supabase schema
export type SupabaseTender = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  deadline: string | null;
  posted_by: string | null;
  value?: number;
  status?: string;
  requirements?: string[];
  created_at?: string;
};

export type SupabaseBid = {
  id: string;
  tender_id: string | null;
  vendor_id: string | null;
  amount: number | null;
  proposal?: string;
  status?: string;
  submitted_at: string | null;
  vendors?: {
    name: string;
  };
};
