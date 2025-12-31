import { StackActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

type TemplateItem = {
  id: string;
  title: string;
  sort_order: number;
  created_at?: string | null;
};

type TemplateDetail = {
  id: string;
  name: string;
  description: string | null;
  created_at?: string | null;
  items?: TemplateItem[] | null;
};

export default function TemplateDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const templateId = typeof params.id === 'string' ? params.id : undefined;
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sortedItems = useMemo(() => {
    if (!template?.items) {
      return [];
    }

    return template.items.slice().sort((a, b) => {
      if (!a.created_at || !b.created_at) return a.title.localeCompare(b.title);
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [template?.items]);

  const fetchTemplate = useCallback(async () => {
    if (!user || !templateId) {
      setTemplate(null);
      return;
    }

    const { data, error } = await supabase
      .from('templates')
      .select('id, name, description, created_at, items(id, title, sort_order, created_at)')
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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setLoading(true);
      fetchTemplate().finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

      return () => {
        isActive = false;
      };
    }, [fetchTemplate]),
  );

  const handleGoHome = useCallback(() => {
    if (router.canGoBack()) {
      navigation.dispatch(StackActions.popToTop());
    } else {
      router.replace('/(tabs)');
    }
  }, [navigation, router]);

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
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          onPress={handleGoHome}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Text style={styles.backButtonText}>ホームに戻る</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/template/${templateId}/edit`)}
          style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}>
          <Text style={styles.editButtonText}>テンプレートを編集</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/template/${templateId}/run`)}
          style={({ pressed }) => [styles.runButton, pressed && styles.runButtonPressed]}>
          <Text style={styles.runButtonText}>チェックリストを開始</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{template.name}</Text>
      {template.description ? <Text style={styles.description}>{template.description}</Text> : null}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>項目一覧</Text>
        {sortedItems.length === 0 ? (
          <Text style={styles.emptyItems}>項目が登録されていません。</Text>
        ) : (
          sortedItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemTitle}>{item.sort_order}. {item.title}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
  },
  runButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  editButtonPressed: {
    opacity: 0.7,
  },
  runButtonPressed: {
    opacity: 0.8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  editButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  runButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  itemsSection: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptyItems: {
    fontSize: 15,
    color: '#6B7280',
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemMeta: {
    fontSize: 13,
    color: '#9CA3AF',
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
