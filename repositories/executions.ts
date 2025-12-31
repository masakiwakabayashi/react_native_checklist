import { supabase } from '@/lib/supabase';

export type ExecutionRecord = {
  id: string;
  item_id: string;
  checked: boolean;
};

export async function fetchExecutionsByItemIds(userId: string, itemIds: string[]) {
  if (itemIds.length === 0) {
    return [] as ExecutionRecord[];
  }

  const { data, error } = await supabase
    .from('executions')
    .select('id, item_id, checked')
    .eq('user_id', userId)
    .in('item_id', itemIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as ExecutionRecord[];
}

export async function updateExecutionChecked(params: {
  executionId: string;
  userId: string;
  checked: boolean;
}) {
  const { error } = await supabase
    .from('executions')
    .update({ checked: params.checked })
    .eq('id', params.executionId)
    .eq('user_id', params.userId);

  if (error) {
    throw error;
  }
}

export async function insertExecution(params: {
  userId: string;
  itemId: string;
  checked: boolean;
}) {
  const { data, error } = await supabase
    .from('executions')
    .insert({ user_id: params.userId, item_id: params.itemId, checked: params.checked })
    .select('id, checked')
    .single();

  if (error || !data) {
    throw error ?? new Error('チェック状態の保存に失敗しました');
  }

  return data;
}

export async function deleteExecutionsByItemIds(userId: string, itemIds: string[]) {
  if (itemIds.length === 0) return;

  const { error } = await supabase
    .from('executions')
    .delete()
    .eq('user_id', userId)
    .in('item_id', itemIds);

  if (error) {
    throw error;
  }
}
