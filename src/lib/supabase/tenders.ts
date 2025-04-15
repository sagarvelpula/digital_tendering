
import { supabase } from '@/integrations/supabase/client';
import { Tender } from '@/context/TenderContext';
import { handleSupabaseError, SupabaseTender } from './core';

export const fetchTenders = async (): Promise<Tender[]> => {
  try {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) throw error;

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
    const supabaseTender: Partial<SupabaseTender> = {
      title: tender.title,
      description: tender.description,
      category: tender.category,
      deadline: tender.deadline,
      posted_by: tender.createdBy,
      value: tender.value,
      status: tender.status,
      requirements: tender.requirements,
    };

    const { data: rawData, error } = await supabase
      .from('tenders')
      .insert(supabaseTender)
      .select()
      .single();

    if (error) throw error;
    
    const data = rawData as any;
    
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
    const supabaseUpdates: Partial<SupabaseTender> = {};
    if (updates.title) supabaseUpdates.title = updates.title;
    if (updates.description) supabaseUpdates.description = updates.description;
    if (updates.category) supabaseUpdates.category = updates.category;
    if (updates.deadline) supabaseUpdates.deadline = updates.deadline;
    if (updates.value) supabaseUpdates.value = updates.value;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.requirements) supabaseUpdates.requirements = updates.requirements;

    const { data: rawData, error } = await supabase
      .from('tenders')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    const data = rawData as any;
    
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
