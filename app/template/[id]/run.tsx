import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

type TemplateItem = {
  id: string;
  title: string;
  sort_order?: number | null;
};

type TemplateMeta = {
  id: string;
  name: string;
  description: string | null;
};

type ExecutionState = Record<string, { executionId?: string; checked: boolean }>;
type LocalState = Record<string, { checked: boolean }>;

export default function TemplateRunScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const templateId = typeof params.id === 'string' ? params.id : undefined;
  const { user } = useAuth();
  const router = useRouter();

  const [template, setTemplate] = useState<TemplateMeta | null>(null);
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [executionState, setExecutionState] = useState<ExecutionState>({});
  const [localState, setLocalState] = useState<LocalState>({});
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [resetting, setResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchChecklist = useCallback(async () => {
    if (!user || !templateId) {
      setTemplate(null);
      setItems([]);
      setExecutionState({});
      setLocalState({});
      return;
    }

    const { data, error } = await supabase
      .from('templates')
      .select('id, name, description, items(id, title, sort_order)')
      .eq('user_id', user.id)
      .eq('id', templateId)
      .single();

    if (error || !data) {
      setTemplate(null);
      setItems([]);
      setExecutionState({});
      setErrorMessage(error?.message ?? 'テンプレートが見つかりませんでした');
      return;
    }

    const templateItems = (data.items ?? []) as TemplateItem[];
    const orderedItems = templateItems
      .slice()
      .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER));

    setTemplate({ id: data.id, name: data.name, description: data.description });
    setItems(orderedItems);
    setErrorMessage(null);

    if (orderedItems.length > 0) {
      const itemIds = orderedItems.map((item) => item.id);
      const { data: executions, error: executionsError } = await supabase
        .from('executions')
        .select('id, item_id, checked')
        .eq('user_id', user.id)
        .in('item_id', itemIds);

      if (executionsError) {
        setExecutionState(
          orderedItems.reduce((acc, item) => {
            acc[item.id] = { checked: false };
            return acc;
          }, {} as ExecutionState),
        );
        return;
      }

      const map = orderedItems.reduce((acc, item) => {
        acc[item.id] = { checked: false };
        return acc;
      }, {} as ExecutionState);

      executions?.forEach((execution) => {
        if (map[execution.item_id]) {
          map[execution.item_id] = {
            executionId: execution.id,
            checked: execution.checked,
          };
        }
      });

      setExecutionState(map);
      setLocalState(
        orderedItems.reduce((acc, item) => {
          acc[item.id] = { checked: map[item.id]?.checked ?? false };
          return acc;
        }, {} as LocalState),
      );
    } else {
      setExecutionState({});
      setLocalState({});
    }
  }, [templateId, user]);

  useEffect(() => {
    setLoading(true);
    fetchChecklist().finally(() => setLoading(false));
  }, [fetchChecklist]);

  const handleToggle = useCallback((itemId: string) => {
    setLocalState((prev) => ({
      ...prev,
      [itemId]: { checked: !prev[itemId]?.checked },
    }));
  }, []);

  const handleApplyChanges = useCallback(async () => {
    if (!user || !templateId) return;
    const updates = items.map((item) => ({
      itemId: item.id,
      executionId: executionState[item.id]?.executionId,
      remoteChecked: executionState[item.id]?.checked ?? false,
      localChecked: localState[item.id]?.checked ?? false,
    }));
    setUpdatingIds((prev) => items.reduce((acc, item) => ({ ...acc, [item.id]: true }), prev));

    try {
      for (const update of updates) {
        if (update.executionId) {
          if (update.remoteChecked === update.localChecked) {
            continue;
          }
          const { error } = await supabase
            .from('executions')
            .update({ checked: update.localChecked })
            .eq('id', update.executionId)
            .eq('user_id', user.id);
          if (error) throw error;
          setExecutionState((prev) => ({
            ...prev,
            [update.itemId]: { executionId: update.executionId, checked: update.localChecked },
          }));
        } else if (update.localChecked) {
          const { data, error } = await supabase
            .from('executions')
            .insert({ user_id: user.id, item_id: update.itemId, checked: true })
            .select('id, checked')
            .single();
          if (error || !data) throw error ?? new Error('チェック状態の保存に失敗しました');
          setExecutionState((prev) => ({
            ...prev,
            [update.itemId]: { executionId: data.id, checked: true },
          }));
        } else {
          setExecutionState((prev) => ({
            ...prev,
            [update.itemId]: { executionId: undefined, checked: false },
          }));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新に失敗しました。';
      Alert.alert('エラー', message);
    } finally {
      setUpdatingIds({});
    }
  }, [executionState, items, localState, templateId, user]);

  const handleReset = useCallback(async () => {
    if (!user || items.length === 0) return;
    setResetting(true);
    try {
      const itemIds = items.map((item) => item.id);
      const { error } = await supabase
        .from('executions')
        .delete()
        .eq('user_id', user.id)
        .in('item_id', itemIds);
      if (error) throw error;
      const resetState = items.reduce((acc, item) => {
        acc[item.id] = { checked: false };
        return acc;
      }, {} as ExecutionState);
      setExecutionState(resetState);
      setLocalState(
        items.reduce((acc, item) => {
          acc[item.id] = { checked: false };
          return acc;
        }, {} as LocalState),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'リセットに失敗しました。';
      Alert.alert('エラー', message);
    } finally {
      setResetting(false);
    }
  }, [items, user]);

  if (!templateId) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>テンプレートIDが正しくありません。</Text>
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
        <Text style={styles.errorTitle}>テンプレートを読み込めませんでした</Text>
        <Text style={styles.errorText}>{errorMessage ?? 'しばらくしてからお試しください。'}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)')}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Text style={styles.backButtonText}>ホームに戻る</Text>
        </Pressable>
      </View>
    );
  }

  const totalItems = items.length;
  const completedCount = totalItems === 0 ? 0 : items.reduce((count, item) => (localState[item.id]?.checked ? count + 1 : count), 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)')}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Text style={styles.backButtonText}>ホームに戻る</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace(`/template/${template.id}`)}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
          <Text style={styles.secondaryButtonText}>詳細に戻る</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{template.name}</Text>
      {template.description ? <Text style={styles.description}>{template.description}</Text> : null}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          完了 {completedCount} / {totalItems}
        </Text>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: totalItems === 0 ? '0%' : `${(completedCount / totalItems) * 100}%`,
              },
            ]}
          />
        </View>
        <View style={styles.progressActions}>
          <Pressable
            accessibilityRole="button"
            onPress={handleReset}
            disabled={resetting || totalItems === 0}
            style={({ pressed }) => [
              styles.resetButton,
              (resetting || totalItems === 0) && styles.resetButtonDisabled,
              pressed && styles.resetButtonPressed,
            ]}>
            <Text style={styles.resetButtonText}>{resetting ? 'リセット中...' : '進捗をリセット'}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.itemsSection}>
        {items.length === 0 ? (
          <Text style={styles.emptyItems}>このテンプレートにはアイテムがありません。</Text>
        ) : (
          items.map((item, index) => {
            const isChecked = localState[item.id]?.checked ?? false;
            const isUpdating = updatingIds[item.id];
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => handleToggle(item.id)}
                disabled={isUpdating}
                style={({ pressed }) => [styles.itemRow, pressed && styles.itemRowPressed]}>
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked ? <Text style={styles.checkboxMark}>✓</Text> : null}
                </View>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, isChecked && styles.itemTitleChecked]}>
                    {item.sort_order ?? index + 1}. {item.title}
                  </Text>
                  {isUpdating ? <Text style={styles.itemMeta}>更新中...</Text> : null}
                </View>
              </Pressable>
            );
          })
        )}
      </View>
      <View style={styles.centerContent}>
        <Pressable
          accessibilityRole="button"
          onPress={handleApplyChanges}
          disabled={totalItems === 0}
          style={({ pressed }) => [styles.applyButton, pressed && styles.applyButtonPressed]}>
          <Text style={styles.applyButtonText}>更新</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
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
  progressContainer: {
    gap: 12,
  },
  progressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
  },
  resetButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonPressed: {
    opacity: 0.7,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemsSection: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  itemRowPressed: {
    backgroundColor: '#F3F4F6',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxMark: {
    color: '#fff',
    fontWeight: '700',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#111827',
  },
  itemTitleChecked: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  itemMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyItems: {
    fontSize: 15,
    color: '#6B7280',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
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
  },
  errorText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
  },
});
