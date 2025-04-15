
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './core';
import { UserProfile, UserProfileUpdate } from './types/user-types';
import { Role } from '@/context/AuthContext';

export const updateUserStatus = async (userId: string, status: 'active' | 'banned'): Promise<boolean> => {
  try {
    const { data: userWithStatus, error: checkError } = await supabase
      .from('users')
      .select('id, status')
      .eq('id', userId)
      .single();
    
    if (checkError && !checkError.message.includes('not found')) throw checkError;
    
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update user status');
    return false;
  }
};

export const updateUserProfile = async (userId: string, updates: UserProfileUpdate): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) return null;

    return {
      ...data[0],
      role: data[0].role as Role
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to update user profile');
  }
};
