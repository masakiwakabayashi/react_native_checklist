import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Alert, StyleSheet, Text, View } from 'react-native';

export function Header() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('サインアウトに失敗しました', error.message);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Text>共通ヘッダー</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
  },
  headerContent: {
    height: 56,
    justifyContent: 'center',
  },
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
