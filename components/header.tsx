import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({
  title = 'ダッシュボード',
  description = 'ログインしているユーザー向けのページです。',
}: HeaderProps) {
  const { user } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('サインアウトに失敗しました', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {user?.email ? <Text style={styles.meta}>ログイン中: {user.email}</Text> : null}
      </View>
      <Pressable style={styles.button} onPress={handleSignOut} accessibilityRole="button">
        <Text style={styles.buttonText}>サインアウト</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  textContainer: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
  },
  meta: {
    fontSize: 14,
    color: '#6B7280',
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
