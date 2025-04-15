
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
    
    return data || [];
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
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    return handleSupabaseError(error, 'Failed to update user profile');
  }
};

export const submitSupportMessage = async (userId: string, message: string, subject: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('support_messages')
      .insert({
        user_id: userId,
        message,
        subject
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
