import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

type TemplateDetail = {
  id: string;
  name: string;
  description: string | null;
  created_at?: string | null;
};

export default function TemplateDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const templateId = typeof params.id === 'string' ? params.id : undefined;
  const { user } = useAuth();
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    if (!user || !templateId) {
      setTemplate(null);
      return;
    }

    const { data, error } = await supabase
      .from('templates')
      .select('id, name, description, created_at')
      .eq('user_id', user.id)
      .eq('id', templateId)
      .single();

    if (error) {
      setTemplate(null);
      setErrorMessage(error.message);
      return;
    }

    setTemplate(data);
    setErrorMessage(null);
  }, [templateId, user]);

  useEffect(() => {
    setLoading(true);
    fetchTemplate().finally(() => setLoading(false));
  }, [fetchTemplate]);

  if (!templateId) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>テンプレートIDが指定されていません。</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!template) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorTitle}>テンプレートを取得できませんでした</Text>
        <Text style={styles.errorText}>{errorMessage ?? 'しばらくしてからもう一度お試しください。'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{template.name}</Text>
      {template.description ? <Text style={styles.description}>{template.description}</Text> : null}
      {template.created_at ? (
        <Text style={styles.meta}>作成日: {new Date(template.created_at).toLocaleString()}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  meta: {
    fontSize: 14,
    color: '#6B7280',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  errorText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
  },
});
