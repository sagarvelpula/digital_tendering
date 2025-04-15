
import { supabase } from '@/integrations/supabase/client';
import { Bid } from '@/context/TenderContext';
import { handleSupabaseError, SupabaseBid } from './core';

export const fetchBids = async (): Promise<Bid[]> => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*, users:vendor_id(name)');

    if (error) throw error;

    return (data || []).map((bid: any) => ({
      id: bid.id || '',
      tenderId: bid.tender_id || '',
      vendorId: bid.vendor_id || '',
      vendorName: bid.users?.name || 'Unknown Vendor',
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
    const supabaseBid: Partial<SupabaseBid> = {
      tender_id: bid.tenderId,
      vendor_id: bid.vendorId,
      amount: bid.amount,
      proposal: bid.proposal,
      submitted_at: new Date().toISOString(),
      status: 'pending'
    };

    const { data: rawData, error } = await supabase
      .from('bids')
      .insert(supabaseBid)
      .select('*, vendors:vendor_id(name)')
      .single();

    if (error) throw error;
    
    const data = rawData as any;
    
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
    const supabaseUpdates: Partial<SupabaseBid> = {};
    if (updates.amount) supabaseUpdates.amount = updates.amount;
    if (updates.proposal) supabaseUpdates.proposal = updates.proposal;
    if (updates.status) supabaseUpdates.status = updates.status;

    const { data: rawData, error } = await supabase
      .from('bids')
      .update(supabaseUpdates)
      .eq('id', id)
      .select('*, vendors:vendor_id(name)')
      .single();

    if (error) throw error;
    
    const data = rawData as any;
    
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
