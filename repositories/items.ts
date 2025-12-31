import { supabase } from '@/lib/supabase';

export type TemplateItemUpsert = {
  id: string;
  title: string;
  sort_order: number;
  user_id: string;
  template_id: string;
};

export type TemplateItemInsert = {
  title: string;
  sort_order: number;
  user_id: string;
  template_id: string;
};

export async function upsertTemplateItems(items: TemplateItemUpsert[]) {
  if (items.length === 0) return;

  const { error } = await supabase.from('items').upsert(items);
  if (error) {
    throw error;
  }
}

export async function insertTemplateItems(items: TemplateItemInsert[]) {
  if (items.length === 0) return;

  const { error } = await supabase.from('items').insert(items);
  if (error) {
    throw error;
  }
}

export async function deleteTemplateItems(templateId: string, itemIds: string[]) {
  if (itemIds.length === 0) return;

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('template_id', templateId)
    .in('id', itemIds);

  if (error) {
    throw error;
  }
}
