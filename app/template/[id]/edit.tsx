import { StackActions, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { nanoid } from 'nanoid/non-secure';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

type TemplateItemField = {
  fieldId: string;
  itemId?: string;
  title: string;
};

export default function TemplateEditScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const templateId = typeof params.id === 'string' ? params.id : undefined;
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<TemplateItemField[]>([]);
  const [initialItemIds, setInitialItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = name.trim().length > 0 && !submitting;

  const handleNavigateHome = useCallback(() => {
    if (router.canGoBack()) {
      navigation.dispatch(StackActions.popToTop());
    } else {
      router.replace('/(tabs)');
    }
  }, [navigation, router]);

  const handleNavigateToDetail = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else if (templateId) {
      router.replace(`/template/${templateId}`);
    } else {
      router.replace('/(tabs)');
    }
  }, [router, templateId]);

  const fetchTemplate = useCallback(async () => {
    if (!user || !templateId) {
      return;
    }

    const { data, error } = await supabase
      .from('templates')
      .select('id, name, description, items(id, title, sort_order)')
      .eq('user_id', user.id)
      .eq('id', templateId)
      .single();

    if (error || !data) {
      setErrorMessage(error?.message ?? 'テンプレートを取得できませんでした');
      setItems([{ fieldId: nanoid(), title: '' }]);
      return;
    }

    setName(data.name ?? '');
    setDescription(data.description ?? '');

    const templateItems = (data.items ?? []) as { id: string; title: string; sort_order?: number | null }[];
    const sortedItems = templateItems
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    if (sortedItems.length === 0) {
      setItems([{ fieldId: nanoid(), title: '' }]);
      setInitialItemIds([]);
    } else {
      setItems(
        sortedItems.map((item) => ({
          fieldId: item.id,
          itemId: item.id,
          title: item.title,
        })),
      );
      setInitialItemIds(sortedItems.map((item) => item.id));
    }
    setErrorMessage(null);
  }, [templateId, user]);

  useEffect(() => {
    setLoading(true);
    fetchTemplate().finally(() => setLoading(false));
  }, [fetchTemplate]);

  const handleAddItemField = () => {
    setItems((prev) => [...prev, { fieldId: nanoid(), title: '' }]);
  };

  const handleRemoveItemField = (fieldId: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.fieldId !== fieldId)));
  };

  const handleItemChange = (fieldId: string, value: string) => {
    setItems((prev) => prev.map((item) => (item.fieldId === fieldId ? { ...item, title: value } : item)));
  };

  const normalizedItems = useMemo(() => {
    return items
      .map((item, index) => ({
        itemId: item.itemId,
        title: item.title.trim(),
        sortOrder: index + 1,
      }))
      .filter((item) => item.title.length > 0);
  }, [items]);

  const handleSubmit = async () => {
    if (!user || !templateId) {
      Alert.alert('エラー', 'テンプレートが見つかりませんでした');
      return;
    }

    if (!isFormValid) return;

    setSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from('templates')
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      const existingPayload = normalizedItems
        .filter((item) => item.itemId)
        .map((item) => ({
          id: item.itemId!,
          title: item.title,
          sort_order: item.sortOrder,
          user_id: user.id,
          template_id: templateId,
        }));

      const newPayload = normalizedItems
        .filter((item) => !item.itemId)
        .map((item) => ({
          title: item.title,
          sort_order: item.sortOrder,
          user_id: user.id,
          template_id: templateId,
        }));

      const retainedIds = existingPayload.map((item) => item.id);
      const removedIds = initialItemIds.filter((id) => !retainedIds.includes(id));

      if (existingPayload.length > 0) {
        const { error: upsertError } = await supabase.from('items').upsert(existingPayload);
        if (upsertError) {
          throw upsertError;
        }
      }

      if (newPayload.length > 0) {
        const { error: insertError } = await supabase.from('items').insert(newPayload);
        if (insertError) {
          throw insertError;
        }
      }

      if (removedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('items')
          .delete()
          .eq('template_id', templateId)
          .in('id', removedIds);
        if (deleteError) {
          throw deleteError;
        }
      }

      handleNavigateToDetail();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'テンプレートの更新に失敗しました。';
      Alert.alert('エラー', message);
    } finally {
      setSubmitting(false);
    }
  };

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

  if (errorMessage) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorTitle}>テンプレートを取得できませんでした</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={handleNavigateHome}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Text style={styles.backButtonText}>ホームに戻る</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={32}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={handleNavigateHome}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
              <Text style={styles.backButtonText}>ホームに戻る</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleNavigateToDetail}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
              <Text style={styles.secondaryButtonText}>詳細へ戻る</Text>
            </Pressable>
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>テンプレートを編集</Text>
            <Text style={styles.subtitle}>名前・説明・アイテムを更新できます。</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>テンプレート名</Text>
            <TextInput
              placeholder="リリース前チェックリスト"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>説明</Text>
            <TextInput
              placeholder="このテンプレートの目的を入力してください"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.multilineInput]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.itemsGroup}>
            <Text style={styles.label}>アイテム</Text>
            {items.map((item, index) => (
              <View key={item.fieldId} style={styles.itemRow}>
                <TextInput
                  placeholder={`アイテム ${index + 1}`}
                  value={item.title}
                  onChangeText={(text) => handleItemChange(item.fieldId, text)}
                  style={[styles.input, styles.itemInput]}
                />
                {items.length > 1 ? (
                  <Pressable accessibilityRole="button" onPress={() => handleRemoveItemField(item.fieldId)}>
                    <Text style={styles.removeItemText}>削除</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            <Pressable accessibilityRole="button" onPress={handleAddItemField} style={styles.addItemButton}>
              <Text style={styles.addItemButtonText}>アイテムを追加</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleSubmit}
            disabled={!isFormValid}
            style={[styles.submitButton, (!isFormValid || submitting) && styles.submitButtonDisabled]}>
            <Text style={styles.submitButtonText}>{submitting ? '更新中...' : 'テンプレートを更新'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  multilineInput: {
    minHeight: 120,
  },
  itemsGroup: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemInput: {
    flex: 1,
  },
  removeItemText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  addItemButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  addItemButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
