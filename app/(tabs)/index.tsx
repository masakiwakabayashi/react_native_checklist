import { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

type Template = {
  id: string;
  name: string;
  description: string | null;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setErrorMessage(null);
    if (!user) {
      setTemplates([]);
      return;
    }

    const { data, error: templatesError } = await supabase
      .from('templates')
      .select('id, name, description')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (templatesError) {
      setTemplates([]);
      setErrorMessage(templatesError.message);
      return;
    }

    setTemplates(data ?? []);
  }, [user]);

  useEffect(() => {
    fetchTemplates().finally(() => setLoading(false));
  }, [fetchTemplates]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTemplates();
    setRefreshing(false);
  }, [fetchTemplates]);

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

  const bottomPadding = Math.max(insets.bottom, 16);
  const listContentStyle =
    templates.length === 0
      ? [styles.listEmptyContent, { paddingBottom: bottomPadding }]
      : { paddingBottom: bottomPadding };

  return (
    <View style={styles.screen}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  list: {
    flex: 1,
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
  header: {
    marginBottom: 16,
    gap: 6,
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
  error: {
    marginTop: 8,
    color: '#DC2626',
    fontSize: 14,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    gap: 8,
    alignItems: 'flex-start',
  },
  centerContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
});
