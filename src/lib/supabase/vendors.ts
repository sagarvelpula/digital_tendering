
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './core';
import { UserProfile } from './types/user-types';
import { Role } from '@/context/AuthContext';

export const fetchAllVendors = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'vendor');
    
    if (error) throw error;
    
    return (data || []).map(user => ({
      ...user,
      role: user.role as Role
    }));
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch vendors') || [];
  }
};

export const fetchVendorBidCount = async (vendorId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('bids')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId);
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch bid count');
    return 0;
  }
};
