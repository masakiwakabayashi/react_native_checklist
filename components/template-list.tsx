import { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { fetchTemplatesByUser } from '@/repositories/templates';

export type Template = {
  id: string;
  name: string;
  description: string | null;
};

export function TemplateList() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      return;
    }

    try {
      const data = await fetchTemplatesByUser(user.id);
      setTemplates(data);
    } catch {
      setTemplates([]);
    }
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

  const listContentStyle = {
    paddingBottom: Math.max(insets.bottom, 16),
    paddingTop: 12,
  };

  const handleSelectTemplate = useCallback(
    (templateId: string) => {
      router.push(`/template/${templateId}`);
    },
    [router],
  );

  const renderTemplate: ListRenderItem<Template> = ({ item }) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => handleSelectTemplate(item.id)}
      style={({ pressed }) => [styles.templateItem, pressed && styles.templateItemPressed]}>
      <Text style={styles.templateName}>{item.name}</Text>
      {item.description ? <Text style={styles.templateDescription}>{item.description}</Text> : null}
    </Pressable>
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
      ListHeaderComponent={
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/template/create')}
          style={({ pressed }) => [styles.createButton, pressed && styles.templateItemPressed]}>
          <Text style={styles.createButtonText}>テンプレートを作成</Text>
        </Pressable>
      }
      ListHeaderComponentStyle={styles.listHeader}
      ListEmptyComponent={
        <View style={styles.emptyStateWrapper}>
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
  templateItemPressed: {
    backgroundColor: '#F3F4F6',
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
  listHeader: {
    marginBottom: 12,
  },
  createButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
    textAlign: 'center',
  },
  emptyStateWrapper: {
    flexGrow: 1,
    minHeight: 240,
    justifyContent: 'center',
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
