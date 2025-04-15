
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './core';

export const submitSupportMessage = async (userId: string, message: string, subject: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
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
