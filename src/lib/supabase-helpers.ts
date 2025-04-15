export * from './supabase/core';
export * from './supabase/tenders';
export * from './supabase/bids';
export * from './supabase/users';

// Keep the user profile operations in this file for now since they're simpler
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './supabase/core';
import { Role } from '@/context/AuthContext';
import { UserProfile } from './supabase/types/user-types';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Ensure role is properly cast to Role type
    return {
      ...data,
      role: data.role as Role
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch user profile');
  }
};
