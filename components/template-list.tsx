import { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

export type Template = {
  id: string;
  name: string;
  description: string | null;
};

export function TemplateList() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      return;
    }

    const { data, error } = await supabase
      .from('templates')
      .select('id, name, description')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      setTemplates([]);
      return;
    }

    setTemplates(data ?? []);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchTemplates().finally(() => setLoading(false));
  }, [fetchTemplates]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTemplates();
    setRefreshing(false);
  }, [fetchTemplates]);

  const listContentStyle =
    templates.length === 0
      ? [styles.listEmptyContent, { paddingBottom: Math.max(insets.bottom, 16) }]
      : { paddingBottom: Math.max(insets.bottom, 16) };

  const renderTemplate: ListRenderItem<Template> = ({ item }) => (
    <View style={styles.templateItem}>
      <Text style={styles.templateName}>{item.name}</Text>
      {item.description ? <Text style={styles.templateDescription}>{item.description}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.title}>テンプレート</Text>
        <Text style={styles.body}>データを読み込み中です…</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={templates}
      keyExtractor={(item) => item.id}
      renderItem={renderTemplate}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.subtitle}>テンプレートがありません</Text>
          <Text style={styles.body}>Supabase Studioなどからテンプレートを追加してください。</Text>
          <Button title="再読み込み" onPress={handleRefresh} />
        </View>
      }
      contentContainerStyle={listContentStyle}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  templateItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: 4,
  },
  templateName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  templateDescription: {
    fontSize: 15,
    color: '#4B5563',
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 8,
    alignItems: 'flex-start',
  },
  emptyState: {
    gap: 8,
    alignItems: 'flex-start',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    color: '#4B5563',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  centerContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
});
