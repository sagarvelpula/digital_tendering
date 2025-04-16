
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './core';
import { UserProfile, UserProfileUpdate } from './types/user-types';
import { Role } from '@/context/AuthContext';

export const updateUserStatus = async (userId: string, status: 'active' | 'banned'): Promise<boolean> => {
  try {
    // Instead of directly updating a non-existent status field,
    // we'll use a metadata field to store this information
    const { error } = await supabase
      .from('users')
      .update({ 
        // Store status in metadata or use an appropriate existing field
        // based on your database schema and requirements
        role: status === 'banned' ? 'banned' : 'vendor' 
      })
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
    // Filter out any updates that don't match the database schema
    const supabaseUpdates: any = {};
    
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.email !== undefined) supabaseUpdates.email = updates.email;
    if (updates.role !== undefined) supabaseUpdates.role = updates.role;
    // Remove the status update as it's not in the schema
    // We'll handle status via role field (vendor/banned)
    
    // Note: For other fields like company, etc. we would need to store them in a separate profile table
    // since they don't exist in the users table schema

    const { data, error } = await supabase
      .from('users')
      .update(supabaseUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    // Map database fields to UserProfile type, setting appropriate defaults
    return {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      role: data.role as Role, // Fix TypeScript error by explicitly casting to Role type
      // Determine status based on role field
      status: data.role === 'banned' ? 'banned' : 'active',
      company: '', // Default since it's not in the database
      categories: [], // Default since it's not in the database
      email_notifications: true, // Default since it's not in the database
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to update user profile');
  }
};
