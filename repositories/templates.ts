import { supabase } from '@/lib/supabase';

export type TemplateSummary = {
  id: string;
  name: string;
  description: string | null;
};

export type TemplateDetailItem = {
  id: string;
  title: string;
  sort_order: number;
  created_at?: string | null;
};

export type TemplateDetail = {
  id: string;
  name: string;
  description: string | null;
  created_at?: string | null;
  items?: TemplateDetailItem[] | null;
};

export async function fetchTemplatesByUser(userId: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('id, name, description')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchTemplateDetail(userId: string, templateId: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('id, name, description, created_at, items(id, title, sort_order, created_at)')
    .eq('user_id', userId)
    .eq('id', templateId)
    .single();

  if (error) {
    throw error;
  }

  return data as TemplateDetail;
}

export async function createTemplate(params: {
  userId: string;
  name: string;
  description: string | null;
}) {
  const { data, error } = await supabase
    .from('templates')
    .insert({
      user_id: params.userId,
      name: params.name,
      description: params.description,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw error ?? new Error('テンプレートの作成に失敗しました');
  }

  return data;
}

export async function updateTemplate(params: {
  userId: string;
  templateId: string;
  name: string;
  description: string | null;
}) {
  const { error } = await supabase
    .from('templates')
    .update({
      name: params.name,
      description: params.description,
    })
    .eq('id', params.templateId)
    .eq('user_id', params.userId);

  if (error) {
    throw error;
  }
}
