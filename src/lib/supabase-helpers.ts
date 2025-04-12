
import { supabase } from '@/integrations/supabase/client';
import { Bid, Tender } from '@/context/TenderContext';
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

// Types to match the Supabase schema
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
    name: string 
  };
};

// TENDER OPERATIONS

export const fetchTenders = async (): Promise<Tender[]> => {
  try {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      throw error;
    }

    // Transform from Supabase schema to app schema
    return (data || []).map((tender: any) => ({
      id: tender.id || '',
      title: tender.title || '',
      description: tender.description || '',
      category: tender.category || 'Uncategorized',
      value: tender.value || 0,
      deadline: tender.deadline || new Date().toISOString().split('T')[0],
      status: tender.status || 'active',
      createdBy: tender.posted_by || '',
      createdAt: tender.created_at || new Date().toISOString(),
      requirements: tender.requirements || [],
    }));
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch tenders') || [];
  }
};

export const createTender = async (tender: Omit<Tender, 'id' | 'createdAt'>): Promise<Tender | null> => {
  try {
    // Transform to Supabase schema
    const supabaseTender: any = {
      title: tender.title,
      description: tender.description,
      category: tender.category,
      deadline: tender.deadline,
      posted_by: tender.createdBy,
      value: tender.value,
      status: tender.status,
      requirements: tender.requirements,
    };

    const { data, error } = await supabase
      .from('tenders')
      .insert(supabaseTender)
      .select()
      .single();

    if (error) throw error;
    
    // Transform back to app schema
    return {
      id: data.id || '',
      title: data.title || '',
      description: data.description || '',
      category: data.category || 'Uncategorized',
      value: data.value || 0,
      deadline: data.deadline || new Date().toISOString().split('T')[0],
      status: data.status || 'active',
      createdBy: data.posted_by || '',
      createdAt: data.created_at || new Date().toISOString(),
      requirements: data.requirements || [],
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to create tender');
  }
};

export const updateTender = async (id: string, updates: Partial<Tender>): Promise<Tender | null> => {
  try {
    // Transform to Supabase schema
    const supabaseUpdates: any = {};
    if (updates.title) supabaseUpdates.title = updates.title;
    if (updates.description) supabaseUpdates.description = updates.description;
    if (updates.category) supabaseUpdates.category = updates.category;
    if (updates.deadline) supabaseUpdates.deadline = updates.deadline;
    if (updates.value) supabaseUpdates.value = updates.value;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.requirements) supabaseUpdates.requirements = updates.requirements;

    const { data, error } = await supabase
      .from('tenders')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Transform back to app schema
    return {
      id: data.id || '',
      title: data.title || '',
      description: data.description || '',
      category: data.category || 'Uncategorized',
      value: data.value || 0,
      deadline: data.deadline || new Date().toISOString().split('T')[0],
      status: data.status || 'active',
      createdBy: data.posted_by || '',
      createdAt: data.created_at || new Date().toISOString(),
      requirements: data.requirements || [],
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to update tender');
  }
};

export const deleteTender = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tenders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete tender');
    return false;
  }
};

// BID OPERATIONS

export const fetchBids = async (): Promise<Bid[]> => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*, vendors:vendor_id(name)');

    if (error) throw error;

    return (data || []).map((bid: any) => ({
      id: bid.id || '',
      tenderId: bid.tender_id || '',
      vendorId: bid.vendor_id || '',
      vendorName: bid.vendors?.name || 'Unknown Vendor',
      amount: bid.amount || 0,
      proposal: bid.proposal || '',
      status: bid.status || 'pending',
      submittedAt: bid.submitted_at || new Date().toISOString(),
    }));
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch bids') || [];
  }
};

export const createBid = async (bid: Omit<Bid, 'id' | 'submittedAt' | 'status'>): Promise<Bid | null> => {
  try {
    // Transform to Supabase schema
    const supabaseBid: any = {
      tender_id: bid.tenderId,
      vendor_id: bid.vendorId,
      amount: bid.amount,
      proposal: bid.proposal,
      submitted_at: new Date().toISOString(),
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('bids')
      .insert(supabaseBid)
      .select('*, vendors:vendor_id(name)')
      .single();

    if (error) throw error;
    
    return {
      id: data.id || '',
      tenderId: data.tender_id || '',
      vendorId: data.vendor_id || '',
      vendorName: data.vendors?.name || 'Unknown Vendor',
      amount: data.amount || 0,
      proposal: data.proposal || '',
      status: data.status || 'pending',
      submittedAt: data.submitted_at || new Date().toISOString(),
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to submit bid');
  }
};

export const updateBid = async (id: string, updates: Partial<Bid>): Promise<Bid | null> => {
  try {
    // Transform to Supabase schema
    const supabaseUpdates: any = {};
    if (updates.amount) supabaseUpdates.amount = updates.amount;
    if (updates.proposal) supabaseUpdates.proposal = updates.proposal;
    if (updates.status) supabaseUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('bids')
      .update(supabaseUpdates)
      .eq('id', id)
      .select('*, vendors:vendor_id(name)')
      .single();

    if (error) throw error;
    
    return {
      id: data.id || '',
      tenderId: data.tender_id || '',
      vendorId: data.vendor_id || '',
      vendorName: data.vendors?.name || 'Unknown Vendor',
      amount: data.amount || 0,
      proposal: data.proposal || '',
      status: data.status || 'pending',
      submittedAt: data.submitted_at || new Date().toISOString(),
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to update bid');
  }
};

export const deleteBid = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bids')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return true;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete bid');
    return false;
  }
};

// USER PROFILE OPERATIONS
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch user profile');
  }
};
