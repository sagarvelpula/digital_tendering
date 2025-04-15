
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './core';
import { Role } from '@/context/AuthContext';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
  photo_url?: string;
  company?: string;
  categories?: string[];
  email_notifications?: boolean;
};

export const fetchAllVendors = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'vendor');
    
    if (error) throw error;
    
    // Convert string role to Role type
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

export const updateUserStatus = async (userId: string, status: 'active' | 'banned'): Promise<boolean> => {
  try {
    // First, check if the status column exists
    const { data: userWithStatus, error: checkError } = await supabase
      .from('users')
      .select('id, status')
      .eq('id', userId)
      .single();
    
    if (checkError && !checkError.message.includes('not found')) throw checkError;
    
    // If we get here and there's no error, it means the status column exists
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

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    // Make sure we only update fields that exist in the database table
    const dbSafeUpdates = {
      name: updates.name,
      email: updates.email,
      company: updates.company,
      photo_url: updates.photo_url,
      categories: updates.categories,
      email_notifications: updates.email_notifications,
      status: updates.status
    };

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(dbSafeUpdates).filter(([_, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('users')
      .update(filteredUpdates)
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

export const submitSupportMessage = async (userId: string, message: string, subject: string): Promise<boolean> => {
  try {
    // First let's create a support_messages table if it doesn't exist
    // Since we can't access it directly from Supabase.js client,
    // we'll have to use a workaround and store it in another table

    const { error } = await supabase
      .from('notifications')  // Use notifications table instead
      .insert({
        user_id: userId,
        message: `Support request: ${subject} - ${message}`,
        is_read: false
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    handleSupabaseError(error, 'Failed to submit support message');
    return false;
  }
};

export const fetchNotifications = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch notifications') || [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    handleSupabaseError(error, 'Failed to mark notification as read');
    return false;
  }
};
