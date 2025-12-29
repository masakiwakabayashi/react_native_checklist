import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

type Template = {
  id: string;
  name: string;
  description: string | null;
};

export default function HomeScreen() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setErrorMessage(null);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      setTemplates([]);
      setErrorMessage(error.message);
      return;
    }

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
  }, []);

  useEffect(() => {
    fetchTemplates().finally(() => setLoading(false));
  }, [fetchTemplates]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTemplates();
    setRefreshing(false);
  }, [fetchTemplates]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('サインアウトに失敗しました', error.message);
    }
  };

  const renderTemplate: ListRenderItem<Template> = ({ item }) => (
    <View style={styles.templateItem}>
      <Text style={styles.templateName}>{item.name}</Text>
      {item.description ? <Text style={styles.templateDescription}>{item.description}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>テンプレート</Text>
          <Text style={styles.body}>データを読み込み中です…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={renderTemplate}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>テンプレート</Text>
            <Text style={styles.body}>ユーザーのテンプレート一覧です。</Text>
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.subtitle}>テンプレートがありません</Text>
            <Text style={styles.body}>Supabase Studioなどからテンプレートを追加してください。</Text>
            <Button title="再読み込み" onPress={handleRefresh} />
          </View>
        }
        // contentContainerStyle={templates.length === 0 ? styles.listEmptyContent : styles.listContent}
        // ListFooterComponent={
        //   <View style={styles.accountCard}>
        //     <Text style={styles.subtitle}>Account</Text>
        //     <Text style={styles.body}>Supabaseの認証情報でログイン中です。</Text>
        //     <Button title="サインアウト" onPress={handleSignOut} />
        //   </View>
        // }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
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
  listContent: {
    paddingBottom: 32,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 32,
  },
  emptyState: {
    gap: 8,
    alignItems: 'flex-start',
  },
  accountCard: {
    marginTop: 32,
    gap: 12,
  },
  centerContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
});
