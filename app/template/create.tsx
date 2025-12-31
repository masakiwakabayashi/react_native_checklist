import { StackActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { nanoid } from 'nanoid/non-secure';
import { useCallback, useMemo, useState } from 'react';
import {
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
import { insertTemplateItems } from '@/repositories/items';
import { createTemplate } from '@/repositories/templates';

type TemplateItemField = {
  id: string;
  title: string;
};

export default function TemplateCreateScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<TemplateItemField[]>([{ id: nanoid(), title: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const isFormValid = name.trim().length > 0 && !submitting;

  const handleNavigateHome = useCallback(() => {
    if (router.canGoBack()) {
      navigation.dispatch(StackActions.popToTop());
    } else {
      router.replace('/(tabs)');
    }
  }, [navigation, router]);

  const handleAddItemField = () => {
    setItems((prev) => [...prev, { id: nanoid(), title: '' }]);
  };

  const handleRemoveItemField = (id: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== id)));
  };

  const handleItemChange = (id: string, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, title: value } : item)));
  };

  const normalizedItems = useMemo(
    () =>
      items
        .map((item) => item.title.trim())
        .filter((title) => title.length > 0),
    [items],
  );

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('ログインが必要です', 'テンプレート作成にはログインしてください。');
      return;
    }

    if (!isFormValid) return;

    setSubmitting(true);

    try {
      const template = await createTemplate({
        userId: user.id,
        name: name.trim(),
        description: description.trim() || null,
      });

      if (normalizedItems.length > 0) {
        const itemsPayload = normalizedItems.map((title, index) => ({
          user_id: user.id,
          template_id: template.id,
          title,
          sort_order: index + 1,
        }));

        await insertTemplateItems(itemsPayload);
      }

      router.replace(`/template/${template.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'テンプレートの作成に失敗しました。';
      Alert.alert('エラー', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={32}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            onPress={handleNavigateHome}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
            <Text style={styles.backButtonText}>ホームに戻る</Text>
          </Pressable>
          <View style={styles.header}>
            <Text style={styles.title}>テンプレートを作成</Text>
            <Text style={styles.subtitle}>名前と説明、必要なチェックアイテムを入力してください。</Text>
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
              <View key={item.id} style={styles.itemRow}>
                <TextInput
                  placeholder={`アイテム ${index + 1}`}
                  value={item.title}
                  onChangeText={(text) => handleItemChange(item.id, text)}
                  style={[styles.input, styles.itemInput]}
                />
                {items.length > 1 ? (
                  <Pressable accessibilityRole="button" onPress={() => handleRemoveItemField(item.id)}>
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
            <Text style={styles.submitButtonText}>{submitting ? '作成中...' : 'テンプレートを作成'}</Text>
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
});
