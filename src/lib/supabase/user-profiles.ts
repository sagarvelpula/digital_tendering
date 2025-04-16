
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './core';
import { UserProfile, UserProfileUpdate } from './types/user-types';

export const updateUserProfile = async (userId: string, updates: UserProfileUpdate): Promise<UserProfile | null> => {
  try {
    // Filter out any updates that don't match the database schema
    const supabaseUpdates: any = {};
    
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.email !== undefined) supabaseUpdates.email = updates.email;
    if (updates.role !== undefined) supabaseUpdates.role = updates.role;
    
    // Note: For other fields like status, company, etc. we would need to store them in a separate profile table
    // since they don't exist in the users table schema

    const { data, error } = await supabase
      .from('users')
      .update(supabaseUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      role: data.role,
      status: 'active', // Default since it's not in the database
      company: '', // Default since it's not in the database
      categories: [], // Default since it's not in the database
      email_notifications: true, // Default since it's not in the database
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to update user profile');
  }
};
